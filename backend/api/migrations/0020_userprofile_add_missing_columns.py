# Migration 0020
# The api_userprofile table existed in production but was created before the
# bio, favorite_faction, player_types and is_premium columns were added to
# the model. This migration adds those columns safely using IF NOT EXISTS.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_userprofile_extended_fields'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE api_userprofile
                ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS favorite_faction varchar(100) NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS player_types varchar(200) NOT NULL DEFAULT '',
                ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
            """,
            reverse_sql="SELECT 1;",
        ),
        migrations.RunSQL(
            sql="ALTER TABLE api_guidepurchase ADD COLUMN IF NOT EXISTS stripe_payment_intent varchar(500) NOT NULL DEFAULT '';",
            reverse_sql="SELECT 1;",
        ),
    ]
