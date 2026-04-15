# Cithara

A Django-based web application for AI-powered song generation with Google OAuth authentication.

## Project Structure

```
Cithara/
├── manage.py              # Django management script
├── db.sqlite3             # SQLite database
├── README.md              # This file
├── .env.example           # Environment variable template
├── templates/             # Project-level templates
│   └── account/
│       └── login.html     # Google OAuth login page
├── mysite/                # Django project configuration
│   ├── settings.py        # Project settings (allauth, OAuth)
│   ├── urls.py            # Main URL routing (incl. /accounts/)
│   ├── asgi.py
│   ├── wsgi.py
│   └── __init__.py
└── songs/                 # Songs Django app
    ├── models/            # Song, Status (enum), Genre (enum)
    ├── repositories/      # SongRepository (DB access layer)
    ├── services/          # SongService (business logic)
    ├── clients/           # Strategy pattern for song generation
    │   ├── base.py            SongGeneratorStrategy ABC
    │   ├── mock_strategy.py   MockSongGeneratorStrategy (offline)
    │   ├── suno_client.py     SunoClient (HTTP calls to sunoapi.org)
    │   ├── suno_strategy.py   SunoSongGeneratorStrategy (async)
    │   └── __init__.py        get_generator_strategy() factory
    ├── static/songs/      # React (Babel standalone) frontend
    │   └── js/
    │       ├── components.js  Shared components (Header, SongRow, StatusBadge)
    │       ├── list.js        Song list page
    │       ├── create.js      Create song page
    │       └── detail.js      Song detail page
    ├── templates/songs/   # Django templates for each page
    │   ├── base.html
    │   └── pages/
    │       ├── list.html
    │       ├── create.html
    │       └── detail.html
    ├── views.py           # Function-based views + page views
    ├── urls.py            # App URL routing
    ├── admin.py
    ├── apps.py
    ├── tests.py           # 22 tests
    └── migrations/
```

## Architecture

```
Browser → Django Page Views (@login_required)
              ↓ renders React SPA template
        React (Babel standalone)
              ↓ fetch()
        Django API Views (_require_auth)
              ↓
        SongService → SongRepository → ORM
              ↓
        SongGeneratorStrategy (mock | suno)
```

## Domain Model

![Domain Model](DomainModel.png)

- Django's built-in `User` model is used as `creator` on each `Song`.
- Songs are never hard-deleted; `deleted_at` marks soft deletion.
- Each user sees only their own songs.

## Setup Instructions

1. **Create a virtual environment:**

   ```bash
   python -m venv .venv
   ```

2. **Activate the virtual environment:**
   - On Windows: `.venv\Scripts\activate`
   - On macOS/Linux: `source .venv/bin/activate`

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env and fill in the required values (see below)
   ```

5. **Apply migrations:**

   ```bash
   python manage.py migrate
   ```

6. **Create a superuser** (needed to register the Google OAuth app in Django admin):

   ```bash
   python manage.py createsuperuser
   ```

7. **Register Google OAuth credentials** (see [Google OAuth Setup](#google-oauth-setup) below).

## Running the Application

```bash
python manage.py runserver
```

The application is at `http://127.0.0.1:8000/`. All pages require Google login.

## Running Tests

```bash
python manage.py test
```

22 tests covering: repository filtering, service delegation, frontend page auth redirects, API auth (401), and ownership isolation.

## Google OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add to **Authorized redirect URIs**:
   ```
   http://127.0.0.1:8000/accounts/google/login/callback/
   ```
4. Copy the **Client ID** and **Client secret**

### 2. Environment variables

Add to your `.env`:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 3. Django admin

1. Visit `http://127.0.0.1:8000/admin/`
2. Go to **Social Applications** → **Add**
3. Provider: `Google`, Name: `Google`
4. Paste Client ID and Secret key
5. Move your site (`example.com`) to **Chosen sites**
6. Save

## Admin Panel

`http://127.0.0.1:8000/admin/` — Django admin with superuser credentials.

## Features

- Google OAuth login (via `django-allauth`) — every page and API requires auth
- Per-user song isolation — each user sees only their own songs
- AI song generation (mock offline or Suno via sunoapi.org)
- React SPA frontend (Babel standalone, no build step)
- Soft delete
- Async Suno webhook callback

## API Documentation

See [API.md](API.md) for full request/response schemas.

| Method   | Path                        | Auth required | Description                    |
|----------|-----------------------------|---------------|--------------------------------|
| `GET`    | `/songs/`                   | Yes           | List authenticated user's songs|
| `POST`   | `/songs/create/`            | Yes           | Create and submit a song       |
| `GET`    | `/songs/<id>/`              | Yes           | Get song detail                |
| `PATCH`  | `/songs/<id>/update/`       | Yes           | Update song status             |
| `DELETE` | `/songs/<id>/delete/`       | Yes           | Soft-delete a song             |
| `POST`   | `/songs/suno-callback/`     | No            | Webhook for Suno completion    |

Unauthenticated API requests return `401`. The suno-callback endpoint is intentionally open (server-to-server webhook).

## Song Generation Strategies

Selected via the `GENERATOR_STRATEGY` environment variable.

### Mock Mode (offline, no API key required)

```
GENERATOR_STRATEGY=mock
```

Returns `status: "Completed"` immediately with a placeholder audio URL.

### Suno Mode (calls sunoapi.org)

```
GENERATOR_STRATEGY=suno
SUNO_API_KEY=your_api_key_here
SUNO_CALLBACK_URL=https://your-public-url/songs/suno-callback/
```

Returns `status: "Generating"` immediately. Suno calls back the webhook when done.

For local development, use [ngrok](https://ngrok.com):

```bash
ngrok http 8000
# then set SUNO_CALLBACK_URL=https://<subdomain>.ngrok-free.app/songs/suno-callback/
```

## Notes

- Database: SQLite (`db.sqlite3`)
- Django 6.0.3, Python 3.x
- Never commit `.env` — it contains secrets.
- `ocasion` (note the spelling) is the field name used throughout the codebase.
- `ALLOWED_HOSTS` includes `*.ngrok-free.app` for local webhook testing.

### Minimal demonstration

https://docs.google.com/document/d/1Rptjo4XFmIBNdzM6YRPJNi_vqKKYi73lGFW-fOgnpiQ/edit?usp=sharing
