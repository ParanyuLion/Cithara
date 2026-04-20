/* Song list page — fetches GET /songs/ and renders player rows */
const PageHeader = window.Header;
const PageSongRow = window.SongRow;

function FunnelIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16l-6.5 8.5V20l-3-1.5V12.5L4 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: "72px 0 80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Abstract AI music illustration */}
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" style={{ marginBottom: "28px", opacity: 0.9 }}>
        <circle cx="80" cy="80" r="72" stroke="rgba(29,185,84,0.08)" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="80" cy="80" r="50" stroke="rgba(29,185,84,0.12)" strokeWidth="1" />
        <circle cx="80" cy="80" r="28" fill="rgba(29,185,84,0.07)" stroke="rgba(29,185,84,0.2)" strokeWidth="1.5" />
        {/* musical note */}
        <path d="M76 68v18M76 68l12-4v18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="74" cy="86" r="4" fill="var(--accent)" opacity="0.7" />
        <circle cx="86" cy="82" r="4" fill="var(--accent)" opacity="0.7" />
        {/* waveform left */}
        <path d="M18 80 Q25 68 32 80 Q39 92 46 80" stroke="rgba(29,185,84,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* waveform right */}
        <path d="M114 80 Q121 68 128 80 Q135 92 142 80" stroke="rgba(29,185,84,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* nodes */}
        <circle cx="40" cy="46" r="3.5" fill="rgba(29,185,84,0.25)" />
        <circle cx="120" cy="46" r="2.5" fill="rgba(29,185,84,0.2)" />
        <circle cx="32" cy="115" r="2" fill="rgba(29,185,84,0.18)" />
        <circle cx="128" cy="112" r="3" fill="rgba(29,185,84,0.22)" />
        <circle cx="80" cy="20" r="2.5" fill="rgba(29,185,84,0.2)" />
        <circle cx="80" cy="140" r="2.5" fill="rgba(29,185,84,0.2)" />
        {/* connector lines */}
        <line x1="40" y1="46" x2="62" y2="63" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />
        <line x1="120" y1="46" x2="98" y2="63" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />
        <line x1="80" y1="20" x2="80" y2="52" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />
        <line x1="32" y1="115" x2="58" y2="98" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />
        <line x1="128" y1="112" x2="102" y2="98" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />
      </svg>
      <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.3px" }}>
        Your library is empty
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px", maxWidth: "280px", lineHeight: 1.6 }}>
        No songs yet. Let AI compose your first track — just describe what you have in mind.
      </p>
      <a
        href="/new/"
        onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(29,185,84,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(29,185,84,0.3)"; }}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "var(--accent)", color: "#000",
          fontWeight: 800, fontSize: "15px",
          padding: "14px 32px", borderRadius: "50px",
          textDecoration: "none", letterSpacing: "-0.2px",
          boxShadow: "0 4px 16px rgba(29,185,84,0.3)",
          transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4L13.8 8.2L18 10L13.8 11.8L12 16L10.2 11.8L6 10L10.2 8.2L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" /></svg>
        Generate a Song
      </a>
    </div>
  );
}

