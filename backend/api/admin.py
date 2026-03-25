from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, LoreEntry, NewsArticle,
    Paint,
)


class ArmyImageInline(admin.TabularInline):
    model = ArmyImage
    extra = 1
    fields = ('id', 'url', 'name', 'is_favorite')


@admin.register(Army)
class ArmyAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'planet_name', 'planet_type')
    search_fields = ('name', 'description', 'name_es')
    list_filter = ('planet_type',)
    fieldsets = (
        ('Identificación', {
            'fields': ('id', 'name', 'name_es')
        }),
        ('Descripción (EN)', {
            'fields': ('description', 'history')
        }),
        ('Descripción (ES)', {
            'fields': ('description_es', 'history_es'),
            'classes': ('collapse',),
        }),
        ('Visual', {
            'fields': ('icon_url', 'color', 'emissive', 'planet_type', 'planet_name')
        }),
        ('3D', {
            'fields': ('position', 'size'),
            'classes': ('collapse',),
        }),
    )
    inlines = [ArmyImageInline]


# ── Color picker widget ──────────────────────────────────────────────────────

class ColorInput(forms.TextInput):
    input_type = 'color'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs.setdefault('style', 'width:60px;height:36px;padding:2px;cursor:pointer;border:none;background:none;')


class PaintAdminForm(forms.ModelForm):
    color = forms.CharField(
        widget=ColorInput(),
        initial='#888888',
        help_text='Elige el color de la pintura',
    )

    class Meta:
        model = Paint
        fields = '__all__'


# ── Paint admin ──────────────────────────────────────────────────────────────

@admin.register(Paint)
class PaintAdmin(admin.ModelAdmin):
    form = PaintAdminForm
    list_display  = ('color_swatch', 'brand', 'range', 'name', 'code')
    list_display_links = ('name',)
    list_filter   = ('brand', 'range')
    search_fields = ('name', 'code', 'range')
    ordering      = ('brand', 'range', 'name')
    fieldsets = (
        ('Identificación', {
            'fields': ('brand', 'range', 'name', 'code'),
        }),
        ('Color', {
            'fields': ('color',),
            'description': 'Usa el selector o escribe directamente el código HEX (ej. #3a6b2f)',
        }),
    )

    @admin.display(description='Color')
    def color_swatch(self, obj):
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;'
            'background:{};border-radius:3px;border:1px solid rgba(0,0,0,.2);'
            'vertical-align:middle;"></span>',
            obj.color,
        )


# ── Guide materials inline ────────────────────────────────────────────────────

class GuideMaterialInline(admin.TabularInline):
    model = GuideMaterial
    extra = 1
    fields = ('paint', 'name', 'order')
    autocomplete_fields = ('paint',)


class GuideStepInline(admin.StackedInline):
    model = GuideStep
    extra = 1


@admin.register(PaintingGuide)
class PaintingGuideAdmin(admin.ModelAdmin):
    list_display = ('title', 'faction', 'author', 'difficulty', 'likes', 'date_created')
    list_filter = ('faction', 'difficulty')
    search_fields = ('title', 'author')
    inlines = [GuideMaterialInline, GuideStepInline]


class BattleNarrativeInline(admin.StackedInline):
    model = BattleNarrative
    extra = 1
    fields = ('turn', 'phase', 'text', 'order')


@admin.register(BattleReport)
class BattleReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'player1_name', 'player1_score', 'player2_name', 'player2_score')
    list_filter = ('date', 'is_favorite')
    search_fields = ('title', 'player1_name', 'player2_name', 'mission')
    fieldsets = (
        ('Información general', {
            'fields': ('id', 'title', 'mission', 'points', 'date', 'tags', 'factions', 'mvp', 'is_favorite')
        }),
        ('Jugador 1', {
            'fields': ('player1_name', 'player1_faction', 'player1_score', 'player1_list')
        }),
        ('Jugador 2', {
            'fields': ('player2_name', 'player2_faction', 'player2_score', 'player2_list')
        }),
        ('Momentos clave', {
            'fields': ('key_moments',),
            'classes': ('collapse',),
        }),
    )
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
    search_fields = ('title', 'content', 'author')
    list_editable = ('is_featured',)
    readonly_fields = ('date_created', 'created_at', 'updated_at')


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'published_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'content', 'author')
    list_editable = ('is_published',)
    readonly_fields = ('published_at', 'created_at', 'updated_at', 'slug')
