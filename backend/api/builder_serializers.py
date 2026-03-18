from rest_framework import serializers
from .models import BuilderFaction, BuilderDatasheet, BuilderArmyList


class BuilderDatasheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuilderDatasheet
        fields = [
            'id', 'name', 'role', 'base_points', 'points_per_model',
            'cost_thresholds',
            'keywords', 'faction_keywords', 'is_character', 'is_epic_hero',
            'weapons', 'abilities', 'wargear_options',
            'model_count_min', 'model_count_max', 'stats',
            'can_be_leader', 'leader_keywords', 'attached_to',
        ]


class BuilderFactionListSerializer(serializers.ModelSerializer):
    datasheet_count = serializers.SerializerMethodField()

    class Meta:
        model = BuilderFaction
        fields = ['id', 'name', 'short_name', 'category', 'color', 'detachments', 'datasheet_count', 'updated_at']

    def get_datasheet_count(self, obj):
        return obj.datasheets.count()


class BuilderFactionDetailSerializer(serializers.ModelSerializer):
    datasheets = BuilderDatasheetSerializer(many=True, read_only=True)

    class Meta:
        model = BuilderFaction
        fields = ['id', 'name', 'short_name', 'category', 'color', 'detachments', 'datasheets', 'updated_at']


class BuilderArmyListSerializer(serializers.ModelSerializer):
    faction_name = serializers.SerializerMethodField()
    faction_color = serializers.SerializerMethodField()

    class Meta:
        model = BuilderArmyList
        fields = [
            'id', 'name', 'owner_id', 'faction', 'faction_name', 'faction_color',
            'detachment', 'game_size', 'total_points', 'units', 'notes',
            'created_at', 'updated_at', 'is_public',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'faction_name', 'faction_color']

    def get_faction_name(self, obj):
        return obj.faction.name if obj.faction else ''

    def get_faction_color(self, obj):
        return obj.faction.color if obj.faction else '#00d4ff'
