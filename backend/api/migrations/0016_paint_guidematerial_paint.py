from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_builddatasheet_cost_thresholds'),
    ]

    operations = [
        migrations.CreateModel(
            name='Paint',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('brand', models.CharField(
                    choices=[
                        ('citadel',      'Citadel'),
                        ('vallejo',      'Vallejo'),
                        ('army_painter', 'Army Painter'),
                        ('ak',           'AK Interactive'),
                        ('scale75',      'Scale 75'),
                        ('reaper',       'Reaper'),
                        ('ammo',         'AMMO by Mig'),
                        ('other',        'Otro'),
                    ],
                    max_length=50,
                )),
                ('range', models.CharField(
                    help_text='Gama / tipo (ej. Model Color, Shade, Technical)',
                    max_length=100,
                )),
                ('name', models.CharField(max_length=200)),
                ('color', models.CharField(
                    default='#888888',
                    help_text='Color HEX, ej. #a12b3c',
                    max_length=7,
                )),
                ('code', models.CharField(
                    blank=True,
                    help_text='Código de producto (opcional)',
                    max_length=50,
                )),
            ],
            options={
                'verbose_name': 'Pintura',
                'verbose_name_plural': 'Pinturas',
                'ordering': ['brand', 'range', 'name'],
                'unique_together': {('brand', 'name')},
            },
        ),
        migrations.AddField(
            model_name='guidematerial',
            name='paint',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='guide_uses',
                to='api.paint',
                help_text='Pintura del catálogo (opcional)',
            ),
        ),
    ]
