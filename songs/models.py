from django.db import models
from django.contrib.auth.models import User


class Genre(models.TextChoices):
    POP = 'Pop', 'Pop'
    ROCK = 'Rock', 'Rock'
    JAZZ = 'Jazz', 'Jazz'
    HIPHOP = 'Hip-Hop', 'Hip-Hop'
    COUNTRY = 'Country', 'Country'
    
    
class Status(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    GENERATING = 'Generating', 'Generating'
    COMPLETED = 'Completed', 'Completed'
    FAILED = 'Failed', 'Failed'


class Song(models.Model):
    title = models.CharField(max_length=200)
    genre = models.CharField(max_length=20, choices=Genre.choices)
    mood = models.CharField(max_length=100)
    ocasion = models.CharField(max_length=100)
    prompt = models.CharField(max_length=1000, blank=True, null=True)
    singer_voice = models.CharField(max_length=100)
    
    audio_file = models.FileField(upload_to='songs/', null=True, blank=True)
    shareable_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title