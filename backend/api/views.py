from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import F
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment,
    UserLike, UserFavorite, LoreEntry, NewsArticle, Game
)
from .serializers import (
    ArmySerializer, PaintingGuideSerializer, BattleReportSerializer,
    CommentSerializer, UserLikeSerializer, UserFavoriteSerializer,
    LoreEntrySerializer, NewsArticleSerializer, GameSerializer
)

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameSerializer
    lookup_field = 'id'

    def get_queryset(self):
        # Admin can see all, public only active
        if self.request.user.is_staff:
            return Game.objects.all()
        return Game.objects.filter(is_active=True)


class ArmyViewSet(viewsets.ModelViewSet):
    queryset = Army.objects.all()
    serializer_class = ArmySerializer
    lookup_field = 'id'

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Handle partial updates (PATCH)"""
        instance = self.get_object()
        # Make a mutable copy
        data = request.data.copy()

        # Convert camelCase to snake_case
        if 'iconUrl' in data:
            data['icon_url'] = data.pop('iconUrl')
        if 'planetType' in data:
            data['planet_type'] = data.pop('planetType')
        if 'planetName' in data:
            data['planet_name'] = data.pop('planetName')

        # Use partial=True to allow partial updates
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, id=None, image_id=None):
        """Delete a single image from an army's gallery."""
        army = self.get_object()
        image = get_object_or_404(ArmyImage, id=image_id, army=army)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PaintingGuideViewSet(viewsets.ModelViewSet):
    queryset = PaintingGuide.objects.all()
    serializer_class = PaintingGuideSerializer
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):
        # Make a mutable copy
        data = request.data.copy()
        materials_data = data.pop('materials', [])
        steps_data = data.pop('steps', [])

        # Convert camelCase to snake_case
        if 'estimatedTime' in data:
            data['estimated_time'] = data.pop('estimatedTime')
        if 'dateCreated' in data:
            data['date_created'] = data.pop('dateCreated')
        if 'coverImage' in data:
            data['cover_image'] = data.pop('coverImage')
        if 'faction' in data and data['faction']:
            data['faction_id'] = data.pop('faction')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        guide = serializer.save()

        # Create materials
        for i, material_name in enumerate(materials_data):
            GuideMaterial.objects.create(guide=guide, name=material_name, order=i)

        # Create steps
        for step_data in steps_data:
            step_data_copy = step_data.copy()
            if 'stepNumber' in step_data_copy:
                step_data_copy['step_number'] = step_data_copy.pop('stepNumber')
            GuideStep.objects.create(guide=guide, **step_data_copy)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Make a mutable copy
        data = request.data.copy()
        materials_data = data.pop('materials', None)
        steps_data = data.pop('steps', None)

        # Convert camelCase to snake_case
        if 'estimatedTime' in data:
            data['estimated_time'] = data.pop('estimatedTime')
        if 'dateCreated' in data:
            data['date_created'] = data.pop('dateCreated')
        if 'coverImage' in data:
            data['cover_image'] = data.pop('coverImage')
        if 'faction' in data:
            if data['faction']:
                data['faction_id'] = data.pop('faction')
            else:
                data['faction_id'] = None
                data.pop('faction', None)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        guide = serializer.save()

        # Update materials
        if materials_data is not None:
            GuideMaterial.objects.filter(guide=guide).delete()
            for i, material_name in enumerate(materials_data):
                GuideMaterial.objects.create(guide=guide, name=material_name, order=i)

        # Update steps
        if steps_data is not None:
            GuideStep.objects.filter(guide=guide).delete()
            for step_data in steps_data:
                step_data_copy = step_data.copy()
                if 'stepNumber' in step_data_copy:
                    step_data_copy['step_number'] = step_data_copy.pop('stepNumber')
                GuideStep.objects.create(guide=guide, **step_data_copy)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, id=None):
        guide = self.get_object()
        user_id = request.data.get('user_id', 'anonymous')

        # Check if already liked
        liked = UserLike.objects.filter(
            user_id=user_id,
            content_type='guide',
            content_id=guide.id
        ).exists()

        if liked:
            # Unlike
            UserLike.objects.filter(
                user_id=user_id,
                content_type='guide',
                content_id=guide.id
            ).delete()
            PaintingGuide.objects.filter(id=guide.id).update(likes=F('likes') - 1)
            guide.refresh_from_db()
            return Response({'status': 'unliked', 'likes': guide.likes})
        else:
            # Like
            UserLike.objects.create(
                user_id=user_id,
                content_type='guide',
                content_id=guide.id
            )
            PaintingGuide.objects.filter(id=guide.id).update(likes=F('likes') + 1)
            guide.refresh_from_db()
            return Response({'status': 'liked', 'likes': guide.likes})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, id=None):
        guide = self.get_object()
        PaintingGuide.objects.filter(id=guide.id).update(views=F('views') + 1)
        guide.refresh_from_db()
        return Response({'views': guide.views})

    @action(detail=True, methods=['post'])
    def comment(self, request, id=None):
        guide = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                id=f"comment-{request.data.get('date', '')}",
                content_type='guide',
                guide=guide
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BattleReportViewSet(viewsets.ModelViewSet):
    queryset = BattleReport.objects.all()
    serializer_class = BattleReportSerializer
    lookup_field = 'id'

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            # Fallback: if 'images' column is missing (migration not applied),
            # fetch all other columns via VALUES and inject images=[] so the
            # endpoint remains functional until the migration is applied.
            error_msg = str(e)
            if 'images' in error_msg and 'does not exist' in error_msg:
                try:
                    # Fetch all reports deferring the missing column, then
                    # inject images=[] directly into the instance dict so
                    # the serializer never triggers a deferred DB load.
                    qs = BattleReport.objects.defer('images').order_by('-date')
                    reports = []
                    for r in qs:
                        r.__dict__['images'] = []  # Prevent deferred access
                        s = self.get_serializer(r)
                        row = dict(s.data)
                        row['images'] = []
                        reports.append(row)
                    return Response(reports)
                except Exception:
                    pass
            import traceback
            traceback.print_exc()
            return Response(
                {'error': error_msg, 'detail': 'Error al cargar los informes. Es posible que falten migraciones.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        # Make a mutable copy
        data = request.data.copy()
        narrative_data = data.pop('narrative', [])

        # Convert camelCase and handle nested data
        if 'finalScore' in data:
            final_score = data.pop('finalScore')
            data['player1_score'] = final_score.get('player1', 0)
            data['player2_score'] = final_score.get('player2', 0)
        # Also accept direct player scores
        if 'player1_score' in data:
            data['player1_score'] = int(data.get('player1_score', 0))
        if 'player2_score' in data:
            data['player2_score'] = int(data.get('player2_score', 0))
        if 'armies' in data:
            armies_data = data.pop('armies')
            data['player1_name'] = armies_data.get('player1', {}).get('name', '')
            data['player1_faction'] = armies_data.get('player1', {}).get('faction', '')
            data['player1_list'] = armies_data.get('player1', {}).get('list', [])
            data['player2_name'] = armies_data.get('player2', {}).get('name', '')
            data['player2_faction'] = armies_data.get('player2', {}).get('faction', '')
            data['player2_list'] = armies_data.get('player2', {}).get('list', [])
        # keyMoments is now handled by the serializer (source='key_moments')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        # Create narrative entries
        for i, narrative_entry in enumerate(narrative_data):
            BattleNarrative.objects.create(
                battle=report,
                turn=narrative_entry.get('turn', 1),
                phase=narrative_entry.get('phase', ''),
                text=narrative_entry.get('text', ''),
                order=i
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Make a mutable copy
        data = request.data.copy()
        narrative_data = data.pop('narrative', None)

        # Convert camelCase and handle nested data
        if 'finalScore' in data:
            final_score = data.pop('finalScore')
            data['player1_score'] = final_score.get('player1', instance.player1_score)
            data['player2_score'] = final_score.get('player2', instance.player2_score)
        # Also accept direct player scores
        if 'player1_score' in data:
            data['player1_score'] = int(data.get('player1_score', instance.player1_score))
        if 'player2_score' in data:
            data['player2_score'] = int(data.get('player2_score', instance.player2_score))
        if 'armies' in data:
            armies_data = data.pop('armies')
            if 'player1' in armies_data:
                data['player1_name'] = armies_data['player1'].get('name', instance.player1_name)
                data['player1_faction'] = armies_data['player1'].get('faction', instance.player1_faction)
                data['player1_list'] = armies_data['player1'].get('list', instance.player1_list)
            if 'player2' in armies_data:
                data['player2_name'] = armies_data['player2'].get('name', instance.player2_name)
                data['player2_faction'] = armies_data['player2'].get('faction', instance.player2_faction)
                data['player2_list'] = armies_data['player2'].get('list', instance.player2_list)
        # keyMoments is now handled by the serializer (source='key_moments')

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        # Update narrative
        if narrative_data is not None:
            BattleNarrative.objects.filter(battle=report).delete()
            for i, narrative_entry in enumerate(narrative_data):
                BattleNarrative.objects.create(
                    battle=report,
                    turn=narrative_entry.get('turn', 1),
                    phase=narrative_entry.get('phase', ''),
                    text=narrative_entry.get('text', ''),
                    order=i
                )

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, id=None):
        report = self.get_object()
        user_id = request.data.get('user_id', 'anonymous')

        # Check if already liked
        liked = UserLike.objects.filter(
            user_id=user_id,
            content_type='report',
            content_id=report.id
        ).exists()

        if liked:
            # Unlike
            UserLike.objects.filter(
                user_id=user_id,
                content_type='report',
                content_id=report.id
            ).delete()
            BattleReport.objects.filter(id=report.id).update(likes=F('likes') - 1)
            report.refresh_from_db()
            return Response({'status': 'unliked', 'likes': report.likes})
        else:
            # Like
            UserLike.objects.create(
                user_id=user_id,
                content_type='report',
                content_id=report.id
            )
            BattleReport.objects.filter(id=report.id).update(likes=F('likes') + 1)
            report.refresh_from_db()
            return Response({'status': 'liked', 'likes': report.likes})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, id=None):
        report = self.get_object()
        BattleReport.objects.filter(id=report.id).update(views=F('views') + 1)
        report.refresh_from_db()
        return Response({'views': report.views})

    @action(detail=True, methods=['post'])
    def comment(self, request, id=None):
        report = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                id=f"comment-{request.data.get('date', '')}",
                content_type='report',
                battle_report=report
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoreEntryViewSet(viewsets.ModelViewSet):
    queryset = LoreEntry.objects.all()
    serializer_class = LoreEntrySerializer
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Convert camelCase to snake_case
        if 'dateCreated' in data:
            data['date_created'] = data.pop('dateCreated')
        if 'isFeatured' in data:
            data['is_featured'] = data.pop('isFeatured')
        if 'relatedFaction' in data and data['relatedFaction']:
            data['related_faction_id'] = data.pop('relatedFaction')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        # Convert camelCase to snake_case
        if 'dateCreated' in data:
            data['date_created'] = data.pop('dateCreated')
        if 'isFeatured' in data:
            data['is_featured'] = data.pop('isFeatured')
        if 'relatedFaction' in data:
            if data['relatedFaction']:
                data['related_faction_id'] = data.pop('relatedFaction')
            else:
                data['related_faction_id'] = None
                data.pop('relatedFaction', None)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, id=None):
        lore = self.get_object()
        LoreEntry.objects.filter(id=lore.id).update(views=F('views') + 1)
        lore.refresh_from_db()
        return Response({'views': lore.views})


