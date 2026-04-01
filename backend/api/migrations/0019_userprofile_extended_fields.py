# Migration 0019 - idempotent version
# Uses IF NOT EXISTS / CREATE TABLE IF NOT EXISTS for all operations
# because these tables/columns were created manually in production before
# this migration file existed.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_purchase_request_closed'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── PaintingGuide new columns ─────────────────────────────────────────
        migrations.RunSQL(
            sql="ALTER TABLE api_paintingguide ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;",
            reverse_sql="SELECT 1;",
            state_operations=[
                migrations.AddField(
                    model_name='paintingguide',
                    name='is_premium',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
        migrations.RunSQL(
            sql="ALTER TABLE api_paintingguide ADD COLUMN IF NOT EXISTS price integer NULL;",
            reverse_sql="SELECT 1;",
            state_operations=[
                migrations.AddField(
                    model_name='paintingguide',
                    name='price',
                    field=models.IntegerField(blank=True, help_text='Precio en céntimos (499 = 4,99€)', null=True),
                ),
            ],
        ),

        # ── UserProfile table ─────────────────────────────────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    CREATE TABLE IF NOT EXISTS api_userprofile (
                        id bigserial PRIMARY KEY,
                        google_id varchar(200) UNIQUE,
                        avatar_url varchar(500) NOT NULL DEFAULT '',
                        stripe_customer_id varchar(200) NOT NULL DEFAULT '',
                        created_at timestamp with time zone NOT NULL,
                        bio text NOT NULL DEFAULT '',
                        favorite_faction varchar(100) NOT NULL DEFAULT '',
                        player_types varchar(200) NOT NULL DEFAULT '',
                        is_premium boolean NOT NULL DEFAULT false,
                        user_id integer NOT NULL UNIQUE REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED
                    );
                    """,
                    reverse_sql="SELECT 1;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='UserProfile',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('google_id', models.CharField(blank=True, max_length=200, null=True, unique=True)),
                        ('avatar_url', models.URLField(blank=True, max_length=500)),
                        ('stripe_customer_id', models.CharField(blank=True, max_length=200)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('bio', models.TextField(blank=True)),
                        ('favorite_faction', models.CharField(blank=True, max_length=100)),
                        ('player_types', models.CharField(blank=True, max_length=200)),
                        ('is_premium', models.BooleanField(default=False)),
                        ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'verbose_name': 'Perfil de usuario',
                        'verbose_name_plural': 'Perfiles de usuario',
                    },
                ),
            ],
        ),

        # ── GuidePurchase table ───────────────────────────────────────────────
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    CREATE TABLE IF NOT EXISTS api_guidepurchase (
                        id bigserial PRIMARY KEY,
                        stripe_session_id varchar(500) NOT NULL UNIQUE,
                        stripe_payment_intent varchar(500) NOT NULL DEFAULT '',
                        amount_paid integer NOT NULL,
                        purchased_at timestamp with time zone NOT NULL,
                        guide_id integer NOT NULL REFERENCES api_paintingguide(id) DEFERRABLE INITIALLY DEFERRED,
                        user_id integer NOT NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
                        UNIQUE (user_id, guide_id)
                    );
                    """,
                    reverse_sql="SELECT 1;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='GuidePurchase',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('stripe_session_id', models.CharField(max_length=500, unique=True)),
                        ('stripe_payment_intent', models.CharField(blank=True, max_length=500)),
                        ('amount_paid', models.IntegerField(help_text='Precio pagado en céntimos')),
                        ('purchased_at', models.DateTimeField(auto_now_add=True)),
                        ('guide', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchases', to='api.paintingguide')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='guide_purchases', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'verbose_name': 'Compra de guía',
                        'verbose_name_plural': 'Compras de guías',
                        'unique_together': {('user', 'guide')},
                    },
                ),
            ],
        ),
    ]
