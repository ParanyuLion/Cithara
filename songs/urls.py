from django.urls import path

from . import views

urlpatterns = [
    path('', views.song_list, name='song_list'),
    path('create/', views.song_create, name='song_create'),
]