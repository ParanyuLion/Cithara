from django.utils import timezone

from songs.models import Song, Status


class SongRepository:
    """Data-access layer — all Song ORM queries live here."""

    def find_all(self):
        """Return all non-deleted songs ordered newest-first."""
        return Song.objects.filter(deleted_at__isnull=True).order_by("-created_at")

    def find_by_id(self, song_id: int) -> Song | None:
        """Return a non-deleted song by primary key, or None."""
        return Song.objects.filter(id=song_id, deleted_at__isnull=True).first()

    def find_by_suno_task_id(self, task_id: str) -> Song | None:
        """Return a song by its SUNO task ID, or None."""
        return Song.objects.filter(suno_task_id=task_id).first()

    def find_by_id_including_deleted(self, song_id: int) -> Song | None:
        """Return a song by primary key regardless of soft-delete state, or None."""
        return Song.objects.filter(id=song_id).first()

    def save(self, song: Song) -> Song:
        """Validate and persist a Song instance. Raises ValidationError on bad data."""
        song.full_clean()
        song.save()
        return song

    def soft_delete(self, song: Song) -> Song:
        """Mark the song as deleted by setting deleted_at."""
        song.deleted_at = timezone.now()
        song.save(update_fields=["deleted_at"])
        return song

    def update_status(
        self,
        song: Song,
        status: str,
        audio_url: str = None,
        shareable_link: str = None,
        suno_task_id: str = None,
    ) -> Song:
        """Update the song's status and optionally its media URLs / task ID."""
        update_fields = ["status"]
        song.status = status

        if suno_task_id is not None:
            song.suno_task_id = suno_task_id
            update_fields.append("suno_task_id")

        if audio_url is not None:
            song.shareable_link = audio_url
            update_fields.append("shareable_link")

        if shareable_link is not None:
            song.shareable_link = shareable_link
            if "shareable_link" not in update_fields:
                update_fields.append("shareable_link")

        song.save(update_fields=update_fields)
        return song
