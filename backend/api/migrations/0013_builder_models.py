from django.db import migrations, models
import django.db.models.deletion
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_battlereport_list_text'),
    ]

    operations = [
        migrations.CreateModel(
            name='BuilderFaction',
            fields=[
                ('id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('category', models.CharField(default='Unknown', max_length=50)),
                ('short_name', models.CharField(blank=True, max_length=100)),
                ('color', models.CharField(default='#00d4ff', max_length=20)),
                ('detachments', models.JSONField(default=list)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Builder Faction',
                'verbose_name_plural': 'Builder Factions',
                'ordering': ['category', 'name'],
            },
        ),
        migrations.CreateModel(
            name='BuilderDatasheet',
            fields=[
                ('id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('faction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='datasheets', to='api.builderfaction')),
                ('name', models.CharField(max_length=200)),
                ('role', models.CharField(choices=[('HQ', 'HQ'), ('Troops', 'Troops'), ('Elites', 'Elites'), ('Fast Attack', 'Fast Attack'), ('Heavy Support', 'Heavy Support'), ('Dedicated Transport', 'Dedicated Transport'), ('Flyer', 'Flyer'), ('Lord of War', 'Lord of War')], default='Troops', max_length=50)),
                ('base_points', models.IntegerField(default=0)),
                ('points_per_model', models.IntegerField(default=0)),
                ('keywords', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=list, size=None)),
                ('faction_keywords', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=list, size=None)),
                ('is_character', models.BooleanField(default=False)),
                ('is_epic_hero', models.BooleanField(default=False)),
                ('weapons', models.JSONField(default=list)),
                ('abilities', models.JSONField(default=list)),
                ('wargear_options', models.JSONField(default=list)),
                ('model_count_min', models.IntegerField(default=1)),
                ('model_count_max', models.IntegerField(default=1)),
                ('stats', models.JSONField(default=dict)),
            ],
            options={
                'verbose_name': 'Builder Datasheet',
                'verbose_name_plural': 'Builder Datasheets',
                'ordering': ['role', 'name'],
            },
        ),
        migrations.CreateModel(
            name='BuilderArmyList',
            fields=[
                ('id', models.CharField(default='', max_length=100, primary_key=True, serialize=False)),
                ('name', models.CharField(default='Mi Lista', max_length=300)),
                ('owner_id', models.CharField(max_length=100)),
                ('faction', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.builderfaction')),
                ('detachment', models.CharField(blank=True, max_length=200)),
                ('game_size', models.IntegerField(default=2000)),
                ('total_points', models.IntegerField(default=0)),
                ('units', models.JSONField(default=list)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_public', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Builder Army List',
                'verbose_name_plural': 'Builder Army Lists',
                'ordering': ['-updated_at'],
            },
        ),
    ]
