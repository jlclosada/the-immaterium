from rest_framework import serializers
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, UserLike, UserFavorite, LoreEntry,
    NewsArticle, Game
)

class GameSerializer(serializers.ModelSerializer):
    accentColor = serializers.CharField(source='accent_color', required=False)
    secondaryColor = serializers.CharField(source='secondary_color', required=False)
    iconUrl = serializers.URLField(source='icon_url', required=False, allow_blank=True)
    isActive = serializers.BooleanField(source='is_active', required=False, default=True)

    class Meta:
        model = Game
        fields = ['id', 'name', 'slug', 'description', 'iconUrl', 'accentColor', 'secondaryColor', 'theme', 'order', 'isActive']


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
    gameId = serializers.CharField(source='game_id', required=False, allow_null=True, allow_blank=True, default=None)
    # Campos de traducción - solo si existen en el modelo
    nameEs = serializers.SerializerMethodField()
    descriptionEs = serializers.SerializerMethodField()
    historyEs = serializers.SerializerMethodField()

    class Meta:
        model = Army
        fields = [
            'id', 'name', 'nameEs',
            'description', 'descriptionEs',
            'history', 'historyEs',
            'iconUrl', 'images',
            'position', 'size', 'color', 'emissive',
            'planetType', 'planetName', 'gameId'
        ]

    def get_nameEs(self, obj):
        return getattr(obj, 'name_es', None)

    def get_descriptionEs(self, obj):
        return getattr(obj, 'description_es', None)

    def get_historyEs(self, obj):
        return getattr(obj, 'history_es', None)

    def create(self, validated_data):
        import uuid
        images_data = validated_data.pop('images', [])
        # Handle game_id: remove if None or empty string to avoid FK issues
        game_id = validated_data.pop('game_id', None)
        if game_id:
            validated_data['game_id'] = game_id
        # Auto-generate ID if not provided
        if not validated_data.get('id'):
            validated_data['id'] = str(uuid.uuid4())
        army = Army.objects.create(**validated_data)

        # Create images for the army
        for image_data in images_data:
            ArmyImage.objects.create(army=army, **image_data)

        return army

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        # Handle game_id explicitly
        if 'game_id' in validated_data:
            game_id = validated_data.pop('game_id')
            instance.game_id = game_id if game_id else None

        # Update army fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace images: delete all existing and recreate from payload
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                import uuid
                if not image_data.get('id'):
                    image_data['id'] = str(uuid.uuid4())
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
    # Read-only computed fields for the API response
    armies = serializers.SerializerMethodField()
    finalScore = serializers.SerializerMethodField()
    # Explicitly declare ArrayField-based fields to allow empty lists
    factions = serializers.ListField(child=serializers.CharField(), allow_empty=True, required=False, default=list)
    tags = serializers.ListField(child=serializers.CharField(), allow_empty=True, required=False, default=list)
    images = serializers.ListField(child=serializers.URLField(), allow_empty=True, required=False, default=list)
    # keyMoments maps to key_moments for both read and write
    keyMoments = serializers.ListField(
        child=serializers.CharField(), source='key_moments',
        required=False, default=list
    )
    # Writable player fields (accepted on POST/PUT/PATCH)
    player1_name = serializers.CharField(required=False, allow_blank=True, default='')
    player1_faction = serializers.CharField(required=False, allow_blank=True, default='')
    player1_score = serializers.IntegerField(required=False, default=0)
    player1_list = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    player2_name = serializers.CharField(required=False, allow_blank=True, default='')
    player2_faction = serializers.CharField(required=False, allow_blank=True, default='')
    player2_score = serializers.IntegerField(required=False, default=0)
    player2_list = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )

    class Meta:
        model = BattleReport
        fields = [
            'id', 'title', 'factions', 'mission', 'points', 'date',
            'tags', 'likes', 'views', 'mvp', 'images',
            # Writable player fields
            'player1_name', 'player1_faction', 'player1_score', 'player1_list',
            'player2_name', 'player2_faction', 'player2_score', 'player2_list',
            'keyMoments',
            # Read-only computed fields
            'finalScore', 'armies',
            # Related
            'narrative', 'comments',
        ]

    def get_armies(self, obj):
        return {
            'player1': {
                'name': obj.player1_name,
                'faction': obj.player1_faction,
                'list': obj.player1_list,
            },
            'player2': {
                'name': obj.player2_name,
                'faction': obj.player2_faction,
                'list': obj.player2_list,
            },
        }

    def get_finalScore(self, obj):
        return {
            'player1': obj.player1_score,
            'player2': obj.player2_score,
        }

class UserLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLike
        fields = '__all__'

class UserFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavorite
        fields = '__all__'

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


class NewsArticleSerializer(serializers.ModelSerializer):
    coverImage = serializers.URLField(source='cover_image', required=False, allow_blank=True)
    isPublished = serializers.BooleanField(source='is_published', required=False, default=True)
    publishedAt = serializers.DateTimeField(source='published_at', read_only=True)

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'coverImage', 'images', 'author', 'tags',
            'isPublished', 'publishedAt'
        ]
