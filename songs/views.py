from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
import json
from .models import Song


def song_list(request):
    if request.method == "GET":
        songs = Song.objects.all().values()
        return JsonResponse(list(songs), safe=False, json_dumps_params={'indent': 4})
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def song_create(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            default_user = User.objects.first() 
            if not default_user:
                return JsonResponse({"error": "Create user first. Use createsuperuser in termianl"}, status=400)
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
            return JsonResponse({"error": str(e)}, status=400)
