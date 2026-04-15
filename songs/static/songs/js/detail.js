/* Song detail page — fetches GET /songs/:id/ and displays all fields */
const PageHeader = window.Header;
const PageStatusBadge = window.StatusBadge;

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

  const backLink = (
    <a href="/" style={{
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '1px',
      textDecoration: 'none',
    }}>
      ← BACK
    </a>
  );

  const wrapMain = content => (
    <div>
      <PageHeader rightSlot={backLink} />
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
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
      {song.audio_file && (
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          marginBottom: '24px',
        }}>
          <div style={{ ...fieldLabel, marginBottom: '10px' }}>Audio</div>
          <audio controls src={song.audio_file} style={{ width: '100%' }} />
        </div>
      )}

      {/* Shareable link */}
      {song.shareable_link && (
        <div style={{ marginBottom: '24px' }}>
          <div style={fieldLabel}>Shareable Link</div>
          <a
            href={song.shareable_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              wordBreak: 'break-all',
            }}
          >
            {song.shareable_link}
          </a>
        </div>
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
