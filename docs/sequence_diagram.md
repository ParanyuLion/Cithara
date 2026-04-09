# Sequence Diagram — Song Generation Use Case

```mermaid
sequenceDiagram
    actor User
    participant V   as SongView
    participant SS  as SongService
    participant SR  as SongRepository
    participant SC  as SunoClient
    participant SUNO as SUNO API

    %% ── Step 1: Create request ──────────────────────────────────────────────
    User->>V: POST /songs/create/ {title, genre, mood, ocasion, singer_voice}
    V->>SS: create_song(title, genre, mood, ocasion, singer_voice, creator, prompt)

    SS->>SR: save(song) [status=PENDING]
    SR-->>SS: song (id assigned)

    %% ── Step 2: Submit to SUNO ──────────────────────────────────────────────
    SS->>SC: generate(prompt, style=genre, title)
    SC->>SUNO: POST /api/v1/generate {prompt, style, title, model, callBackUrl}
    SUNO-->>SC: {data: {taskId: "..."}}
    SC-->>SS: task_id (str)

    SS->>SR: update_status(song, GENERATING, suno_task_id=task_id)
    SR-->>SS: song

    SS-->>V: song
    V-->>User: 201 {id, title, status="Generating"}

    %% ── Step 3: SUNO async callback ─────────────────────────────────────────
    Note over SUNO,V: SUNO generates the song asynchronously then calls back

    SUNO->>V: POST /songs/suno-callback/ {data: {task_id, callbackType, data: [tracks]}}
    V->>SS: handle_suno_callback(task_id, callback_type, tracks)
    SS->>SR: find_by_suno_task_id(task_id)
    SR-->>SS: song

    alt callbackType == "complete"
        SS->>SR: update_status(song, COMPLETED, audio_url, shareable_link)
        SR-->>SS: song
    else callbackType == "error"
        SS->>SR: update_status(song, FAILED)
        SR-->>SS: song
    else callbackType == "text" or "first"
        Note over SS: Intermediate progress — ignored
    end

    SS-->>V: true
    V-->>SUNO: 200 {message: "ok"}
```

## Notes

- Songs are persisted immediately with `PENDING` status so they appear in `GET /songs/` from the start.
- Status transitions: `PENDING → GENERATING → COMPLETED | FAILED`.
- Generation is **non-blocking** — `POST /songs/create/` returns immediately with status `Generating`.
- SUNO calls back our `/songs/suno-callback/` webhook when generation completes or fails.
- `shareable_link` is populated with the SUNO `audio_url` on success.
- The `callBackUrl` must be a publicly reachable URL (e.g. via ngrok during local development).
