import mimetypes
import os
import re

from django.conf import settings
from django.http import FileResponse, Http404, StreamingHttpResponse
from django.contrib import admin
from django.urls import include, path

from songs import views as song_views

_RANGE_RE = re.compile(r'bytes=(\d+)-(\d*)', re.I)


def serve_media(request, path):
    """
    Serve media files with HTTP Range request support so audio seeking works.

    Browsers send Range: bytes=X-Y when the user seeks. Without a 206 Partial
    Content response the audio element cannot jump to an arbitrary position.
    Django's built-in static/media serving ignores Range headers, so we handle
    it here manually.
    """
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    # Prevent path traversal
    if not os.path.realpath(file_path).startswith(os.path.realpath(settings.MEDIA_ROOT)):
        raise Http404
    if not os.path.isfile(file_path):
        raise Http404

    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'
    size = os.path.getsize(file_path)

    range_header = request.META.get('HTTP_RANGE', '').strip()
    match = _RANGE_RE.match(range_header)

    if match:
        first = int(match.group(1))
        last = int(match.group(2)) if match.group(2) else size - 1
        last = min(last, size - 1)
        length = last - first + 1

        def _iter_file(filepath, offset, nbytes, chunk=8192):
            with open(filepath, 'rb') as f:
                f.seek(offset)
                remaining = nbytes
                while remaining > 0:
                    data = f.read(min(chunk, remaining))
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        response = StreamingHttpResponse(
            _iter_file(file_path, first, length),
            status=206,
            content_type=content_type,
        )
        response['Content-Length'] = length
        response['Content-Range'] = f'bytes {first}-{last}/{size}'
    else:
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Length'] = size

    response['Accept-Ranges'] = 'bytes'
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('songs/', include('songs.urls')),
    path('', song_views.page_list, name='page_list'),
    path('new/', song_views.page_create, name='page_create'),
    path('song/<int:song_id>/', song_views.page_detail, name='page_detail'),
]

if settings.DEBUG:
    urlpatterns += [
        path('media/<path:path>', serve_media),
    ]
