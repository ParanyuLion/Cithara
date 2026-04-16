from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0002_song_suno_task_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='failure_reason',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
