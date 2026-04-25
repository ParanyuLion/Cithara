# Domain Model

```mermaid
classDiagram
    class Song {
        <<Entity>>
        +title : str
        +mood : str
        +ocasion : str
        +prompt : str
        +singer_voice : str
        +prompt_mode : str
        +audio_file : FileField
        +shareable_link : str
        +cover_image_url : str
        +created_at : datetime
        +deleted_at : datetime
    }

    class User {
        <<Entity>>
        +id : int
        +username : str
        +email : str
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

    User "1" --> "0..*" Song : creates
    Song --> Genre : has
    Song --> Status : has
```

## Domain Rules

- A **Song** is created by one **User** (the creator).
- A **Song** has exactly one **Genre** and one **Status** at any time.
- Songs are never hard-deleted; `deleted_at` marks soft deletion.
- `prompt_mode` is either `idea` (free-form description) or `lyric` (custom lyrics).
- Status transitions: `PENDING → GENERATING → COMPLETED | FAILED`.
