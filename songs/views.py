import json
from typing import Any

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from songs.models import Song
from songs.services import SongService

_song_service = SongService()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _require_auth(request):
    """Return a 401 JsonResponse if the request is unauthenticated, else None."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    return None


def _parse_json_body(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return None, JsonResponse({"error": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return None, JsonResponse({"error": "JSON body must be an object"}, status=400)

    return data, None


def _serialize_song(song: Song, request=None, include_meta: bool = False) -> dict[str, Any]:
    shareable_link = (
        request.build_absolute_uri(f"/song/{song.id}/") if request else f"/song/{song.id}/"
    )
    payload = {
        "id": song.id,
        "title": song.title,
        "genre": song.genre,
        "mood": song.mood,
        "ocasion": song.ocasion,
        "prompt": song.prompt,
        "singer_voice": song.singer_voice,
        "audio_file": song.audio_file.url if song.audio_file else None,
        "shareable_link": shareable_link,
        "failure_reason": song.failure_reason,
        "prompt_mode": song.prompt_mode,
        "cover_image_url": song.cover_image_url,
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


# ── API Views ─────────────────────────────────────────────────────────────────

@require_http_methods(["GET"])
def song_list(request):
    if err := _require_auth(request):
        return err
    songs = _song_service.list_songs_by_creator(request.user)
    data = [_serialize_song(song, request=request, include_meta=True) for song in songs]
    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def song_create(request):
    if err := _require_auth(request):
        return err

    data, error = _parse_json_body(request)
    if error:
        return error

    required_fields = ["title", "genre", "mood", "ocasion", "singer_voice"]
    for field in required_fields:
        if not data.get(field):
            return JsonResponse({"error": f"Missing required field: {field}"}, status=400)

    prompt_mode = data.get("prompt_mode", "lyric")
    if prompt_mode not in ("idea", "lyric"):
        return JsonResponse({"error": "prompt_mode must be 'idea' or 'lyric'"}, status=400)

    try:
        song = _song_service.create_song(
            title=data["title"],
            genre=data["genre"],
            mood=data["mood"],
            ocasion=data["ocasion"],
            singer_voice=data["singer_voice"],
            creator=request.user,
            prompt=data.get("prompt"),
            prompt_mode=prompt_mode,
        )
        return JsonResponse(
            {"message": "Created", "id": song.id, "title": song.title, "status": song.status},
            status=201,
        )
    except ValidationError as e:
        return JsonResponse({"error": e.message_dict}, status=400)


@require_http_methods(["GET"])
def song_detail(request, song_id):
    if err := _require_auth(request):
        return err
    song = _song_service.get_song(song_id)
    if song is None:
        return JsonResponse({"error": "Song not found"}, status=404)
    return JsonResponse(_serialize_song(song, request=request))


@csrf_exempt
@require_http_methods(["DELETE"])
def song_delete(request, song_id):
    if err := _require_auth(request):
        return err
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
    Intentionally exempt from authentication — this is a server-to-server call.
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
    if err := _require_auth(request):
        return err

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
        _serialize_song(song, request=request) | {"message": "Updated successfully"},
        status=200,
    )


# ── Frontend Page Views ───────────────────────────────────────────────────────

@login_required
def page_list(request):
    return render(request, 'songs/pages/list.html')


@login_required
def page_create(request):
    return render(request, 'songs/pages/create.html')


@login_required
def page_detail(request, song_id):
    return render(request, 'songs/pages/detail.html', {'song_id': song_id})