class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.filter(is_published=True)
    serializer_class = NewsArticleSerializer
    lookup_field = 'id'

    def get_queryset(self):
        # Admin can see all; public only sees published
        token = self.request.META.get('HTTP_AUTHORIZATION', '')
        if token:
            return NewsArticle.objects.all()
        return NewsArticle.objects.filter(is_published=True)

    def create(self, request, *args, **kwargs):
        import uuid
        data = request.data.copy()
        if 'coverImage' in data:
            data['cover_image'] = data.pop('coverImage')
        if 'isPublished' in data:
            data['is_published'] = data.pop('isPublished')
        if not data.get('id'):
            data['id'] = str(uuid.uuid4())[:8]
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        if 'coverImage' in data:
            data['cover_image'] = data.pop('coverImage')
        if 'isPublished' in data:
            data['is_published'] = data.pop('isPublished')
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


def _get_authenticated_user(request):
    """Helper: returns (user, error_response). Requires Token auth."""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Token '):
        return None, Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        token_key = auth_header.split(' ')[1]
        token = Token.objects.get(key=token_key)
        return token.user, None
    except Token.DoesNotExist:
        return None, Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)


def _serialize_user(u):
    return {
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'isStaff': u.is_staff,
        'isSuperuser': u.is_superuser,
        'isActive': u.is_active,
        'dateJoined': u.date_joined.isoformat(),
        'lastLogin': u.last_login.isoformat() if u.last_login else None,
    }


