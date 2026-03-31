"""
Authentication and payment views for The Immaterium.
Handles: register, Google OAuth, me, logout, Stripe checkout, webhook, purchases.
"""
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile, GuidePurchase, PaintingGuide


# ── helpers ──────────────────────────────────────────────────────────────────

def _serialize_user(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.id,
        'email': user.email,
        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'username': user.username,
        'isAdmin': user.is_staff or user.is_superuser,
        'avatarUrl': profile.avatar_url if profile else '',
        'createdAt': user.date_joined.isoformat(),
    }


def _get_purchases(user):
    return list(GuidePurchase.objects.filter(user=user).values_list('guide_id', flat=True))


# ── register ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')
    name = request.data.get('name', '').strip()

    if not email or not password:
        return Response({'error': 'Email y contraseña son obligatorios'}, status=400)

    if len(password) < 6:
        return Response({'error': 'La contraseña debe tener al menos 6 caracteres'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Este email ya está registrado'}, status=400)

    # Generate a unique username from email
    base_username = email.split('@')[0][:30]
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    parts = name.split(' ', 1)
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=parts[0] if parts else '',
        last_name=parts[1] if len(parts) > 1 else '',
    )
    UserProfile.objects.create(user=user)
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': _serialize_user(user),
        'purchases': [],
    }, status=201)


# ── email login (user-facing, accepts email) ─────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_email_view(request):
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email y contraseña son obligatorios'}, status=400)

    # Look up user by email
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Email o contraseña incorrectos'}, status=400)

    user = authenticate(username=user_obj.username, password=password)
    if not user:
        return Response({'error': 'Email o contraseña incorrectos'}, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': _serialize_user(user),
        'purchases': _get_purchases(user),
    })


# ── Google OAuth ──────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    credential = request.data.get('credential', '')
    if not credential:
        return Response({'error': 'No se proporcionó credencial'}, status=400)

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        google_id = idinfo['sub']
        email = idinfo.get('email', '').lower().strip()
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')

        # Try to find existing profile by google_id
        try:
            profile = UserProfile.objects.select_related('user').get(google_id=google_id)
            user = profile.user
        except UserProfile.DoesNotExist:
            # Try to find user by email
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': _unique_username(email),
                    'first_name': name.split(' ', 1)[0],
                    'last_name': name.split(' ', 1)[1] if ' ' in name else '',
                }
            )
            if created:
                user.set_unusable_password()
                user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.google_id = google_id
            profile.avatar_url = picture
            profile.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': _serialize_user(user),
            'purchases': _get_purchases(user),
        })

    except ValueError as e:
        return Response({'error': f'Token de Google inválido: {str(e)}'}, status=400)
    except ImportError:
        return Response({'error': 'Google auth no está configurado en el servidor'}, status=500)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def _unique_username(email):
    base = email.split('@')[0][:30]
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username


# ── me ────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({
        'user': _serialize_user(request.user),
        'purchases': _get_purchases(request.user),
    })


# ── logout ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'status': 'ok'})


# ── Stripe checkout ───────────────────────────────────────────────────────────

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    guide_id = request.data.get('guide_id')
    if not guide_id:
        return Response({'error': 'guide_id es obligatorio'}, status=400)

    try:
        guide = PaintingGuide.objects.get(id=guide_id)
    except PaintingGuide.DoesNotExist:
        return Response({'error': 'Guía no encontrada'}, status=404)

    if not guide.is_premium or not guide.price:
        return Response({'error': 'Esta guía no es de pago'}, status=400)

    if GuidePurchase.objects.filter(user=request.user, guide=guide).exists():
        return Response({'error': 'Ya tienes acceso a esta guía'}, status=400)

    if not settings.STRIPE_SECRET_KEY:
        return Response({'error': 'Stripe no está configurado en el servidor'}, status=500)

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY

        frontend_url = settings.FRONTEND_URL.rstrip('/')
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': guide.title,
                        'description': f'Guía de pintura premium: {guide.title}',
                        **(({'images': [guide.cover_image]} if guide.cover_image else {})),
                    },
                    'unit_amount': guide.price,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{frontend_url}/guides/{guide.id}',
            metadata={
                'guide_id': str(guide.id),
                'user_id': str(request.user.id),
            },
            customer_email=request.user.email,
        )
        return Response({'checkout_url': session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── Stripe webhook ────────────────────────────────────────────────────────────

@csrf_exempt
def stripe_webhook(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    if not settings.STRIPE_SECRET_KEY:
        return HttpResponse(status=400)

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY

        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        if settings.STRIPE_WEBHOOK_SECRET:
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
                )
            except (ValueError, stripe.error.SignatureVerificationError):
                return HttpResponse(status=400)
        else:
            # No webhook secret configured — accept all (dev only)
            import json
            event = json.loads(payload)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            guide_id = session.get('metadata', {}).get('guide_id')
            user_id = session.get('metadata', {}).get('user_id')

            if guide_id and user_id:
                try:
                    guide = PaintingGuide.objects.get(id=guide_id)
                    user = User.objects.get(id=int(user_id))
                    GuidePurchase.objects.get_or_create(
                        user=user,
                        guide=guide,
                        defaults={
                            'stripe_session_id': session['id'],
                            'stripe_payment_intent': session.get('payment_intent', '') or '',
                            'amount_paid': session.get('amount_total', 0) or 0,
                        }
                    )
                except (PaintingGuide.DoesNotExist, User.DoesNotExist, Exception):
                    pass  # Log in production

        return HttpResponse(status=200)

    except Exception:
        return HttpResponse(status=500)


# ── my purchases ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_purchases(request):
    return Response({
        'purchases': _get_purchases(request.user),
    })
