import json

from django.contrib.auth.models import User
from django.test import TestCase

from songs.models import Song
from songs.repositories import SongRepository
from songs.services import SongService


def _make_song(user, title='Test Song'):
    """Helper: create a Song directly (bypasses the generation service)."""
    return Song.objects.create(
        title=title,
        genre='Pop',
        mood='happy',
        ocasion='birthday',
        singer_voice='female',
        creator=user,
    )


class SongRepositoryCreatorTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.repo = SongRepository()

    def test_find_all_by_creator_returns_only_that_users_songs(self):
        song1 = _make_song(self.user1, 'User1 Song')
        _make_song(self.user2, 'User2 Song')

        result = list(self.repo.find_all_by_creator(self.user1))

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].id, song1.id)

    def test_find_all_by_creator_excludes_deleted_songs(self):
        from django.utils import timezone
        song = _make_song(self.user1)
        song.deleted_at = timezone.now()
        song.save()

        result = list(self.repo.find_all_by_creator(self.user1))

        self.assertEqual(len(result), 0)

    def test_find_all_by_creator_returns_empty_for_user_with_no_songs(self):
        result = list(self.repo.find_all_by_creator(self.user1))
        self.assertEqual(len(result), 0)


class SongServiceListByCreatorTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.service = SongService()

    def test_list_songs_by_creator_returns_only_that_users_songs(self):
        song1 = _make_song(self.user1, 'User1 Song')
        _make_song(self.user2, 'User2 Song')

        result = list(self.service.list_songs_by_creator(self.user1))

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].id, song1.id)


class FrontendViewsTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass')

    # Unauthenticated → redirect to login
    def test_list_page_redirects_when_unauthenticated(self):
        response = self.client.get('/')
        self.assertRedirects(
            response, '/accounts/login/?next=/', fetch_redirect_response=False
        )

    def test_create_page_redirects_when_unauthenticated(self):
        response = self.client.get('/new/')
        self.assertRedirects(
            response, '/accounts/login/?next=/new/', fetch_redirect_response=False
        )

    def test_detail_page_redirects_when_unauthenticated(self):
        response = self.client.get('/song/42/')
        self.assertRedirects(
            response, '/accounts/login/?next=/song/42/', fetch_redirect_response=False
        )

    # Authenticated → 200 with correct template
    def test_list_page_returns_200_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_list_page_uses_correct_template_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/')
        self.assertTemplateUsed(response, 'songs/pages/list.html')

    def test_create_page_returns_200_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/new/')
        self.assertEqual(response.status_code, 200)

    def test_create_page_uses_correct_template_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/new/')
        self.assertTemplateUsed(response, 'songs/pages/create.html')

    def test_detail_page_returns_200_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/song/42/')
        self.assertEqual(response.status_code, 200)

    def test_detail_page_uses_correct_template_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/song/42/')
        self.assertTemplateUsed(response, 'songs/pages/detail.html')

    def test_detail_page_passes_song_id_to_context_when_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/song/99/')
        self.assertEqual(response.context['song_id'], 99)


class ApiAuthTest(TestCase):

    def test_song_list_returns_401_when_unauthenticated(self):
        response = self.client.get('/songs/')
        self.assertEqual(response.status_code, 401)

    def test_song_create_returns_401_when_unauthenticated(self):
        response = self.client.post(
            '/songs/create/', '{}', content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_song_detail_returns_401_when_unauthenticated(self):
        response = self.client.get('/songs/1/')
        self.assertEqual(response.status_code, 401)

    def test_song_delete_returns_401_when_unauthenticated(self):
        response = self.client.delete('/songs/1/delete/')
        self.assertEqual(response.status_code, 401)

    def test_song_update_returns_401_when_unauthenticated(self):
        response = self.client.patch(
            '/songs/1/update/', '{}', content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_suno_callback_is_accessible_without_auth(self):
        payload = json.dumps({
            'data': {'task_id': 'abc123', 'callbackType': 'text', 'data': []}
        })
        response = self.client.post(
            '/songs/suno-callback/', payload, content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)


class SongListOwnershipTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='owner', password='pass')
        self.user2 = User.objects.create_user(username='other', password='pass')
        self.song1 = _make_song(self.user1, 'Owner Song')
        _make_song(self.user2, 'Other Song')

    def test_song_list_returns_only_authenticated_users_songs(self):
        self.client.force_login(self.user1)
        response = self.client.get('/songs/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], self.song1.id)

    def test_song_list_returns_empty_for_user_with_no_songs(self):
        user3 = User.objects.create_user(username='empty', password='pass')
        self.client.force_login(user3)
        response = self.client.get('/songs/')
        data = json.loads(response.content)
        self.assertEqual(data, [])
