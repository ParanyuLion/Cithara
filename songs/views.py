import json
from typing import Any

from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

from songs.models import Song
from songs.services import SongService

_song_service = SongService()


# ── Helpers ───────────────────────────────────────────────────────────────────

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


# ── Views ─────────────────────────────────────────────────────────────────────

@require_http_methods(["GET"])
def song_list(request):
    songs = _song_service.list_songs()
    data = [_serialize_song(song, include_meta=True) for song in songs]
    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def song_create(request):
    data, error = _parse_json_body(request)
    if error:
        return error

    creator = _resolve_creator(request)
    if not creator:
        return JsonResponse({"error": "No user found. Create a user first."}, status=400)

    required_fields = ["title", "genre", "mood", "ocasion", "singer_voice"]
    for field in required_fields:
        if not data.get(field):
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)

    try:
        song = _song_service.create_song(
            title=data["title"],
            genre=data["genre"],
            mood=data["mood"],
            ocasion=data["ocasion"],
            singer_voice=data["singer_voice"],
            creator=creator,
            prompt=data.get("prompt"),
        )
        return JsonResponse(
            {"message": "Created", "id": song.id, "title": song.title, "status": song.status},
            status=201,
        )
    except ValidationError as e:
        return JsonResponse({"error": e.message_dict}, status=400)


@require_http_methods(["GET"])
def song_detail(request, song_id):
    song = _song_service.get_song(song_id)
    if song is None:
        return JsonResponse({"error": "Song not found"}, status=404)
    return JsonResponse(_serialize_song(song))


@csrf_exempt
@require_http_methods(["DELETE"])
def song_delete(request, song_id):
    try:
        song = _song_service.delete_song(song_id)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    if song is None:
        return JsonResponse({"error": "Song not found"}, status=404)

    return JsonResponse({"message": "Deleted (Soft Delete)"}, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def suno_callback(request):
    """
    Webhook called by sunoapi.org when a generation task completes or fails.
    Register this URL as SUNO_CALLBACK_URL in settings / .env.
    """
    data, error = _parse_json_body(request)
    if error:
        return error

    inner = data.get("data", {}) or {}
    task_id = inner.get("task_id")
    callback_type = inner.get("callbackType", "")
    tracks = inner.get("data") or []

    if not task_id:
        return JsonResponse({"error": "Missing task_id"}, status=400)

    _song_service.handle_suno_callback(task_id, callback_type, tracks)
    return JsonResponse({"message": "ok"})


@csrf_exempt
@require_http_methods(["PATCH"])
def song_update(request, song_id):
    data, error = _parse_json_body(request)
    if error:
        return error

    unknown_fields = set(data.keys()) - {"status"}
    if unknown_fields:
        return JsonResponse(
            {"error": f"Unsupported fields: {', '.join(sorted(unknown_fields))}"},
            status=400,
        )

    if "status" not in data:
        return JsonResponse({"error": "status is required"}, status=400)

    try:
        song = _song_service.update_song_status(song_id, data["status"])
    except ValidationError as e:
        return JsonResponse({"error": e.message_dict}, status=400)

    if song is None:
        return JsonResponse({"error": "Song not found"}, status=404)

    return JsonResponse(
        {"message": "Updated successfully", "id": song.id, "title": song.title, "status": song.status},
        status=200,
    )
