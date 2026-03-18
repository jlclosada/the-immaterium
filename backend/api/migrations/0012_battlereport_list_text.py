from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds player1_list_text and player2_list_text to BattleReport.
    Uses ADD COLUMN IF NOT EXISTS so the migration is idempotent — safe to run
    even if the columns were already added manually in a prior deployment.
    """

    dependencies = [
        ('api', '0011_game_and_army_game_fk'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # Tell Django's migration state that the fields now exist
            state_operations=[
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
            ],
            # Execute idempotent SQL so it never fails if columns already exist
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE api_battlereport "
                        "ADD COLUMN IF NOT EXISTS player1_list_text text NOT NULL DEFAULT '';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE api_battlereport "
                        "DROP COLUMN IF EXISTS player1_list_text;"
                    ),
                ),
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE api_battlereport "
                        "ADD COLUMN IF NOT EXISTS player2_list_text text NOT NULL DEFAULT '';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE api_battlereport "
                        "DROP COLUMN IF EXISTS player2_list_text;"
                    ),
                ),
            ],
        ),
    ]
