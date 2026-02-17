from django.db import models
from django.contrib.postgres.fields import ArrayField


def default_position():
    return [0, 0, 0]


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
    description = models.TextField()
    history = models.TextField()
    icon_url = models.URLField(max_length=500)
    
    # 3D visualization fields
    position = ArrayField(models.FloatField(), size=3, default=default_position)
    size = models.FloatField(default=1.0)
    color = models.CharField(max_length=20, default='#ffffff')
    emissive = models.CharField(max_length=20, default='#ffffff')
    planet_type = models.CharField(max_length=20, choices=PLANET_TYPE_CHOICES, default='standard')
    planet_name = models.CharField(max_length=200, blank=True)
    
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


class GuideMaterial(models.Model):
    """Materials needed for a painting guide"""
    guide = models.ForeignKey(PaintingGuide, on_delete=models.CASCADE, related_name='materials')
    name = models.CharField(max_length=300)
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
    
    # Player 2 army
    player2_name = models.CharField(max_length=200)
    player2_faction = models.CharField(max_length=100)
    player2_list = ArrayField(models.CharField(max_length=300), default=list)
    
    # Key moments and MVP
    key_moments = ArrayField(models.TextField(), default=list)
    mvp = models.TextField()
    
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
