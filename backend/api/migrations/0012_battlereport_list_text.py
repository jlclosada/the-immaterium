from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_game_and_army_game_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='battlereport',
            name='player1_list_text',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='battlereport',
            name='player2_list_text',
            field=models.TextField(blank=True, default=''),
        ),
    ]
