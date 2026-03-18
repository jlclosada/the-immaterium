from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_builder_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='builderdatasheet',
            name='cost_thresholds',
            field=models.JSONField(
                default=list,
                help_text='[{min_models: N, cost: X}] — 10th ed two-tier pricing',
            ),
        ),
    ]
