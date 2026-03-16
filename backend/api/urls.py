# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'games', views.GameViewSet, basename='game')
router.register(r'armies', views.ArmyViewSet, basename='army')
router.register(r'guides', views.PaintingGuideViewSet, basename='guide')
router.register(r'battle-reports', views.BattleReportViewSet, basename='battlereport')
router.register(r'lore', views.LoreEntryViewSet, basename='lore')
router.register(r'news', views.NewsArticleViewSet, basename='news')

# Este archivo se incluye bajo path('api/', ...) en warhammer_backend/urls.py
# Por tanto NO se debe añadir el prefijo 'api/' aquí — ya está en el padre.
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='api_token_auth'),
    path('users/', views.users_list, name='users_list'),
    path('users/create/', views.user_create, name='user_create'),
    path('users/<int:user_id>/toggle-active/', views.user_toggle_active, name='user_toggle_active'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
]
