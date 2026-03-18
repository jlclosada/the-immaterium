# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import builder_views

router = DefaultRouter()
router.register(r'games', views.GameViewSet, basename='game')
router.register(r'armies', views.ArmyViewSet, basename='army')
router.register(r'guides', views.PaintingGuideViewSet, basename='guide')
router.register(r'battle-reports', views.BattleReportViewSet, basename='battlereport')
router.register(r'lore', views.LoreEntryViewSet, basename='lore')
router.register(r'news', views.NewsArticleViewSet, basename='news')

builder_router = DefaultRouter()
builder_router.register(r'factions', builder_views.BuilderFactionViewSet, basename='builder-faction')
builder_router.register(r'lists', builder_views.BuilderArmyListViewSet, basename='builder-list')

# Este archivo se incluye bajo path('api/', ...) en warhammer_backend/urls.py
# Por tanto NO se debe añadir el prefijo 'api/' aquí — ya está en el padre.
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='api_token_auth'),
    path('search/', views.global_search, name='global_search'),
    path('new-recruit/', views.new_recruit_proxy, name='new_recruit_proxy'),
    path('users/', views.users_list, name='users_list'),
    path('users/create/', views.user_create, name='user_create'),
    path('users/<int:user_id>/toggle-active/', views.user_toggle_active, name='user_toggle_active'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),
    path('builder/', include(builder_router.urls)),
]
