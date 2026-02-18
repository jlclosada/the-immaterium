from django.contrib import admin
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, LoreEntry
)

class ArmyImageInline(admin.TabularInline):
    model = ArmyImage
    extra = 1
    fields = ('url', 'name', 'is_favorite')
    list_editable = ('is_favorite',)

@admin.register(Army)
class ArmyAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')
    search_fields = ('name', 'description')
    inlines = [ArmyImageInline]

class GuideMaterialInline(admin.TabularInline):
    model = GuideMaterial
    extra = 1

class GuideStepInline(admin.StackedInline):
    model = GuideStep
    extra = 1

@admin.register(PaintingGuide)
class PaintingGuideAdmin(admin.ModelAdmin):
    list_display = ('title', 'faction', 'author', 'difficulty', 'likes')
    list_filter = ('faction', 'difficulty')
    search_fields = ('title', 'author')
    inlines = [GuideMaterialInline, GuideStepInline]

class BattleNarrativeInline(admin.StackedInline):
    model = BattleNarrative
    extra = 1

@admin.register(BattleReport)
class BattleReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'player1_faction', 'player2_faction', 'likes')
    list_filter = ('date',)
    search_fields = ('title', 'player1_name', 'player2_name')
    inlines = [BattleNarrativeInline]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'content_type', 'date', 'created_at')
    list_filter = ('content_type', 'date')
    search_fields = ('text', 'author')


@admin.register(LoreEntry)
class LoreEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'related_faction', 'author', 'is_featured', 'views', 'date_created')
    list_filter = ('category', 'is_featured', 'related_faction')
    search_fields = ('title', 'content', 'tags')
    list_editable = ('is_featured',)
    readonly_fields = ('date_created', 'created_at', 'updated_at')
