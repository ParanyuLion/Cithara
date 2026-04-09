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
        +suno_callback(request) JsonResponse
        -_parse_json_body(request) tuple
        -_serialize_song(song, include_meta) dict
        -_resolve_creator(request) User
    }

    %% ── Service Layer ───────────────────────────────────────────────────────
    class SongService {
        <<Service>>
        -repository : SongRepository
        -generator : SongGeneratorStrategy
        +list_songs() QuerySet
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
        +find_all() QuerySet
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
```

## Layer Responsibilities

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Presentation | `songs/views.py` | HTTP parsing, routing, JSON serialisation |
| Service | `songs/services/song_service.py` | Business logic, orchestration |
| Repository | `songs/repositories/song_repository.py` | Database access (ORM) |
| Client | `songs/clients/suno_client.py` | SUNO external API calls |
| Domain | `songs/models/` | Data model, enumerations |
