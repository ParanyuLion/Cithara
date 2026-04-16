# Sequence Diagrams

## 1. Google OAuth Login Flow

```mermaid
sequenceDiagram
    actor User
    participant B   as Browser
    participant D   as Django (allauth)
    participant G   as Google OAuth

    User->>B: Visit any page (e.g. /)
    B->>D: GET /
    D-->>B: 302 → /accounts/login/?next=/

    B->>D: GET /accounts/login/
    D-->>B: 200 login.html (Sign in with Google button)

    User->>B: Click "Sign in with Google"
    B->>D: GET /accounts/google/login/
    D-->>B: 302 → accounts.google.com (with client_id, redirect_uri, PKCE)

    B->>G: GET accounts.google.com/o/oauth2/auth
    G-->>B: Google consent screen
    User->>B: Grant permission

    G-->>B: 302 → /accounts/google/login/callback/?code=...
    B->>D: GET /accounts/google/login/callback/?code=...
    D->>G: POST (exchange code for tokens)
    G-->>D: access_token + id_token
    D->>D: Find or create User from Google profile
    D-->>B: 302 → /new/ (LOGIN_REDIRECT_URL)

    B->>D: GET /new/
    D-->>B: 200 create.html
```

## 2. Song Generation Flow (Suno)

```mermaid
sequenceDiagram
    actor User
    participant B   as Browser (React)
    participant V   as SongView (API)
    participant SS  as SongService
    participant SR  as SongRepository
    participant SC  as SunoClient
    participant SUNO as SUNO API

    %% ── Step 1: Create request ──────────────────────────────────────────────
    User->>B: Fill form and submit
    B->>V: POST /songs/create/ {title, genre, mood, ocasion, singer_voice}
    Note over V: _require_auth → passes (session cookie)
    V->>SS: create_song(title, genre, mood, ocasion, singer_voice, creator=request.user, prompt)

    SS->>SR: save(song) [status=PENDING]
    SR-->>SS: song (id assigned)

    %% ── Step 2: Submit to SUNO ──────────────────────────────────────────────
    SS->>SC: generate(prompt)
    Note over SC: customMode=false — single merged prompt:\n"Title: X. A {genre} song with {mood} mood,\nsuitable for {ocasion}, sung by {voice}. {user_prompt}"
    SC->>SUNO: POST /api/v1/generate {customMode:false, prompt, model, callBackUrl}
    SUNO-->>SC: {data: {taskId: "..."}}
    SC-->>SS: task_id (str)

    SS->>SR: update_status(song, GENERATING, suno_task_id=task_id)
    SR-->>SS: song

    SS-->>V: song
    V-->>B: 201 {id, title, status="Generating"}
    B-->>User: Shows song in "Generating" state

    %% ── Step 3: SUNO async callback ─────────────────────────────────────────
    Note over SUNO,V: SUNO generates the song asynchronously then calls back

    SUNO->>V: POST /songs/suno-callback/ {data: {task_id, callbackType, data: [tracks]}}
    Note over V: No auth check — server-to-server webhook
    V->>SS: handle_suno_callback(task_id, callback_type, tracks)
    SS->>SR: find_by_suno_task_id(task_id)
    SR-->>SS: song

    alt callbackType == "complete"
        SS->>SS: download audio from tracks[0].audio_url
        SS->>SR: update_status(song, COMPLETED, shareable_link, audio_file)
        SR-->>SS: song
    else callbackType == "error"
        SS->>SR: update_status(song, FAILED, failure_reason="Suno reported a generation error")
        SR-->>SS: song
    else callbackType == "text" or "first"
        Note over SS: Intermediate progress — ignored
    end

    SS-->>V: true
    V-->>SUNO: 200 {message: "ok"}
```

## Notes

- All page views (`/`, `/new/`, `/song/<id>/`) are protected by `@login_required` — unauthenticated requests redirect to `/accounts/login/`.
- All API endpoints (`/songs/*`) return `401` for unauthenticated requests, except `suno-callback` which is intentionally open (server-to-server webhook).
- Each user sees only their own songs — `SongRepository.find_all_by_creator(user)` filters by `creator` and excludes soft-deleted songs.
- Status transitions: `PENDING → GENERATING → COMPLETED | FAILED` (Suno) or `PENDING → COMPLETED | FAILED` (mock, synchronous).
- Suno is called with `customMode=false` — all attributes (title, genre, mood, occasion, voice, user prompt) are merged into a single `prompt` string.
- `failure_reason` is stored on the Song when status transitions to FAILED; surfaced in the detail page UI.
- `shareable_link` is populated with the Suno `audio_url` on success.
- `callBackUrl` must be publicly reachable (use ngrok for local development).
