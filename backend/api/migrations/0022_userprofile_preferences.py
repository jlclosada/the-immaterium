from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_youtube_url_fields'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE api_userprofile
                ADD COLUMN IF NOT EXISTS favorite_game varchar(50) NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS favorite_armies text NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS is_leader boolean NOT NULL DEFAULT false;
            """,
            reverse_sql="SELECT 1;",
        ),
    ]