function NowPlayingBar({
  song, audioRef, playing, setPlaying,
  current, duration, volume, setVolume,
  speed, setSpeed, onPrev, onNext,
}) {
  const [showSpeeds, setShowSpeeds] = React.useState(false);

  if (!song) return null;

  const progress = duration ? (current / duration) * 100 : 0;

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
    else { audioRef.current.play(); setPlaying(true); }
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

  const iconBtn = {
    background: "transparent", border: "none",
    color: "var(--text-muted)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "6px", borderRadius: "50%",
    transition: "color 0.12s, background 0.12s",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: "220px", right: 0,
        background: "linear-gradient(180deg, rgba(20,20,20,0.97) 0%, #111 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "0 24px", height: "80px",
        display: "flex", alignItems: "center", gap: "20px",
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Cover + song info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "0 0 200px", minWidth: 0 }}>
        <div style={{
          width: "46px", height: "46px", borderRadius: "6px", flexShrink: 0,
          background: song.cover_image_url ? "none" : "linear-gradient(135deg,#1DB954 0%,#0d7a3a 100%)",
          overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.7)", fontSize: "18px",
        }}>
          {song.cover_image_url
            ? <img src={song.cover_image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : "♪"
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "var(--text)", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {song.title}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {song.genre} · {song.mood}
          </div>
        </div>
      </div>

      {/* Center: prev + play + next + seek */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Prev */}
          <button
            onClick={onPrev}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
            style={iconBtn}
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "scale(1)"; }}
            style={{
              width: "38px", height: "38px", flexShrink: 0,
              background: "var(--accent)", border: "none", borderRadius: "50%",
              cursor: "pointer", color: "#000", fontSize: "13px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(29,185,84,0.4)",
              transition: "background 0.15s, transform 0.1s",
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
            style={iconBtn}
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z" /></svg>
          </button>
        </div>

        {/* Seek row */}
        <div style={{ width: "100%", maxWidth: "460px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "30px", textAlign: "right" }}>
            {fmt(current)}
          </span>
          <div
            onClick={handleSeek}
            style={{ flex: 1, height: "3px", background: "var(--surface-3)", borderRadius: "2px", cursor: "pointer", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.height = "5px"; }}
            onMouseLeave={e => { e.currentTarget.style.height = "3px"; }}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: "2px", pointerEvents: "none" }} />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "30px" }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Right: speed + volume */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        {/* Speed */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowSpeeds(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            style={{
              background: speed !== 1 ? "var(--accent)" : "transparent",
              border: "1px solid " + (speed !== 1 ? "var(--accent)" : "var(--surface-3)"),
              color: speed !== 1 ? "#000" : "var(--text-muted)",
              fontFamily: "var(--font-mono)", fontSize: "10px",
              padding: "3px 10px", borderRadius: "4px", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {speed}×
          </button>
          {showSpeeds && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
              background: "var(--surface-2)", border: "1px solid var(--surface-3)",
              borderRadius: "6px", padding: "4px", display: "flex", gap: "4px",
              zIndex: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}>
              {window.SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeed(s)}
                  onMouseEnter={e => { if (speed !== s) e.currentTarget.style.background = "var(--surface-3)"; }}
                  onMouseLeave={e => { if (speed !== s) e.currentTarget.style.background = "transparent"; }}
                  style={{
                    background: speed === s ? "var(--accent)" : "transparent",
                    border: "1px solid " + (speed === s ? "var(--accent)" : "transparent"),
                    color: speed === s ? "#000" : "var(--text-muted)",
                    fontFamily: "var(--font-mono)", fontSize: "10px",
                    padding: "3px 7px", borderRadius: "4px", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "background 0.12s",
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            {volume > 0 && volume <= 0.5 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
          </svg>
          <input
            type="range" min="0" max="1" step="0.01" value={volume}
            onChange={handleVolume}
            style={{ width: "72px", accentColor: "var(--accent)", cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}

function SongList() {
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [nowPlaying, setNowPlaying] = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [speed, setSpeed] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState({});
  const audioRef = React.useRef(null);
  const filterBtnRef = React.useRef(null);
  const filterMenuRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    function onOut(e) {
      if (
        filterMenuRef.current && !filterMenuRef.current.contains(e.target) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  async function fetchSongs() {
    try {
      const res = await fetch("/songs/");
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
    const hasActive = songs.some(s => s.status === "Pending" || s.status === "Generating");
    if (!hasActive) return;
    const timer = setInterval(fetchSongs, 5000);
    return () => clearInterval(timer);
  }, [songs]);

  // Filtered list
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return songs.filter(s => {
      const matchesQuery = !q || [s.title, s.genre, s.mood, s.ocasion, s.singer_voice].some(v => v && v.toLowerCase().includes(q));
      const matchesStatus = !activeFilters.status || s.status === activeFilters.status;
      return matchesQuery && matchesStatus;
    });
  }, [songs, query, activeFilters]);

  // Unique filter values
  const allStatuses = React.useMemo(() => [...new Set(songs.map(s => s.status).filter(Boolean))], [songs]);
  const hasActiveFilter = Object.values(activeFilters).some(Boolean);

  function toggleFilter(key, val) {
    setActiveFilters(prev => ({ ...prev, [key]: prev[key] === val ? "" : val }));
  }

  async function handleDelete(songId) {
    setDeleting(true);
    try {
      const res = await fetch(`/songs/${songId}/delete/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSongs(prev => prev.filter(s => s.id !== songId));
      if (nowPlaying?.id === songId) {
        setNowPlaying(null); setPlaying(false);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteConfirm(song) { if (!deleting) setDeleteTarget(song); }
  function closeDeleteConfirm() { if (!deleting) setDeleteTarget(null); }

  function handlePlay(song) {
    if (!song.audio_file) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (nowPlaying?.id === song.id) {
      if (playing) { audio.pause(); setPlaying(false); }
      else { audio.play(); setPlaying(true); }
    } else {
      audio.src = song.audio_file;
      audio.playbackRate = speed;
      audio.volume = volume;
      audio.play();
      setNowPlaying(song); setPlaying(true); setCurrent(0); setDuration(0);
    }
  }

  function handleNext() {
    const playable = songs.filter(s => s.audio_file);
    if (!playable.length) return;
    const idx = nowPlaying ? playable.findIndex(s => s.id === nowPlaying.id) : -1;
    handlePlay(playable[(idx + 1) % playable.length]);
  }

  function handlePrev() {
    const playable = songs.filter(s => s.audio_file);
    if (!playable.length) return;
    const idx = nowPlaying ? playable.findIndex(s => s.id === nowPlaying.id) : 0;
    handlePlay(playable[(idx - 1 + playable.length) % playable.length]);
  }

  const chipStyle = (active) => ({
    padding: "4px 10px", borderRadius: "50px", fontSize: "12px", fontWeight: 600,
    cursor: "pointer", border: "1px solid",
    borderColor: active ? "var(--accent)" : "rgba(255,255,255,0.1)",
    background: active ? "rgba(29,185,84,0.15)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    transition: "all 0.12s",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <PageHeader />

      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); handleNext(); }}
        style={{ display: "none" }}
      />

      <main
        style={{
          flex: 1, padding: "40px 48px", overflowY: "auto",
          paddingBottom: nowPlaying ? "108px" : "40px",
        }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "4px" }}>
            My Library
          </h1>
          {!loading && !error && (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          )}
        </div>

        {/* Search + filter bar */}
        {!loading && !error && songs.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "28px", alignItems: "center" }}>
            {/* Search input */}
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                color: "var(--text-muted)", fontSize: "16px", pointerEvents: "none", lineHeight: 1,
              }}>
                ⌕
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search songs…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px rgba(29,185,84,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                onKeyDown={e => { if (e.key === "Escape") { setQuery(""); searchInputRef.current?.blur(); } }}
                style={{
                  width: "100%", padding: "10px 14px 10px 40px",
                  background: "#111", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
                  fontFamily: "var(--font-sans)",
                  boxSizing: "border-box",
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
                  style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "transparent", border: "none", color: "var(--text-muted)",
                    cursor: "pointer", fontSize: "14px", padding: "4px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              )}
            </div>

            {/* Filter funnel button */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                ref={filterBtnRef}
                onClick={() => setFilterOpen(v => !v)}
                title="Filter"
                onMouseEnter={e => { e.currentTarget.style.borderColor = hasActiveFilter ? "var(--accent)" : "rgba(255,255,255,0.2)"; e.currentTarget.style.color = hasActiveFilter ? "var(--accent)" : "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = hasActiveFilter ? "var(--accent)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.color = hasActiveFilter ? "var(--accent)" : "var(--text-muted)"; }}
                style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: hasActiveFilter ? "rgba(29,185,84,0.1)" : "#111",
                  border: "1px solid " + (hasActiveFilter ? "var(--accent)" : "rgba(255,255,255,0.1)"),
                  color: hasActiveFilter ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.12s",
                }}
              >
                <FunnelIcon active={hasActiveFilter} />
              </button>

              {filterOpen && (
                <div
                  ref={filterMenuRef}
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px", padding: "14px 16px",
                    zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    minWidth: "200px",
                  }}
                >
                  <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Status
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {allStatuses.map(s => (
                      <button key={s} onClick={() => toggleFilter("status", s)} style={chipStyle(activeFilters.status === s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {hasActiveFilter && (
                    <button
                      onClick={() => setActiveFilters({})}
                      style={{ marginTop: "12px", background: "transparent", border: "none", color: "var(--error)", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* States */}
        {loading && <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading…</p>}
        {error && <p style={{ color: "var(--error)", fontSize: "14px" }}>Error: {error}</p>}
        {!loading && !error && songs.length === 0 && <EmptyState />}
        {!loading && !error && songs.length > 0 && filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>⌕</div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>No results</p>
            <p style={{ fontSize: "14px" }}>No songs match "{query || Object.values(activeFilters).filter(Boolean).join(", ")}"</p>
          </div>
        )}

        {/* Song cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((song, index) => (
            <PageSongRow
              key={song.id}
              song={song}
              index={songs.indexOf(song)}
              isPlaying={playing && nowPlaying?.id === song.id}
              isActive={nowPlaying?.id === song.id}
              onPlay={() => handlePlay(song)}
              onDelete={() => openDeleteConfirm(song)}
              onClick={() => { window.location.href = `/song/${song.id}/`; }}
            />
          ))}
        </div>

        {deleteTarget && (
          <div
            onClick={closeDeleteConfirm}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000, padding: "16px",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: "430px",
                background: "var(--surface)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px", boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>Delete song?</div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "18px" }}>
                This action cannot be undone. "{deleteTarget.title}" will be permanently removed from your library.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button" onClick={closeDeleteConfirm} disabled={deleting}
                  style={{ background: "transparent", border: "1px solid var(--surface-3)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, padding: "9px 14px", borderRadius: "999px", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button" onClick={() => handleDelete(deleteTarget.id)} disabled={deleting}
                  style={{ background: "var(--error)", border: "1px solid var(--error)", color: "#1a0004", fontSize: "13px", fontWeight: 700, padding: "9px 14px", borderRadius: "999px", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
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
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SongList />);
