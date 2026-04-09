# Design Class Diagram — Layered Architecture

```mermaid
classDiagram
    %% ── Presentation Layer ──────────────────────────────────────────────────
    class SongView {
        <<Presentation>>
        +song_list(request) JsonResponse
        +song_create(request) JsonResponse
        +song_detail(request, song_id) JsonResponse
        +song_delete(request, song_id) JsonResponse
        +song_update(request, song_id) JsonResponse
        -_parse_json_body(request) tuple
        -_serialize_song(song, include_meta) dict
        -_resolve_creator(request) User
    }

    %% ── Service Layer ───────────────────────────────────────────────────────
    class SongService {
        <<Service>>
        -repository : SongRepository
        -suno_client : SunoClient
        +list_songs() QuerySet
        +create_song(title, genre, mood, ocasion, singer_voice, creator, prompt) Song
        +get_song(song_id) Song
        +delete_song(song_id) Song
        +update_song_status(song_id, status) Song
        +generate_song(song) Song
        -_build_prompt(song) str
    }

    %% ── Repository Layer ────────────────────────────────────────────────────
    class SongRepository {
        <<Repository>>
        +find_all() QuerySet
        +find_by_id(song_id) Song
        +save(song) Song
        +soft_delete(song) Song
        +update_status(song, status, audio_url, shareable_link) Song
    }

    %% ── Client Layer ────────────────────────────────────────────────────────
    class SunoClient {
        <<Client>>
        -base_url : str
        +generate(prompt, style, title) list
        +get_status(song_ids) list
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
    SongView     --> SongService    : uses
    SongService  --> SongRepository : uses
    SongService  --> SunoClient     : uses
    SongRepository --> Song         : manages
    Song         --> Genre          : has
    Song         --> Status         : has
```

## Layer Responsibilities

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Presentation | `songs/views.py` | HTTP parsing, routing, JSON serialisation |
| Service | `songs/services/song_service.py` | Business logic, orchestration |
| Repository | `songs/repositories/song_repository.py` | Database access (ORM) |
| Client | `songs/clients/suno_client.py` | SUNO external API calls |
| Domain | `songs/models/` | Data model, enumerations |
