# Design Class Diagram — Layered Architecture

```mermaid
classDiagram
    %% ── Auth Layer (django-allauth) ─────────────────────────────────────────
    class GoogleOAuth {
        <<django-allauth>>
        +provider: "google"
        +scopes: [email, profile]
        +pkce: enabled
        +LOGIN_REDIRECT_URL: "/new/"
    }

    class User {
        <<Django built-in>>
        +id : int
        +username : str
        +email : str
    }

    GoogleOAuth --> User : creates / links

    %% ── Presentation Layer ──────────────────────────────────────────────────
    class PageViews {
        <<Presentation - HTML>>
        +page_list(request) TemplateResponse
        +page_create(request) TemplateResponse
        +page_detail(request, song_id) TemplateResponse
        note: decorated with @login_required
    }

    class SongView {
        <<Presentation - API>>
        +song_list(request) JsonResponse
        +song_create(request) JsonResponse
        +song_detail(request, song_id) JsonResponse
        +song_delete(request, song_id) JsonResponse
        +song_update(request, song_id) JsonResponse
        +suno_callback(request) JsonResponse
        -_require_auth(request) JsonResponse|None
        -_parse_json_body(request) tuple
        -_serialize_song(song, include_meta) dict
    }

    %% ── Service Layer ───────────────────────────────────────────────────────
    class SongService {
        <<Service>>
        -repository : SongRepository
        -generator : SongGeneratorStrategy
        +list_songs_by_creator(user) QuerySet
        +get_song(song_id) Song
        +create_song(title, genre, mood, ocasion, singer_voice, creator, prompt) Song
        +generate_song(song) Song
        +handle_suno_callback(task_id, callback_type, tracks) bool
        +delete_song(song_id) Song
        +update_song_status(song_id, status) Song
        -_build_prompt(song) str
    }

    %% ── Repository Layer ────────────────────────────────────────────────────
    class SongRepository {
        <<Repository>>
        +find_all_by_creator(user) QuerySet
        +find_by_id(song_id) Song
        +find_by_id_including_deleted(song_id) Song
        +find_by_suno_task_id(task_id) Song
        +save(song) Song
        +soft_delete(song) Song
        +update_status(song, status, audio_url, shareable_link, suno_task_id) Song
    }

    %% ── Client Layer ────────────────────────────────────────────────────────
    class SongGeneratorStrategy {
        <<Strategy interface>>
        +generate(request: GenerationRequest) GenerationResult
    }

    class MockSongGeneratorStrategy {
        <<Strategy - Mock>>
        +MOCK_AUDIO_URL : str
        +generate(request) GenerationResult
    }

    class SunoSongGeneratorStrategy {
        <<Strategy - Suno>>
        -_client : SunoClient
        +generate(request) GenerationResult
    }

    class SunoClient {
        <<Client>>
        -base_url : str
        -_headers : dict
        -_model : str
        -_callback_url : str
        +generate(prompt, style, title) str
        +get_status(task_id) dict
    }

    class GenerationRequest {
        <<DataClass>>
        +prompt : str
        +style : str
        +title : str
    }

    class GenerationResult {
        <<DataClass>>
        +task_id : str
        +audio_url : str
        +audio_content : bytes
    }

    %% ── Domain Layer ────────────────────────────────────────────────────────
    class Song {
        <<Model>>
        +id : int
        +title : str
        +genre : Genre
        +mood : str
        +ocasion : str
        +prompt : str
        +singer_voice : str
        +audio_file : FileField
        +shareable_link : str
        +suno_task_id : str
        +created_at : datetime
        +deleted_at : datetime
        +status : Status
        +creator : User
    }

    class Genre {
        <<enumeration>>
        POP
        ROCK
        JAZZ
        HIPHOP
        COUNTRY
    }

    class Status {
        <<enumeration>>
        PENDING
        GENERATING
        COMPLETED
        FAILED
    }

    %% ── Relationships ───────────────────────────────────────────────────────
    PageViews                 --> SongService             : uses
    SongView                  --> SongService             : uses
    SongService               --> SongRepository          : uses
    SongService               --> SongGeneratorStrategy   : uses
    SongGeneratorStrategy     <|-- MockSongGeneratorStrategy  : implements
    SongGeneratorStrategy     <|-- SunoSongGeneratorStrategy  : implements
    SunoSongGeneratorStrategy --> SunoClient              : delegates to
    SongGeneratorStrategy     --> GenerationRequest       : accepts
    SongGeneratorStrategy     --> GenerationResult        : returns
    SongRepository            --> Song                    : manages
    Song                      --> Genre                   : has
    Song                      --> Status                  : has
    Song                      --> User                    : creator
```

## Layer Responsibilities

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Auth | `django-allauth` + `templates/account/login.html` | Google OAuth2 login, session management |
| Presentation (pages) | `songs/views.py` `page_*` + `songs/templates/` | Server-rendered HTML pages, `@login_required` guard |
| Presentation (API) | `songs/views.py` `song_*` | HTTP parsing, JSON serialisation, 401 auth guard |
| Service | `songs/services/song_service.py` | Business logic, orchestration |
| Repository | `songs/repositories/song_repository.py` | Database access (ORM), per-user filtering |
| Client | `songs/clients/` | Suno external API calls, generation strategies |
| Domain | `songs/models/` | Data model, enumerations |
