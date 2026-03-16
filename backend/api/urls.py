# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'armies', views.ArmyViewSet, basename='army')
router.register(r'guides', views.PaintingGuideViewSet, basename='guide')
router.register(r'battle-reports', views.BattleReportViewSet, basename='battlereport')
router.register(r'lore', views.LoreEntryViewSet, basename='lore')
router.register(r'news', views.NewsArticleViewSet, basename='news')

urlpatterns = [
    # Todas las rutas de la API bajo /api/
    path('api/', include(router.urls)),
    path('api/auth/login/', views.login_view, name='api_token_auth'),
    path('api/users/', views.users_list, name='users_list'),
    path('api/users/create/', views.user_create, name='user_create'),
    path('api/users/<int:user_id>/toggle-active/', views.user_toggle_active, name='user_toggle_active'),
    path('api/users/<int:user_id>/delete/', views.user_delete, name='user_delete'),

    # Para compatibilidad con URLs sin /api/ (opcional, para no romper enlaces existentes)
    path('auth/login/', views.login_view),
    path('users/', views.users_list),
    path('users/create/', views.user_create),
    path('users/<int:user_id>/toggle-active/', views.user_toggle_active),
    path('users/<int:user_id>/delete/', views.user_delete),
]
