# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import builder_views
from . import auth_views

router = DefaultRouter()
router.register(r'games', views.GameViewSet, basename='game')
router.register(r'armies', views.ArmyViewSet, basename='army')
router.register(r'guides', views.PaintingGuideViewSet, basename='guide')
router.register(r'paints', views.PaintViewSet, basename='paint')
router.register(r'battle-reports', views.BattleReportViewSet, basename='battlereport')
router.register(r'lore', views.LoreEntryViewSet, basename='lore')
router.register(r'news', views.NewsArticleViewSet, basename='news')
router.register(r'listings', views.ListingViewSet, basename='listing')
router.register(r'purchase-requests', views.PurchaseRequestViewSet, basename='purchaserequest')

builder_router = DefaultRouter()
builder_router.register(r'factions', builder_views.BuilderFactionViewSet, basename='builder-faction')
builder_router.register(r'lists', builder_views.BuilderArmyListViewSet, basename='builder-list')

# Este archivo se incluye bajo path('api/', ...) en warhammer_backend/urls.py
# Por tanto NO se debe añadir el prefijo 'api/' aquí — ya está en el padre.
urlpatterns = [
    path('', include(router.urls)),
    # Admin login (username-based, existing)
    path('auth/login/', views.login_view, name='api_token_auth'),
    # User-facing auth (email-based)
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/login-email/', auth_views.login_email_view, name='login_email'),
    path('auth/google/', auth_views.google_auth_view, name='google_auth'),
    path('auth/me/', auth_views.me_view, name='me'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/purchases/', auth_views.my_purchases, name='my_purchases'),
    path('auth/profile/', auth_views.update_profile_view, name='update_profile'),
    # Stripe
    path('stripe/create-checkout/', auth_views.create_checkout_session, name='create_checkout'),
    path('stripe/webhook/', auth_views.stripe_webhook, name='stripe_webhook'),
    # Other
    path('search/', views.global_search, name='global_search'),
    path('new-recruit/', views.new_recruit_proxy, name='new_recruit_proxy'),
    path('users/', views.users_list, name='users_list'),
    path('users/create/', views.user_create, name='user_create'),
    path('users/<int:user_id>/toggle-active/', views.user_toggle_active, name='user_toggle_active'),
    path('users/<int:user_id>/toggle-leader/', views.user_toggle_leader, name='user_toggle_leader'),
    path('users/<int:user_id>/toggle-premium/', views.user_toggle_premium, name='user_toggle_premium'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
    path('builder/', include(builder_router.urls)),
]
