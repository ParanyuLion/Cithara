from django.db import models


class Status(models.TextChoices):
    PENDING = "Pending", "Pending"
    GENERATING = "Generating", "Generating"
    COMPLETED = "Completed", "Completed"
    FAILED = "Failed", "Failed"
