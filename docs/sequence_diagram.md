# Sequence Diagram — Song Generation Use Case

```mermaid
sequenceDiagram
    actor User
    participant V  as SongView
    participant SS as SongService
    participant SR as SongRepository
    participant SC as SunoClient
    participant SUNO as SUNO API

    User->>V: POST /songs/create/ {title, genre, mood, ocasion, singer_voice}

    V->>SS: create_song(title, genre, mood, ocasion, singer_voice, creator, prompt)

    SS->>SR: save(song) [status=PENDING]
    SR-->>SS: song (id assigned)

    SS->>SC: generate(prompt, style=genre, title)
    SC->>SUNO: POST /api/generate {prompt, style, title, make_instrumental=false}
    SUNO-->>SC: [{id: suno_id, status: "submitted", ...}]
    SC-->>SS: [{id: suno_id}]

    SS->>SR: update_status(song, GENERATING)
    SR-->>SS: song

    loop Poll every 5 s (max 300 s)
        SS->>SC: get_status([suno_id])
        SC->>SUNO: GET /api/get?ids=suno_id
        SUNO-->>SC: [{status, audio_url, video_url, ...}]
        SC-->>SS: [{status, audio_url, video_url}]

        alt status == "complete"
            SS->>SR: update_status(song, COMPLETED, audio_url, shareable_link)
            SR-->>SS: song
        else status == "error"
            SS->>SR: update_status(song, FAILED)
            SR-->>SS: song
        else still processing
            Note over SS: continue polling
        end
    end

    SS-->>V: song
    V-->>User: 201 {id, title, status, shareable_link}
```

## Notes

- Songs are persisted immediately with `PENDING` status so they are visible in `GET /songs/` from the start.
- Status transitions: `PENDING → GENERATING → COMPLETED | FAILED`.
- Polling is synchronous and capped at **300 seconds** (60 × 5 s). If SUNO has not finished by then the song is marked `FAILED`.
- `shareable_link` is populated with the SUNO `audio_url` on success.
