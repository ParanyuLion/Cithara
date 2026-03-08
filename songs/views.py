import json
from django.utils import timezone
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

from .models import Song


@require_http_methods(["GET"])
def song_list(request):
    try:
        songs = Song.objects.filter(deleted_at__isnull=True).values()
        return JsonResponse(list(songs), safe=False, json_dumps_params={'indent': 4})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def song_create(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    default_user = User.objects.first() 

    if not default_user:
        return JsonResponse({"error": "No user found. Create user first."}, status=400)
    
    try:
        song = Song.objects.create(
            title=data.get('title'),
            genre=data.get('genre'),
            mood=data.get('mood'),
            ocasion=data.get('ocasion'),
            prompt=data.get('prompt'),
            singer_voice=data.get('singer_voice'),
            creator=default_user,
            audio_file="demo.mp3",
            status='Completed'
        )
        return JsonResponse({"message": "Created", "id": song.id, "title": song.title}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        
        
@require_http_methods(["GET"])
def song_detail(request, song_id):
    try:
        song = get_object_or_404(Song, id=song_id)
        return JsonResponse({
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
            })
    except Http404:
        return JsonResponse({"error": "Song Not Found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def song_delete(request, song_id):
    try:
        song = get_object_or_404(Song, id=song_id)
        song.deleted_at = timezone.now()
        song.save()
        return JsonResponse({"message": "Deleted (Soft Delete)"}, status=204)
    except Http404:
        return JsonResponse({"error": "Not Found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
