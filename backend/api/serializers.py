from rest_framework import serializers
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, UserLike, UserFavorite, LoreEntry
)

class ArmyImageSerializer(serializers.ModelSerializer):
    isFavorite = serializers.BooleanField(source='is_favorite')

    class Meta:
        model = ArmyImage
        fields = ['id', 'url', 'name', 'isFavorite']

class ArmySerializer(serializers.ModelSerializer):
    images = ArmyImageSerializer(many=True, read_only=True)
    iconUrl = serializers.URLField(source='icon_url', required=False, allow_blank=True)
    planetType = serializers.CharField(source='planet_type', required=False, allow_blank=True)
    planetName = serializers.CharField(source='planet_name', required=False, allow_blank=True)
    
    class Meta:
        model = Army
        fields = [
            'id', 'name', 
            'description', 'history', 
            'iconUrl', 'images',
            'position', 'size', 'color', 'emissive',
            'planetType', 'planetName'
        ]

class GuideMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuideMaterial
        fields = ['name']

class GuideStepSerializer(serializers.ModelSerializer):
    stepNumber = serializers.IntegerField(source='step_number')
    
    class Meta:
        model = GuideStep
        fields = ['stepNumber', 'title', 'description', 'images', 'tips']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author', 'date', 'text']

class PaintingGuideSerializer(serializers.ModelSerializer):
    materials = serializers.SerializerMethodField()
    steps = GuideStepSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    estimatedTime = serializers.CharField(source='estimated_time')
    dateCreated = serializers.DateField(source='date_created')
    coverImage = serializers.URLField(source='cover_image')
    faction = serializers.SerializerMethodField()
    
    class Meta:
        model = PaintingGuide
        fields = [
            'id', 'title', 'difficulty', 'estimatedTime', 'author',
            'dateCreated', 'coverImage', 'tags', 'likes', 'views',
            'materials', 'steps', 'comments', 'faction'
        ]
        
    def get_materials(self, obj):
        return [m.name for m in obj.materials.all()]
    
    def get_faction(self, obj):
        if obj.faction:
            return {
                'id': obj.faction.id,
                'name': obj.faction.name,
                'iconUrl': obj.faction.icon_url
            }
        return None

class BattleNarrativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BattleNarrative
        fields = ['turn', 'phase', 'text']

class BattleReportSerializer(serializers.ModelSerializer):
    narrative = BattleNarrativeSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    armies = serializers.SerializerMethodField()
    finalScore = serializers.SerializerMethodField()
    keyMoments = serializers.ListField(source='key_moments', read_only=True)
    
    class Meta:
        model = BattleReport
        fields = [
            'id', 'title', 'factions', 'mission', 'points', 'date',
            'tags', 'likes', 'views', 'finalScore', 'armies',
            'narrative', 'keyMoments', 'mvp', 'comments'
        ]
        
    def get_armies(self, obj):
        return {
            'player1': {
                'name': obj.player1_name,
                'faction': obj.player1_faction,
                'list': obj.player1_list
            },
            'player2': {
                'name': obj.player2_name,
                'faction': obj.player2_faction,
                'list': obj.player2_list
            }
        }
    
    def get_finalScore(self, obj):
        return {
            'player1': obj.player1_score,
            'player2': obj.player2_score
        }

class UserLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLike
        fields = '__all__'

class UserFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavorite

class LoreEntrySerializer(serializers.ModelSerializer):
    dateCreated = serializers.DateTimeField(source='date_created', read_only=True)
    isFeatured = serializers.BooleanField(source='is_featured', required=False, default=False)
    relatedFaction = serializers.SerializerMethodField()

    class Meta:
        model = LoreEntry
        fields = [
            'id', 'title', 'category', 'content', 'excerpt',
            'tags', 'author', 'dateCreated', 'isFeatured', 'views',
            'relatedFaction'
        ]

    def get_relatedFaction(self, obj):
        if obj.related_faction:
            return {
                'id': obj.related_faction.id,
                'name': obj.related_faction.name,
                'iconUrl': obj.related_faction.icon_url
            }
        return None

        fields = '__all__'
