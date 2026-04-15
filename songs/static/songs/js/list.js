/* Song list page — fetches GET /songs/ and renders player rows */
const PageHeader  = window.Header;
const PageSongRow = window.SongRow;

function NowPlayingBar({ song, audioRef, playing, setPlaying, current, duration, volume, setVolume, speed, setSpeed }) {
  const [showSpeeds, setShowSpeeds] = React.useState(false);

  if (!song) return null;

  const progress = duration ? (current / duration) * 100 : 0;

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function handleSeek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else          { audioRef.current.play();  setPlaying(true); }
  }

  function handleSpeed(s) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    setShowSpeeds(false);
  }

  function handleVolume(e) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '220px', right: 0,
      background: '#181818',
      borderTop: '1px solid var(--surface-2)',
      padding: '0 28px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      zIndex: 100,
    }}>

      {/* Song info */}
      <div style={{ flex: '0 0 180px', minWidth: 0 }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.genre} · {song.mood}
        </div>
      </div>

      {/* Center: play button + seek bar */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={togglePlay}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1)'; }}
          style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'var(--accent)',
            border: 'none', borderRadius: '50%',
            cursor: 'pointer', color: '#000', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(29,185,84,0.35)',
            transition: 'background 0.15s, transform 0.1s',
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {fmt(current)}
        </span>
        <div
          onClick={handleSeek}
          style={{ flex: 1, height: '3px', background: 'var(--surface-3)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
          onMouseEnter={e => { e.currentTarget.style.height = '5px'; }}
          onMouseLeave={e => { e.currentTarget.style.height = '3px'; }}
        >
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', pointerEvents: 'none' }} />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {fmt(duration)}
        </span>
      </div>

      {/* Right: speed + volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

        {/* Speed popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSpeeds(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            style={{
              background: speed !== 1 ? 'var(--accent)' : 'transparent',
              border: '1px solid ' + (speed !== 1 ? 'var(--accent)' : 'var(--surface-3)'),
              color: speed !== 1 ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px', padding: '3px 10px',
              borderRadius: '4px', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            speed {speed}×
          </button>
          {showSpeeds && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--surface-2)',
              border: '1px solid var(--surface-3)',
              borderRadius: '6px', padding: '4px',
              display: 'flex', gap: '4px',
              zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}>
              {window.SPEEDS.map(s => (
                <button key={s} onClick={() => handleSpeed(s)}
                  onMouseEnter={e => { if (speed !== s) e.currentTarget.style.background = 'var(--surface-3)'; }}
                  onMouseLeave={e => { if (speed !== s) e.currentTarget.style.background = 'transparent'; }}
                  style={{
                    background: speed === s ? 'var(--accent)' : 'transparent',
                    border: '1px solid ' + (speed === s ? 'var(--accent)' : 'transparent'),
                    color: speed === s ? '#000' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px', padding: '3px 7px',
                    borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'background 0.12s',
                  }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>Vol</span>
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume} onChange={handleVolume}
            style={{ width: '80px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '26px', textAlign: 'right' }}>
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SongList() {
  const [songs, setSongs]           = React.useState([]);
  const [loading, setLoading]       = React.useState(true);
  const [error, setError]           = React.useState(null);
  const [nowPlaying, setNowPlaying] = React.useState(null);
  const [playing, setPlaying]       = React.useState(false);
  const [current, setCurrent]       = React.useState(0);
  const [duration, setDuration]     = React.useState(0);
  const [volume, setVolume]         = React.useState(1);
  const [speed, setSpeed]           = React.useState(1);
  const audioRef = React.useRef(null);

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

  React.useEffect(() => {
    const hasActive = songs.some(s => s.status === 'Pending' || s.status === 'Generating');
    if (!hasActive) return;
    const timer = setInterval(fetchSongs, 5000);
    return () => clearInterval(timer);
  }, [songs]);

  function handlePlay(song) {
    if (!song.audio_file) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (nowPlaying?.id === song.id) {
      if (playing) { audio.pause(); setPlaying(false); }
      else         { audio.play();  setPlaying(true); }
    } else {
      audio.src = song.audio_file;
      audio.playbackRate = speed;
      audio.volume = volume;
      audio.play();
      setNowPlaying(song);
      setPlaying(true);
      setCurrent(0);
      setDuration(0);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <PageHeader />

      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
      />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', paddingBottom: nowPlaying ? '108px' : '40px' }}>

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
        {loading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}
        {error   && <p style={{ color: 'var(--error)',      fontSize: '14px' }}>Error: {error}</p>}
        {!loading && !error && songs.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
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

        {/* Song cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {songs.map((song, index) => (
            <PageSongRow
              key={song.id}
              song={song}
              index={index}
              isPlaying={playing && nowPlaying?.id === song.id}
              isActive={nowPlaying?.id === song.id}
              onPlay={() => handlePlay(song)}
              onClick={() => { window.location.href = `/song/${song.id}/`; }}
            />
          ))}
        </div>

      </main>

      <NowPlayingBar
        song={nowPlaying}
        audioRef={audioRef}
        playing={playing}
        setPlaying={setPlaying}
        current={current}
        duration={duration}
        volume={volume}
        setVolume={setVolume}
        speed={speed}
        setSpeed={setSpeed}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SongList />);
