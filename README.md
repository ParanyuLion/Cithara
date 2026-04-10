# Cithara

A Django-based web application for generating songs.

## Project Structure

```
Cithara/
├── manage.py              # Django management script
├── db.sqlite3             # SQLite database
├── README.md              # This file
├── mysite/                # Django project configuration
│   ├── settings.py        # Project settings
│   ├── urls.py            # Main URL routing
│   ├── asgi.py            # ASGI config
│   ├── wsgi.py            # WSGI config
│   └── __init__.py
└── songs/                 # Songs Django app
    ├── models.py          # Database models
    ├── views.py           # View logic
    ├── urls.py            # App URL routing
    ├── admin.py           # Django admin configuration
    ├── apps.py            # App configuration
    ├── tests.py           # Tests
    └── migrations/        # Database migrations
```

## Domain Model

![Domain Model](DomainModel.png)

- The Library entity was merged into the User model to simplify the 1:1 relationship and optimize query performance.

- Utilized Django's built-in User model to avoid redundancy and ensure out-of-the-box security.

## Setup Instructions

1. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Apply migrations:**

   ```bash
   python manage.py migrate
   ```

5. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

## Running the Application

Start the development server:

```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## Admin Panel

Access the Django admin panel at `http://127.0.0.1:8000/admin/` with your superuser credentials.

## Features

- Song management system
- Django admin interface
- URL routing

## API Documentation

For detailed information about the API endpoints, request/response formats, and usage examples, see [API.md](API.md).

The API provides endpoints for:
- Listing all songs
- Creating new songs
- Retrieving song details
- Updating songs
- Deleting songs (soft delete)

## Song Generation Strategies

The application supports two interchangeable generation strategies, selected via the `GENERATOR_STRATEGY` environment variable.

### Minimal demonstration:
https://docs.google.com/document/d/1Rptjo4XFmIBNdzM6YRPJNi_vqKKYi73lGFW-fOgnpiQ/edit?usp=sharing 

### Mock Mode (offline, no API key required)

Generates a song instantly using a placeholder audio URL — no external API calls, no network needed.

1. Set the strategy in your `.env` file:
   ```
   GENERATOR_STRATEGY=mock
   ```
2. Start the server normally:
   ```bash
   python manage.py runserver
   ```
3. Create a song via `POST /songs/create/` — it will return `status: "Completed"` immediately with a placeholder audio URL.

### Suno Mode (calls sunoapi.org)

Generates a real AI song via the [sunoapi.org](https://sunoapi.org) API.

#### Required `.env` settings

Create a `.env` file in the project root (never commit this file):

```
GENERATOR_STRATEGY=suno
SUNO_API_KEY=your_api_key_here
SUNO_CALLBACK_URL=https://your-public-url/songs/suno-callback/
```

- **`SUNO_API_KEY`** — get your key from [sunoapi.org](https://sunoapi.org) after signing up.
- **`SUNO_CALLBACK_URL`** — a publicly reachable URL that Suno will call when generation finishes. Use [ngrok](https://ngrok.com) for local development:
  ```bash
  ngrok http 8000
  # then set: SUNO_CALLBACK_URL=https://<your-ngrok-subdomain>.ngrok-free.app/songs/suno-callback/
  ```

#### Running in Suno mode

```bash
python manage.py runserver
```

Create a song via `POST /songs/create/` — it returns `status: "Generating"` immediately. When Suno finishes, it calls the callback URL and the song status updates to `Completed` with the audio URL.

## Notes

- Database: SQLite (db.sqlite3)
- Python version: 3.x (as per Django requirements)
- The `.env` file must not be committed to version control (add it to `.gitignore`).
