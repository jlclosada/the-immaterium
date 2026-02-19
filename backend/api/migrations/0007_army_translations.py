# Generated manually on 2026-02-19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_armyimage_is_favorite_battlereport_is_favorite'),
    ]

    operations = [
        migrations.AddField(
            model_name='army',
            name='name_es',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='army',
            name='description_es',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='army',
            name='history_es',
            field=models.TextField(blank=True, null=True),
        ),
    ]

