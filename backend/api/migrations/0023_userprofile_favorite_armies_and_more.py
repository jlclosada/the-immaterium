"""
Migration 0023 — SeparateDatabaseAndState for favorite_armies, favorite_game, is_leader.

The three columns were already added to the database by migration 0022 via RunSQL
with IF NOT EXISTS.  Django's migration state doesn't know about them yet, so
makemigrations generated this file.  We use SeparateDatabaseAndState to update
the ORM state WITHOUT touching the database (avoiding DuplicateColumn errors).
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_userprofile_preferences'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # DB already has the columns → nothing to do
            database_operations=[
                migrations.RunSQL("SELECT 1;", reverse_sql="SELECT 1;"),
            ],
            # Update Django's migration state so it knows the fields exist
            state_operations=[
                migrations.AddField(
                    model_name='userprofile',
                    name='favorite_armies',
                    field=models.TextField(blank=True, default=''),
                    preserve_default=False,
                ),
                migrations.AddField(
                    model_name='userprofile',
                    name='favorite_game',
                    field=models.CharField(blank=True, default='', max_length=50),
                    preserve_default=False,
                ),
                migrations.AddField(
                    model_name='userprofile',
                    name='is_leader',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
    ]
