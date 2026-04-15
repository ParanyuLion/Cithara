from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from songs import views as song_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('songs/', include('songs.urls')),
    path('', song_views.page_list, name='page_list'),
    path('new/', song_views.page_create, name='page_create'),
    path('song/<int:song_id>/', song_views.page_detail, name='page_detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
