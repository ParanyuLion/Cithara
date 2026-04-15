/* Song detail page — fetches GET /songs/:id/ and displays all fields */
const PageHeader      = window.Header;
const PageStatusBadge = window.StatusBadge;

function AudioPlayer({ src }) {
  const audioRef  = React.useRef(null);
  const seekRef   = React.useRef(null);
  const [playing, setPlaying]       = React.useState(false);
  const [speed, setSpeed]           = React.useState(1);
  const [current, setCurrent]       = React.useState(0);
  const [duration, setDuration]     = React.useState(0);
  const [volume, setVolume]         = React.useState(1);
  const [showSpeeds, setShowSpeeds] = React.useState(false);

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

  return (
    <div style={{
      background: 'var(--surface-2)',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '32px',
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Play + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '48px', height: '48px', flexShrink: 0,
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#000',
            fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(29,185,84,0.4)',
            transition: 'transform 0.1s, background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {fmt(current)} / {fmt(duration)}
        </span>
      </div>

      {/* Seek bar */}
      <div
        ref={seekRef}
        onClick={handleSeek}
        style={{
          height: '4px',
          background: 'var(--surface-3)',
          borderRadius: '2px',
          cursor: 'pointer',
          marginBottom: '20px',
          position: 'relative',
        }}
        onMouseEnter={e => { e.currentTarget.style.height = '6px'; }}
        onMouseLeave={e => { e.currentTarget.style.height = '4px'; }}
      >
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'var(--accent)', borderRadius: '2px',
          pointerEvents: 'none', transition: 'width 0.1s',
        }} />
      </div>

      {/* Speed + Volume row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Speed */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSpeeds(v => !v)}
            style={{
              background: speed !== 1 ? 'var(--accent)' : 'transparent',
              border: '1px solid ' + (speed !== 1 ? 'var(--accent)' : 'var(--surface-3)'),
              color: speed !== 1 ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '3px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            speed {speed}×
          </button>
          {showSpeeds && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
              background: 'var(--surface-2)',
              border: '1px solid var(--surface-3)',
              borderRadius: '6px',
              padding: '4px',
              display: 'flex', gap: '4px',
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}>
              {window.SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => { setPlaybackSpeed(s); setShowSpeeds(false); }}
                  style={{
                    background: speed === s ? 'var(--accent)' : 'transparent',
                    border: '1px solid ' + (speed === s ? 'var(--accent)' : 'transparent'),
                    color: speed === s ? '#000' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
            Vol
          </span>
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume} onChange={handleVolume}
            style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '28px', textAlign: 'right' }}>
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShareableLink({ url }) {
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
        Shareable Link
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', fontSize: '13px', wordBreak: 'break-all' }}
        >
          {url}
        </a>
        <button
          onClick={handleCopy}
          style={{
            flexShrink: 0,
            background: copied ? 'var(--accent)' : 'var(--surface-2)',
            border: 'none',
            color: copied ? '#000' : 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
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

  React.useEffect(() => { fetchSong(); }, []);

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <PageHeader />
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1100px', width: '100%' }}>
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: '32px',
          }}>
            ← Back
          </a>
          {content}
        </div>
      </main>
    </div>
  );

  if (loading) return wrapMain(
    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
  );

  if (error) return wrapMain(
    <p style={{ color: 'var(--error)', fontSize: '14px' }}>Error: {error}</p>
  );

  const fieldLabel = {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px',
  };
  const fieldValue = { color: 'var(--text)', fontSize: '15px' };

  return wrapMain(
    <React.Fragment>
      {/* Title + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px', flex: 1 }}>
          {song.title}
        </h1>
        <PageStatusBadge status={song.status} />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
        {song.genre} · {song.mood} · {song.ocasion}
      </p>

      {/* Main content — flex wrap: audio|meta side-by-side on wide, stacks on narrow */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'start' }}>

        {/* Audio col: only when audio exists */}
        {song.audio_file && (
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <AudioPlayer src={song.audio_file} />
            <div style={{ marginBottom: '20px' }}>
              <div style={fieldLabel}>Download</div>
              <a
                href={song.audio_file}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '10px 20px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                ↓ Download audio
              </a>
            </div>
            {song.shareable_link && <ShareableLink url={song.shareable_link} />}
          </div>
        )}

        {/* Metadata col */}
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          {/* 4 fields — flex wrap: 2-col on wide, stacks on very narrow */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 32px', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 110px', minWidth: 0 }}>
              <div style={fieldLabel}>Genre</div>
              <div style={fieldValue}>{song.genre}</div>
            </div>
            <div style={{ flex: '1 1 110px', minWidth: 0 }}>
              <div style={fieldLabel}>Mood</div>
              <div style={fieldValue}>{song.mood}</div>
            </div>
            <div style={{ flex: '1 1 110px', minWidth: 0 }}>
              <div style={fieldLabel}>Occasion</div>
              <div style={fieldValue}>{song.ocasion}</div>
            </div>
            <div style={{ flex: '1 1 110px', minWidth: 0 }}>
              <div style={fieldLabel}>Singer Voice</div>
              <div style={fieldValue}>{song.singer_voice}</div>
            </div>
          </div>

          {song.prompt && (
            <div style={{ marginBottom: '20px' }}>
              <div style={fieldLabel}>Prompt</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
                {song.prompt}
              </div>
            </div>
          )}

          {!song.audio_file && song.shareable_link && <ShareableLink url={song.shareable_link} />}
        </div>
      </div>

      {/* Delete */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--surface-2)' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'transparent',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '10px 20px',
            cursor: deleting ? 'not-allowed' : 'pointer',
            borderRadius: '50px',
            opacity: deleting ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {deleting ? 'Deleting…' : 'Delete Song'}
        </button>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SongDetail />);
