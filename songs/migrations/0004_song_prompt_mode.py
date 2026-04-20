from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('songs', '0003_song_failure_reason')]

    operations = [
        migrations.AddField(
            model_name='song',
            name='prompt_mode',
            field=models.CharField(
                choices=[('idea', 'Idea'), ('lyric', 'Lyric')],
                default='idea',
                max_length=10,
            ),
        ),
    ]
