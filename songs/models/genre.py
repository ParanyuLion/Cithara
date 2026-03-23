from django.db import models


class Genre(models.TextChoices):
    POP = "Pop", "Pop"
    ROCK = "Rock", "Rock"
    JAZZ = "Jazz", "Jazz"
    HIPHOP = "Hip-Hop", "Hip-Hop"
    COUNTRY = "Country", "Country"
