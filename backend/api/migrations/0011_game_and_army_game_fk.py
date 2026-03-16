# Generated migration
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_add_newsarticle'),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('icon_url', models.URLField(blank=True, max_length=500)),
                ('accent_color', models.CharField(default='#00d4ff', max_length=20)),
                ('secondary_color', models.CharField(default='#7b2fff', max_length=20)),
                ('theme', models.CharField(default='sci-fi', max_length=50)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Game',
                'verbose_name_plural': 'Games',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.AddField(
            model_name='army',
            name='game',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='armies', to='api.game'
            ),
        ),
    ]