@api_view(['GET'])
def users_list(request):
    """List all users. Requires staff (admin) token."""
    requesting_user, err = _get_authenticated_user(request)
    if err:
        return err
    if not requesting_user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by('-date_joined')
    return Response([_serialize_user(u) for u in users])


@api_view(['POST'])
def user_create(request):
    """Create a new admin user. Requires superuser (leader) token."""
    requesting_user, err = _get_authenticated_user(request)
    if err:
        return err
    if not requesting_user.is_superuser:
        return Response({'error': 'Solo el leader puede crear administradores'}, status=status.HTTP_403_FORBIDDEN)

    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    email = request.data.get('email', '').strip()

    if not username or not password:
        return Response({'error': 'Username y password son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': f'El usuario "{username}" ya existe'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        is_staff=True,
        is_active=True,
    )
    return Response(_serialize_user(user), status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def user_delete(request, user_id):
    """Delete an admin user. Requires superuser (leader) token."""
    requesting_user, err = _get_authenticated_user(request)
    if err:
        return err
    if not requesting_user.is_superuser:
        return Response({'error': 'Solo el leader puede eliminar administradores'}, status=status.HTTP_403_FORBIDDEN)
    if requesting_user.id == user_id:
        return Response({'error': 'No puedes eliminarte a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(User, id=user_id)
    if user.is_superuser:
        return Response({'error': 'No se puede eliminar a otro leader'}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
def user_toggle_active(request, user_id):
    """Toggle a user's active status. Requires superuser (leader) token."""
    requesting_user, err = _get_authenticated_user(request)
    if err:
        return err
    if not requesting_user.is_superuser:
        return Response({'error': 'Solo el leader puede activar/desactivar usuarios'}, status=status.HTTP_403_FORBIDDEN)
    if requesting_user.id == user_id:
        return Response({'error': 'No puedes modificar tu propia cuenta'}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    return Response({'id': user.id, 'isActive': user.is_active})
