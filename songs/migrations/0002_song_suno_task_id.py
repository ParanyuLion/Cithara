from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='suno_task_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
