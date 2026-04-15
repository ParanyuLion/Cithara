/* Song list page — fetches GET /songs/ and renders player rows */
const PageHeader  = window.Header;
const PageSongRow = window.SongRow;

function SongList() {
  const [songs, setSongs]     = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);

  async function fetchSongs() {
    try {
      const res = await fetch('/songs/');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setSongs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { fetchSongs(); }, []);

  /* Auto-refresh every 5s while any song is in-progress */
  React.useEffect(() => {
    const hasActive = songs.some(s => s.status === 'Pending' || s.status === 'Generating');
    if (!hasActive) return;
    const timer = setInterval(fetchSongs, 5000);
    return () => clearInterval(timer);
  }, [songs]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <PageHeader />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            My Library
          </h1>
          {!loading && !error && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>

        {/* States */}
        {loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
        )}
        {error && (
          <p style={{ color: 'var(--error)', fontSize: '14px' }}>Error: {error}</p>
        )}
        {!loading && !error && songs.length === 0 && (
          <div style={{
            padding: '48px 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>♪</div>
            <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
              No songs yet
            </p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              Create your first AI-generated song
            </p>
            <a
              href="/new/"
              style={{
                display: 'inline-block',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 28px',
                borderRadius: '50px',
                textDecoration: 'none',
              }}
            >
              + New Song
            </a>
          </div>
        )}

        {/* Table header */}
        {songs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 52px 1fr auto auto',
            gap: '14px',
            padding: '0 12px 10px',
            borderBottom: '1px solid var(--surface-2)',
            marginBottom: '4px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <div style={{ textAlign: 'center' }}>#</div>
            <div></div>
            <div>Title</div>
            <div></div>
            <div>Status</div>
          </div>
        )}

        {/* Song rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {songs.map((song, index) => (
            <PageSongRow
              key={song.id}
              song={song}
              index={index}
              onClick={() => { window.location.href = `/song/${song.id}/`; }}
            />
          ))}
        </div>

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SongList />);
