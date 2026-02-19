from rest_framework import serializers
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, UserLike, UserFavorite, LoreEntry
)

class ArmyImageSerializer(serializers.ModelSerializer):
    isFavorite = serializers.BooleanField(source='is_favorite', required=False, default=False)
    # Allow the client to omit the primary‑key; generate a UUID if missing.
    id = serializers.CharField(required=False)

    class Meta:
        model = ArmyImage
        fields = ['id', 'url', 'name', 'isFavorite']

    def create(self, validated_data):
        if 'id' not in validated_data:
            import uuid
            validated_data['id'] = str(uuid.uuid4())
        return super().create(validated_data)

class ArmySerializer(serializers.ModelSerializer):
    images = ArmyImageSerializer(many=True, read_only=False, required=False)
    iconUrl = serializers.URLField(source='icon_url', required=False, allow_blank=True)
    planetType = serializers.CharField(source='planet_type', required=False, allow_blank=True)
    planetName = serializers.CharField(source='planet_name', required=False, allow_blank=True)
    nameEs = serializers.CharField(source='name_es', required=False, allow_blank=True, allow_null=True)
    descriptionEs = serializers.CharField(source='description_es', required=False, allow_blank=True, allow_null=True)
    historyEs = serializers.CharField(source='history_es', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Army
        fields = [
            'id', 'name', 'nameEs',
            'description', 'descriptionEs',
            'history', 'historyEs',
            'iconUrl', 'images',
            'position', 'size', 'color', 'emissive',
            'planetType', 'planetName'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        army = Army.objects.create(**validated_data)

        # Create images for the army
        for image_data in images_data:
            ArmyImage.objects.create(army=army, **image_data)

        return army

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)

        # Update army fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update images if provided – append new images instead of wiping all
        if images_data is not None:
            for image_data in images_data:
                # If an ID is supplied and already exists, skip to avoid duplicate‑key error
                img_id = image_data.get('id')
                if img_id and instance.images.filter(id=img_id).exists():
                    continue
                ArmyImage.objects.create(army=instance, **image_data)

        return instance

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
    # Allow empty tags list (frontend may send []). Use ListField with allow_empty=True.
    tags = serializers.ListField(child=serializers.CharField(), allow_empty=True, required=False)
    # Existing fields mapping camelCase ↔ snake_case
    estimatedTime = serializers.CharField(source='estimated_time', read_only=True)
    dateCreated = serializers.DateField(source='date_created', read_only=True)
    coverImage = serializers.URLField(source='cover_image', read_only=True)
    faction = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()
    steps = GuideStepSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    # duplicate field definitions removed
    
    class Meta:
        model = PaintingGuide
        fields = [
            'id', 'title', 'difficulty', 'estimated_time', 'author',
            'date_created', 'cover_image', 'tags', 'likes', 'views',
            'materials', 'steps', 'comments', 'faction',
            # camelCase read‑only aliases
            'estimatedTime', 'dateCreated', 'coverImage'
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
