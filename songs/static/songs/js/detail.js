/* Song detail page — fetches GET /songs/:id/ and displays all fields */
const PageHeader = window.Header;
const PageStatusBadge = window.StatusBadge;

function AudioPlayer({ src }) {
  const audioRef     = React.useRef(null);
  const seekRef      = React.useRef(null);
  const [playing, setPlaying]   = React.useState(false);
  const [speed, setSpeed]       = React.useState(1);
  const [current, setCurrent]   = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume]     = React.useState(1);

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else          { a.pause(); setPlaying(false); }
  }

  function handleSeek(e) {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = seekRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
  }

  function setPlaybackSpeed(s) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  function handleVolume(e) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const progress = duration ? (current / duration) * 100 : 0;

  const mono = { fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px' };

  return (
    <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '24px' }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Play + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '4px', cursor: 'pointer',
            color: 'var(--accent)', fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{ ...mono, color: 'var(--text-muted)', flexShrink: 0 }}>
          {fmt(current)} / {fmt(duration)}
        </span>
      </div>

      {/* Seek bar */}
      <div
        ref={seekRef}
        onClick={handleSeek}
        style={{
          height: '4px', background: 'var(--border)', borderRadius: '2px',
          cursor: 'pointer', marginBottom: '12px', position: 'relative',
        }}
      >
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'var(--accent)', borderRadius: '2px',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ ...mono, color: 'var(--text-muted)' }}>SPEED</span>
        {window.SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            style={{
              background: speed === s ? 'var(--accent)' : 'transparent',
              border: '1px solid ' + (speed === s ? 'var(--accent)' : 'var(--border)'),
              color: speed === s ? 'var(--bg)' : 'var(--text-muted)',
              ...mono, padding: '3px 6px', borderRadius: '2px', cursor: 'pointer',
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ ...mono, color: 'var(--text-muted)', flexShrink: 0 }}>VOL</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        <span style={{ ...mono, color: 'var(--text-muted)', width: '30px', textAlign: 'right' }}>
          {Math.round(volume * 100)}
        </span>
      </div>
    </div>
  );
}

function ShareableLink({ url, fieldLabel }) {
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const mono = { fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px' };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={fieldLabel}>Shareable Link</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            wordBreak: 'break-all',
          }}
        >
          {url}
        </a>
        <button
          onClick={handleCopy}
          style={{
            flexShrink: 0,
            background: copied ? 'var(--accent)' : 'transparent',
            border: '1px solid ' + (copied ? 'var(--accent)' : 'var(--border)'),
            color: copied ? 'var(--bg)' : 'var(--text-muted)',
            ...mono,
            padding: '4px 10px',
            borderRadius: '2px',
            cursor: 'pointer',
            letterSpacing: '2px',
          }}
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
    </div>
  );
}

function SongDetail() {
  const songId = window.SONG_ID;
  const [song, setSong]         = React.useState(null);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  async function fetchSong() {
    try {
      const res = await fetch(`/songs/${songId}/`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Song not found' : `Server error ${res.status}`);
      const data = await res.json();
      setSong(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchSong();
  }, []);

  /* Auto-refresh every 5s while song is pending or generating */
  React.useEffect(() => {
    if (!song) return;
    if (song.status !== 'Pending' && song.status !== 'Generating') return;
    const timer = setInterval(fetchSong, 5000);
    return () => clearInterval(timer);
  }, [song]);

  async function handleDelete() {
    if (!confirm('Permanently delete this song?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/songs/${songId}/delete/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  const wrapMain = content => (
    <div>
      <PageHeader />
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
        <a href="/" style={{
          display: 'inline-block',
          marginBottom: '24px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '1px',
          textDecoration: 'none',
        }}>
          ← BACK
        </a>
        {content}
      </main>
    </div>
  );

  if (loading) return wrapMain(
    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>
      LOADING...
    </p>
  );

  if (error) return wrapMain(
    <p style={{ color: 'var(--error)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      ERROR: {error}
    </p>
  );

  const fieldLabel = {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '2px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '4px',
  };
  const fieldValue = {
    color: 'var(--text)',
    fontSize: '14px',
  };

  return wrapMain(
    <React.Fragment>
      {/* Title + status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.1, flex: 1 }}>{song.title}</h1>
        <PageStatusBadge status={song.status} />
      </div>

      {/* Fields grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginBottom: '24px' }}>
        <div>
          <div style={fieldLabel}>Genre</div>
          <div style={fieldValue}>{song.genre}</div>
        </div>
        <div>
          <div style={fieldLabel}>Mood</div>
          <div style={fieldValue}>{song.mood}</div>
        </div>
        <div>
          <div style={fieldLabel}>Occasion</div>
          <div style={fieldValue}>{song.ocasion}</div>
        </div>
        <div>
          <div style={fieldLabel}>Singer Voice</div>
          <div style={fieldValue}>{song.singer_voice}</div>
        </div>
      </div>

      {song.prompt && (
        <div style={{ marginBottom: '24px' }}>
          <div style={fieldLabel}>Prompt</div>
          <div style={{ ...fieldValue, color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '13px' }}>
            {song.prompt}
          </div>
        </div>
      )}

      {/* Audio player */}
      {song.audio_file && <AudioPlayer src={song.audio_file} />}

      {/* Download */}
      {song.audio_file && (
        <div style={{ marginBottom: '24px' }}>
          <div style={fieldLabel}>Download</div>
          <a
            href={song.audio_file}
            download
            style={{
              display: 'inline-block',
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '8px 16px',
              borderRadius: '2px',
              textDecoration: 'none',
            }}
          >
            ↓ DOWNLOAD
          </a>
        </div>
      )}

      {/* Shareable link */}
      {song.shareable_link && (
        <ShareableLink url={song.shareable_link} fieldLabel={fieldLabel} />
      )}

      {/* Delete */}
      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'transparent',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '8px 16px',
            cursor: deleting ? 'not-allowed' : 'pointer',
            borderRadius: '2px',
          }}
        >
          {deleting ? 'DELETING...' : 'DELETE SONG'}
        </button>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SongDetail />);
