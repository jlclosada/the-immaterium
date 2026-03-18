from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_builder_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='builderfaction',
            name='subfaction_of',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=models.deletion.SET_NULL,
                related_name='subfactions',
                to='api.builderfaction',
            ),
        ),
        migrations.AddField(
            model_name='builderdatasheet',
            name='leader_keywords',
            field=models.JSONField(
                default=list,
                help_text='Keywords required to attach this unit as Leader',
            ),
        ),
        migrations.AddField(
            model_name='builderdatasheet',
            name='can_be_leader',
            field=models.BooleanField(
                default=False,
                help_text='Can this unit lead other units?',
            ),
        ),
        migrations.AddField(
            model_name='builderdatasheet',
            name='attached_to',
            field=models.JSONField(
                default=list,
                help_text='List of unit names this character can be attached to',
            ),
        ),
    ]
