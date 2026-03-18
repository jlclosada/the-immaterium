from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import BuilderFaction, BuilderDatasheet, BuilderArmyList
from .builder_serializers import (
    BuilderFactionListSerializer,
    BuilderFactionDetailSerializer,
    BuilderDatasheetSerializer,
    BuilderArmyListSerializer,
)


class BuilderFactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BuilderFaction.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BuilderFactionDetailSerializer
        return BuilderFactionListSerializer

    @action(detail=True, methods=['get'])
    def datasheets(self, request, pk=None):
        faction = self.get_object()
        role = request.query_params.get('role')
        qs = faction.datasheets.all()
        if role:
            qs = qs.filter(role=role)
        serializer = BuilderDatasheetSerializer(qs, many=True)
        return Response(serializer.data)


class BuilderArmyListViewSet(viewsets.ModelViewSet):
    serializer_class = BuilderArmyListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        owner_id = self.request.query_params.get('owner_id')
        if owner_id:
            return BuilderArmyList.objects.filter(owner_id=owner_id)
        return BuilderArmyList.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
