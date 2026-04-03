from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_add_likes_to_loreentry'),
    ]

    operations = [
        migrations.AddField(
            model_name='newsarticle',
            name='views',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='newsarticle',
            name='likes',
            field=models.IntegerField(default=0),
        ),
    ]
