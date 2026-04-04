from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_newsarticle_views_likes'),
    ]

    operations = [
        migrations.AddField(
            model_name='loreentry',
            name='cover_image',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
