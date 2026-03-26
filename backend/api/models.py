from django.db import models
from django.contrib.postgres.fields import ArrayField


def default_position():
    return [0, 0, 0]


class Game(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(max_length=500, blank=True)
    accent_color = models.CharField(max_length=20, default='#00d4ff')
    secondary_color = models.CharField(max_length=20, default='#7b2fff')
    theme = models.CharField(max_length=50, default='sci-fi')  # 'sci-fi' | 'medieval'
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Game'
        verbose_name_plural = 'Games'

    def __str__(self):
        return self.name


class Army(models.Model):
    """Model representing a Warhammer 40k army/faction"""
    PLANET_TYPE_CHOICES = [
        ('lightning', 'Lightning'),
        ('snow', 'Snow'),
        ('deformed', 'Deformed'),
        ('tentacles', 'Tentacles'),
        ('craters', 'Craters'),
        ('terra', 'Terra'),
        ('standard', 'Standard'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    name_es = models.CharField(max_length=200, blank=True, null=True)  # Traducción español
    description = models.TextField()
    description_es = models.TextField(blank=True, null=True)  # Traducción español
    history = models.TextField()
    history_es = models.TextField(blank=True, null=True)  # Traducción español
    icon_url = models.URLField(max_length=500)

    # 3D visualization fields
    position = ArrayField(models.FloatField(), size=3, default=default_position)
    size = models.FloatField(default=1.0)
    color = models.CharField(max_length=20, default='#ffffff')
    emissive = models.CharField(max_length=20, default='#ffffff')
    planet_type = models.CharField(max_length=20, choices=PLANET_TYPE_CHOICES, default='standard')
    planet_name = models.CharField(max_length=200, blank=True)
    game = models.ForeignKey('Game', on_delete=models.SET_NULL, null=True, blank=True, related_name='armies')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Army'
        verbose_name_plural = 'Armies'

    def __str__(self):
        return self.name


class ArmyImage(models.Model):
    """Images for army galleries"""
    id = models.CharField(max_length=100, primary_key=True)
    army = models.ForeignKey(Army, on_delete=models.CASCADE, related_name='images')
    url = models.URLField(max_length=500)
    name = models.CharField(max_length=200)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} - {self.army.name}"


class PaintingGuide(models.Model):
    """Painting guides for miniatures"""
    DIFFICULTY_CHOICES = [
        ('principiante', 'Principiante'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=300)
    faction = models.ForeignKey(Army, on_delete=models.SET_NULL, null=True, related_name='guides')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    estimated_time = models.CharField(max_length=100)
    author = models.CharField(max_length=200)
    date_created = models.DateField()
    cover_image = models.URLField(max_length=500)
    tags = ArrayField(models.CharField(max_length=100), default=list)
    likes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_created']

    def __str__(self):
        return self.title


class Paint(models.Model):
    """Catalogue of hobby paints from various brands"""
    BRAND_CHOICES = [
        ('citadel',      'Citadel'),
        ('vallejo',      'Vallejo'),
        ('army_painter', 'Army Painter'),
        ('ak',           'AK Interactive'),
        ('scale75',      'Scale 75'),
        ('reaper',       'Reaper'),
        ('ammo',         'AMMO by Mig'),
        ('other',        'Otro'),
    ]

    brand  = models.CharField(max_length=50, choices=BRAND_CHOICES)
    range  = models.CharField(max_length=100, help_text='Gama / tipo (ej. Model Color, Shade, Technical)')
    name   = models.CharField(max_length=200)
    color  = models.CharField(max_length=7, default='#888888', help_text='Color HEX, ej. #a12b3c')
    code   = models.CharField(max_length=50, blank=True, help_text='Código de producto (opcional)')

    class Meta:
        ordering = ['brand', 'range', 'name']
        unique_together = ['brand', 'name']
        verbose_name = 'Pintura'
        verbose_name_plural = 'Pinturas'

    def __str__(self):
        return f"[{self.get_brand_display()}] {self.range} – {self.name}"


class GuideMaterial(models.Model):
    """Materials needed for a painting guide"""
    guide = models.ForeignKey(PaintingGuide, on_delete=models.CASCADE, related_name='materials')
    paint = models.ForeignKey(
        Paint, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='guide_uses',
        help_text='Pintura del catálogo (opcional)',
    )
    name  = models.CharField(max_length=300, help_text='Nombre del material (auto-rellenado al elegir pintura)')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.guide.title}"


class GuideStep(models.Model):
    """Individual steps in a painting guide"""
    guide = models.ForeignKey(PaintingGuide, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=300)
    description = models.TextField()
    images = ArrayField(models.URLField(max_length=500), default=list)
    tips = ArrayField(models.TextField(), default=list)

    class Meta:
        ordering = ['step_number']
        unique_together = ['guide', 'step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.title}"


class BattleReport(models.Model):
    """Battle reports/narratives"""
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=300)
    factions = ArrayField(models.CharField(max_length=100), default=list)
    mission = models.CharField(max_length=200)
    points = models.IntegerField()
    date = models.DateField()
    tags = ArrayField(models.CharField(max_length=100), default=list)
    is_favorite = models.BooleanField(default=False)
    likes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    # Final score
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()

    # Player 1 army
    player1_name = models.CharField(max_length=200)
    player1_faction = models.CharField(max_length=100)
    player1_list = ArrayField(models.CharField(max_length=300), default=list)
    player1_list_text = models.TextField(blank=True, default='')  # Parsed army list JSON

    # Player 2 army
    player2_name = models.CharField(max_length=200)
    player2_faction = models.CharField(max_length=100)
    player2_list = ArrayField(models.CharField(max_length=300), default=list)
    player2_list_text = models.TextField(blank=True, default='')  # Parsed army list JSON

    # Key moments and MVP
    key_moments = ArrayField(models.TextField(), default=list)
    mvp = models.TextField()

    # Optional battle images (Cloudinary URLs)
    images = ArrayField(models.URLField(max_length=500), default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return self.title


class BattleNarrative(models.Model):
    """Turn-by-turn narrative for battle reports"""
    battle = models.ForeignKey(BattleReport, on_delete=models.CASCADE, related_name='narrative')
    turn = models.IntegerField()
    phase = models.CharField(max_length=200)
    text = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'turn']

    def __str__(self):
        return f"Turn {self.turn} - {self.phase}"


class Comment(models.Model):
    """Comments on guides and battle reports"""
    CONTENT_TYPES = [
        ('guide', 'Painting Guide'),
        ('report', 'Battle Report'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    guide = models.ForeignKey(PaintingGuide, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    battle_report = models.ForeignKey(BattleReport, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    author = models.CharField(max_length=200)
    date = models.DateField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author}"


class NewsArticle(models.Model):
    """News/blog articles"""
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    content = models.TextField(help_text='Contenido en formato Markdown')
    excerpt = models.CharField(max_length=500, blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    images = ArrayField(models.URLField(max_length=500), default=list)
    author = models.CharField(max_length=200, default='Administratum')
    tags = ArrayField(models.CharField(max_length=100), default=list)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']
        verbose_name = 'Artículo de Noticias'
        verbose_name_plural = 'Artículos de Noticias'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        if not self.excerpt and self.content:
            import re
            plain = re.sub(r'[#*_`\[\]()>-]', '', self.content)
            self.excerpt = (plain[:497] + '...') if len(plain) > 500 else plain
        super().save(*args, **kwargs)


class UserLike(models.Model):
    """Track user likes on content"""
    user_id = models.CharField(max_length=100)  # Can be session ID or user ID
    content_type = models.CharField(max_length=20)
    content_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user_id', 'content_type', 'content_id']

    def __str__(self):
        return f"{self.user_id} likes {self.content_type} {self.content_id}"


class UserFavorite(models.Model):
    """Track user favorites"""
    user_id = models.CharField(max_length=100)
    content_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user_id', 'content_id']

    def __str__(self):
        return f"{self.user_id} favorited {self.content_id}"


class LoreEntry(models.Model):
    """Lore fragments and stories from the Warhammer 40k universe"""
    CATEGORY_CHOICES = [
        ('historia', 'Historia'),
        ('faccion', 'Facción'),
        ('evento', 'Evento'),
        ('personaje', 'Personaje'),
        ('lugar', 'Lugar'),
        ('tecnologia', 'Tecnología'),
        ('otro', 'Otro'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=300)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='historia')
    content = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True)
    related_faction = models.ForeignKey(Army, on_delete=models.SET_NULL, null=True, blank=True, related_name='lore_entries')
    tags = ArrayField(models.CharField(max_length=100), default=list)
    author = models.CharField(max_length=200, default='Administratum')
    date_created = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_created']
        verbose_name = 'Lore Entry'
        verbose_name_plural = 'Lore Entries'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.excerpt and self.content:
            self.excerpt = self.content[:497] + '...' if len(self.content) > 500 else self.content
        super().save(*args, **kwargs)


class BuilderFaction(models.Model):
    """Warhammer 40k faction for the army builder"""
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, default='Unknown')  # Imperium/Chaos/Xenos
    short_name = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=20, default='#00d4ff')
    detachments = models.JSONField(default=list)
    subfaction_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='subfactions')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Builder Faction'
        verbose_name_plural = 'Builder Factions'

    def __str__(self):
        return self.name


class BuilderDatasheet(models.Model):
    """Unit datasheet for the army builder"""
    ROLE_CHOICES = [
        ('HQ', 'HQ'),
        ('Troops', 'Troops'),
        ('Elites', 'Elites'),
        ('Fast Attack', 'Fast Attack'),
        ('Heavy Support', 'Heavy Support'),
        ('Dedicated Transport', 'Dedicated Transport'),
        ('Flyer', 'Flyer'),
        ('Lord of War', 'Lord of War'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    faction = models.ForeignKey(BuilderFaction, on_delete=models.CASCADE, related_name='datasheets')
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Troops')
    base_points = models.IntegerField(default=0)
    points_per_model = models.IntegerField(default=0)
    keywords = ArrayField(models.CharField(max_length=100), default=list)
    faction_keywords = ArrayField(models.CharField(max_length=100), default=list)
    is_character = models.BooleanField(default=False)
    is_epic_hero = models.BooleanField(default=False)
    weapons = models.JSONField(default=list)
    abilities = models.JSONField(default=list)
    wargear_options = models.JSONField(default=list)
    model_count_min = models.IntegerField(default=1)
    model_count_max = models.IntegerField(default=1)
    stats = models.JSONField(default=dict)  # {M, T, Sv, W, Ld, OC}
    cost_thresholds = models.JSONField(default=list, help_text='[{min_models: N, cost: X}] — 10th ed two-tier pricing')
    leader_keywords = models.JSONField(default=list, help_text='Keywords required to attach this unit as Leader')
    can_be_leader = models.BooleanField(default=False, help_text='Can this unit lead other units?')
    attached_to = models.JSONField(default=list, help_text='List of unit names this character can be attached to')

    class Meta:
        ordering = ['role', 'name']
        verbose_name = 'Builder Datasheet'
        verbose_name_plural = 'Builder Datasheets'

    def __str__(self):
        return f"{self.faction.name} - {self.name}"


class BuilderArmyList(models.Model):
    """Saved army list for the builder"""
    id = models.CharField(max_length=100, primary_key=True, default='')
    name = models.CharField(max_length=300, default='Mi Lista')
    owner_id = models.CharField(max_length=100)
    faction = models.ForeignKey(BuilderFaction, null=True, blank=True, on_delete=models.SET_NULL)
    detachment = models.CharField(max_length=200, blank=True)
    game_size = models.IntegerField(default=2000)
    total_points = models.IntegerField(default=0)
    units = models.JSONField(default=list)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Builder Army List'
        verbose_name_plural = 'Builder Army Lists'

    def __str__(self):
        return f"{self.name} ({self.owner_id})"

    def save(self, *args, **kwargs):
        if not self.id:
            import uuid
            self.id = str(uuid.uuid4())
        super().save(*args, **kwargs)


# ────────────────────────────────────────
# Marketplace
# ────────────────────────────────────────

class Listing(models.Model):
    STATE_CHOICES = [
        ('sin_montar', 'Sin montar / En caja'),
        ('montada', 'Montada'),
        ('imprimada', 'Imprimada'),
        ('pintada_parcial', 'Pintada parcialmente'),
        ('pintada', 'Pintada completamente'),
        ('conversion', 'Conversión / Custom'),
    ]
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('reserved', 'Reservado'),
        ('sold', 'Vendido'),
    ]
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    state = models.CharField(max_length=30, choices=STATE_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    faction = models.CharField(max_length=200, blank=True)
    game = models.CharField(max_length=100, blank=True)
    tags = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    images = ArrayField(models.URLField(max_length=500), default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Anuncio'
        verbose_name_plural = 'Anuncios'

    def __str__(self):
        return f'{self.title} ({self.get_state_display()}) — {self.price}€'


class PurchaseRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('contacted', 'Contactado'),
        ('confirmed', 'Confirmado'),
        ('cancelled', 'Cancelado'),
    ]
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='requests')
    name = models.CharField(max_length=200)
    surname = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Solicitud de compra'
        verbose_name_plural = 'Solicitudes de compra'

    def __str__(self):
        return f'{self.name} {self.surname} → {self.listing.title}'

