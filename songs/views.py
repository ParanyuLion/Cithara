import json
from typing import Any

from django.core.exceptions import ValidationError
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

from .models import Song, Status


def _parse_json_body(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return None, JsonResponse({"error": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return None, JsonResponse({"error": "JSON body must be an object"}, status=400)

    return data, None


def _serialize_song(song: Song, include_meta: bool = False) -> dict[str, Any]:
    payload = {
        "id": song.id,
        "title": song.title,
        "genre": song.genre,
        "mood": song.mood,
        "ocasion": song.ocasion,
        "prompt": song.prompt,
        "singer_voice": song.singer_voice,
        "audio_file": song.audio_file.url if song.audio_file else None,
        "shareable_link": song.shareable_link,
        "created_at": song.created_at.isoformat(),
        "status": song.status,
    }

    if include_meta:
        payload.update(
            {
                "creator_id": song.creator_id,
                "deleted_at": song.deleted_at.isoformat() if song.deleted_at else None,
            }
        )

    return payload


def _resolve_creator(request):
    if request.user.is_authenticated:
        return request.user
    return User.objects.order_by("id").first()


def _song_not_found_response():
    return JsonResponse({"error": "Song not found"}, status=404)


def _get_song_or_error(song_id, include_deleted: bool = True):
    queryset = Song.objects
    if not include_deleted:
        queryset = queryset.filter(deleted_at__isnull=True)

    song = queryset.filter(id=song_id).first()
    if song is None:
        return None, _song_not_found_response()
    return song, None


@require_http_methods(["GET"])
def song_list(request):
    songs = Song.objects.filter(deleted_at__isnull=True).order_by("-created_at")
    data = [_serialize_song(song, include_meta=True) for song in songs]
    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def song_create(request):
    data, error = _parse_json_body(request)
    if error:
        return error

    default_user = _resolve_creator(request)

    if not default_user:
        return JsonResponse({"error": "No user found. Create user first."}, status=400)

    try:
        song = Song(
            title=data.get("title"),
            genre=data.get("genre"),
            mood=data.get("mood"),
            ocasion=data.get("ocasion"),
            prompt=data.get("prompt"),
            singer_voice=data.get("singer_voice"),
            creator=default_user,
            status=Status.COMPLETED,
        )
        song.full_clean()
        song.save()
        return JsonResponse({"message": "Created", "id": song.id, "title": song.title}, status=201)
    except ValidationError as e:
        return JsonResponse({"error": e.message_dict}, status=400)


@require_http_methods(["GET"])
def song_detail(request, song_id):
    song, error = _get_song_or_error(song_id, include_deleted=False)
    if error:
        return error

    return JsonResponse(_serialize_song(song))


@csrf_exempt
@require_http_methods(["DELETE"])
def song_delete(request, song_id):
    song, error = _get_song_or_error(song_id)
    if error:
        return error

    if song.deleted_at is not None:
        return JsonResponse({"error": "Song already deleted"}, status=400)

    song.deleted_at = timezone.now()
    song.save(update_fields=["deleted_at"])
    return JsonResponse({"message": "Deleted (Soft Delete)"}, status=200)


@csrf_exempt
@require_http_methods(["PATCH"])
def song_update(request, song_id):
    data, error = _parse_json_body(request)
    if error:
        return error

    unknown_fields = set(data.keys()) - {"status"}
    if unknown_fields:
        return JsonResponse({"error": f"Unsupported fields: {', '.join(sorted(unknown_fields))}"}, status=400)

    if "status" not in data:
        return JsonResponse({"error": "status is required"}, status=400)

    song, error = _get_song_or_error(song_id)
    if error:
        return error

    if song.deleted_at is not None:
        return JsonResponse({"error": "Song already deleted"}, status=400)

    try:
        song.status = data["status"]
        song.full_clean()
        song.save(update_fields=["status"])
        return JsonResponse({
                    "message": "Updated successfully",
                    "id": song.id,
                    "title": song.title,
                    "status": song.status
                }, status=200)

    except ValidationError as e:
        return JsonResponse({"error": e.message_dict}, status=400)

