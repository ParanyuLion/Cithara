/* Song list page — fetches GET /songs/ and renders player rows */
const PageHeader = window.Header;
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

  React.useEffect(() => {
    fetchSongs();
  }, []);

  /* Auto-refresh every 5s while any song is in-progress */
  React.useEffect(() => {
    const hasActive = songs.some(s => s.status === 'Pending' || s.status === 'Generating');
    if (!hasActive) return;
    const timer = setInterval(fetchSongs, 5000);
    return () => clearInterval(timer);
  }, [songs]);

  const newSongBtn = (
    <a
      href="/new/"
      style={{
        background: 'var(--accent)',
        color: '#000',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '2px',
        padding: '8px 16px',
        textDecoration: 'none',
        textTransform: 'uppercase',
        borderRadius: '2px',
      }}
    >
      + NEW SONG
    </a>
  );

  return (
    <div>
      <PageHeader rightSlot={newSongBtn} />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {loading && (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>
            LOADING...
          </p>
        )}

        {error && (
          <p style={{ color: 'var(--error)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px' }}>
            ERROR: {error}
          </p>
        )}

        {!loading && !error && songs.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px' }}>
            NO SONGS YET. <a href="/new/" style={{ color: 'var(--accent)' }}>CREATE ONE →</a>
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {songs.map(song => (
            <PageSongRow
              key={song.id}
              song={song}
              onClick={() => { window.location.href = `/song/${song.id}/`; }}
            />
          ))}
        </div>

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SongList />);
