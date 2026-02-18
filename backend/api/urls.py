from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArmyViewSet, PaintingGuideViewSet, BattleReportViewSet, LoreEntryViewSet, login_view

router = DefaultRouter()
router.register(r'armies', ArmyViewSet)
router.register(r'guides', PaintingGuideViewSet)
router.register(r'battle-reports', BattleReportViewSet)
router.register(r'lore', LoreEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='api_token_auth'),
]
