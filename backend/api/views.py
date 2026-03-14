from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import F
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment,
    UserLike, UserFavorite, LoreEntry
)
from .serializers import (
    ArmySerializer, PaintingGuideSerializer, BattleReportSerializer,
    CommentSerializer, UserLikeSerializer, UserFavoriteSerializer, LoreEntrySerializer
)

@api_view(['POST'])
def login_view(request):
    """Custom login view that accepts JSON"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

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
        if 'keyMoments' in data:
            data['key_moments'] = data.pop('keyMoments')
        
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
        if 'keyMoments' in data:
            data['key_moments'] = data.pop('keyMoments')
        
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
