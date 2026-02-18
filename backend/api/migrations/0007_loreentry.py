# Generated manually for LoreEntry model

from django.db import migrations, models
import django.contrib.postgres.fields
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_armyimage_is_favorite_battlereport_is_favorite'),
    ]

    operations = [
        migrations.CreateModel(
            name='LoreEntry',
            fields=[
                ('id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=300)),
                ('category', models.CharField(choices=[('historia', 'Historia'), ('faccion', 'Facción'), ('evento', 'Evento'), ('personaje', 'Personaje'), ('lugar', 'Lugar'), ('tecnologia', 'Tecnología'), ('otro', 'Otro')], default='historia', max_length=20)),
                ('content', models.TextField()),
                ('excerpt', models.CharField(blank=True, max_length=500)),
                ('tags', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=list, size=None)),
                ('author', models.CharField(default='Administratum', max_length=200)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('views', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('related_faction', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='lore_entries', to='api.army')),
            ],
            options={
                'verbose_name': 'Lore Entry',
                'verbose_name_plural': 'Lore Entries',
                'ordering': ['-date_created'],
            },
        ),
    ]

