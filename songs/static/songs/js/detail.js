/* Song detail page — fetches GET /songs/:id/ and displays all fields */
const PageHeader = window.Header;
const PageStatusBadge = window.StatusBadge;

function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatFullDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    + " at "
    + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function AudioPlayer({ song }) {
  const src = song.audio_file;

  const audioRef = React.useRef(null);
  const seekRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const animFrmRef = React.useRef(null);

  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [showSpeeds, setShowSpeeds] = React.useState(false);

  const albumGrads = {
    Completed: "linear-gradient(135deg,#1DB954 0%,#0d7a3a 100%)",
    Generating: "linear-gradient(135deg,#ffa42b 0%,#b56a00 100%)",
    Pending: "linear-gradient(135deg,#535353 0%,#282828 100%)",
    Failed: "linear-gradient(135deg,#f15e6c 0%,#7a1a23 100%)",
  };
  const albumGrad = albumGrads[song.status] || albumGrads.Pending;

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  /* ── Visualizer ─────────────────────────────────────────── */
  function drawStatic() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const N = 80;
    const barW = W / N;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const h = Math.max(
        4,
        (0.08 + 0.25 * Math.abs(Math.sin(i * 0.38)) * Math.sin(i * 0.13 + 1)) *
          H,
      );
      ctx.fillStyle = "rgba(29,185,84,0.18)";
      const x = i * barW + 1;
      ctx.beginPath();
      ctx.roundRect(x, H / 2 - h / 2, Math.max(1, barW - 2), h, 2);
      ctx.fill();
    }
  }

  function startVisualizer() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    const barW = W / bufLen;

    function draw() {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < bufLen; i++) {
        const h = Math.max(4, (data[i] / 255) * H);
        const x = i * barW + 1;
        const g = ctx.createLinearGradient(0, H / 2 - h / 2, 0, H / 2 + h / 2);
        g.addColorStop(0, "#1DB954");
        g.addColorStop(1, "rgba(29,185,84,0.25)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, H / 2 - h / 2, Math.max(1, barW - 2), h, 2);
        ctx.fill();
      }
      animFrmRef.current = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopVisualizer() {
    if (animFrmRef.current) {
      cancelAnimationFrame(animFrmRef.current);
      animFrmRef.current = null;
    }
    drawStatic();
  }

  React.useEffect(() => {
    drawStatic();
    return () => {
      if (animFrmRef.current) cancelAnimationFrame(animFrmRef.current);
    };
  }, []);

  /* ── Audio context ──────────────────────────────────────── */
  function ensureAudioCtx() {
    if (audioCtxRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    const actx = new AC();
    const analyser = actx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    const source = actx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(actx.destination);
    audioCtxRef.current = actx;
    analyserRef.current = analyser;
  }

  /* ── Controls ───────────────────────────────────────────── */
  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      ensureAudioCtx();
      if (audioCtxRef.current.state === "suspended")
        audioCtxRef.current.resume();
      a.play();
      setPlaying(true);
      startVisualizer();
    } else {
      a.pause();
      setPlaying(false);
      stopVisualizer();
    }
  }

  function handleSeek(e) {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = seekRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
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
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setPlaying(false);
          stopVisualizer();
        }}
      />

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Album art */}
        <div
          style={{
            width: "160px",
            height: "160px",
            flexShrink: 0,
            borderRadius: "12px",
            background: albumGrad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "56px",
            color: "rgba(255,255,255,0.75)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
          }}
        >
          ♪
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Song info */}
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {song.title}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {song.genre} · {song.mood}
            </div>
          </div>

          {/* Waveform canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={64}
            style={{
              width: "100%",
              height: "64px",
              borderRadius: "6px",
              display: "block",
            }}
          />

          {/* Seek bar with timestamps on both ends */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
                width: "34px",
              }}
            >
              {fmt(current)}
            </span>
            <div
              ref={seekRef}
              onClick={handleSeek}
              style={{
                flex: 1,
                height: "4px",
                background: "var(--surface-3)",
                borderRadius: "2px",
                cursor: "pointer",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.height = "6px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.height = "4px";
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "var(--accent)",
                  borderRadius: "2px",
                  pointerEvents: "none",
                  transition: "width 0.1s",
                }}
              />
            </div>
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
                width: "34px",
                textAlign: "right",
              }}
            >
              {fmt(duration)}
            </span>
          </div>

          {/* Controls row: play + speed + volume */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Play button */}
            <button
              onClick={togglePlay}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.transform = "scale(1.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              style={{
                width: "44px",
                height: "44px",
                flexShrink: 0,
                background: "var(--accent)",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                color: "#000",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(29,185,84,0.4)",
                transition: "background 0.15s, transform 0.1s",
              }}
            >
              {playing ? "⏸" : "▶"}
            </button>

            {/* Speed */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowSpeeds((v) => !v)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                style={{
                  background: speed !== 1 ? "var(--accent)" : "transparent",
                  border:
                    "1px solid " +
                    (speed !== 1 ? "var(--accent)" : "var(--surface-3)"),
                  color: speed !== 1 ? "#000" : "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                speed {speed}×
              </button>
              {showSpeeds && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                    gap: "4px",
                    zIndex: 20,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {window.SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setShowSpeeds(false);
                      }}
                      onMouseEnter={(e) => {
                        if (speed !== s)
                          e.currentTarget.style.background = "var(--surface-3)";
                      }}
                      onMouseLeave={(e) => {
                        if (speed !== s)
                          e.currentTarget.style.background = "transparent";
                      }}
                      style={{
                        background:
                          speed === s ? "var(--accent)" : "transparent",
                        border:
                          "1px solid " +
                          (speed === s ? "var(--accent)" : "transparent"),
                        color: speed === s ? "#000" : "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        padding: "3px 7px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.12s",
                      }}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                minWidth: "140px",
              }}
            >
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Vol
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolume}
                style={{
                  flex: 1,
                  accentColor: "var(--accent)",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  width: "28px",
                  textAlign: "right",
                }}
              >
                {Math.round(volume * 100)}
              </span>
            </div>
          </div>
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
    <div style={{ marginBottom: "28px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: "8px",
        }}
      >
        Shareable Link
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--surface-3)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <input
          value={url}
          readOnly
          onClick={(e) => e.target.select()}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            padding: "10px 14px",
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          onClick={handleCopy}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.background = "rgba(29,185,84,0.15)";
              e.currentTarget.style.color = "var(--accent)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
          style={{
            flexShrink: 0,
            background: copied ? "rgba(29,185,84,0.2)" : "transparent",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            color: copied ? "var(--accent)" : "var(--text-muted)",
            fontSize: "12px",
            fontWeight: 600,
            padding: "10px 16px",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Copied" : "⎘ Copy"}
        </button>
      </div>
    </div>
  );
}

function GeneratingCard({ status, createdAt }) {
  function calcProgress() {
    const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
    return Math.min(85, 5 + (elapsed / 120) * 80);
  }

  const [progress, setProgress] = React.useState(calcProgress);

  React.useEffect(() => {
    if (!document.getElementById("cithara-spin-style")) {
      const s = document.createElement("style");
      s.id = "cithara-spin-style";
      s.textContent =
        "@keyframes cithara-spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setProgress(calcProgress()), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: "16px",
        padding: "40px 24px",
        border: "1px solid rgba(255,164,43,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "3px solid rgba(255,164,43,0.2)",
          borderTopColor: "var(--warn)",
          animation: "cithara-spin 1.2s linear infinite",
        }}
      />

      <div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "6px",
          }}
        >
          {status === "Pending" ? "Queued for generation…" : "Generating your song…"}
        </div>
        <div
          style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}
        >
          This usually takes 1–2 minutes. The page updates automatically.
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: progress + "%",
            background: "var(--warn)",
            transition: "width 0.85s ease",
          }}
        />
      </div>
    </div>
  );
}

function FailedCard({ song }) {
  function getRegenerateUrl() {
    const params = new URLSearchParams({
      title: song.title || "",
      genre: song.genre || "",
      mood: song.mood || "",
      ocasion: song.ocasion || "",
      singer_voice: song.singer_voice || "",
      prompt: song.prompt || "",
    });
    return `/new/?${params.toString()}`;
  }

  return (
    <div
      style={{
        background: "rgba(241,94,108,0.07)",
        borderRadius: "16px",
        padding: "40px 24px",
        border: "1px solid rgba(241,94,108,0.22)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(241,94,108,0.12)",
          border: "2px solid var(--error)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          color: "var(--error)",
        }}
      >
        ✕
      </div>

      <div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--error)",
            marginBottom: "6px",
          }}
        >
          Generation failed
        </div>
        <div
          style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}
        >
          Something went wrong while creating this song. You can try regenerating
          it with the same settings.
        </div>
        {song.failure_reason && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              background: "rgba(241,94,108,0.1)",
              border: "1px solid rgba(241,94,108,0.25)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--error)",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.5,
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            {song.failure_reason}
          </div>
        )}
      </div>

      <a
        href={getRegenerateUrl()}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(241,94,108,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "1px solid var(--error)",
          color: "var(--error)",
          fontSize: "13px",
          fontWeight: 600,
          padding: "9px 20px",
          borderRadius: "999px",
          textDecoration: "none",
          transition: "background 0.15s",
        }}
      >
        ↻ Try Again
      </a>
    </div>
  );
}

function SongDetail() {
  const songId = window.SONG_ID;
  const [song, setSong] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [shareState, setShareState] = React.useState(null); // null | 'copied' | 'error'
  const [dlState, setDlState] = React.useState(null);       // null | 'error'
  const [showDlMenu, setShowDlMenu] = React.useState(false);
  const dlMenuRef = React.useRef(null);
  React.useEffect(() => {
    function onClickOutside(e) {
      if (dlMenuRef.current && !dlMenuRef.current.contains(e.target)) setShowDlMenu(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  async function fetchSong() {
    try {
      const res = await fetch(`/songs/${songId}/`);
      if (!res.ok)
        throw new Error(
          res.status === 404 ? "Song not found" : `Server error ${res.status}`,
        );
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

  React.useEffect(() => {
    if (!song) return;
    if (song.status !== "Pending" && song.status !== "Generating") return;
    const timer = setInterval(fetchSong, 5000);
    return () => clearInterval(timer);
  }, [song]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/songs/${songId}/delete/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Delete failed");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function openDeleteConfirm() {
    if (deleting) return;
    setShowDeleteConfirm(true);
  }

  function closeDeleteConfirm() {
    if (deleting) return;
    setShowDeleteConfirm(false);
  }

  async function handleDownload(ext) {
    try {
      const res = await fetch(song.audio_file);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (song.title || 'song').replace(/[^\w\s-]/g, '') + '.' + ext;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDlState('error');
      setTimeout(() => setDlState(null), 3000);
    }
  }

  function handleCopyShareLink() {
    if (!song?.shareable_link) {
      setShareState('error');
      setTimeout(() => setShareState(null), 3000);
      return;
    }
    navigator.clipboard
      .writeText(song.shareable_link)
      .then(() => {
        setShareState('copied');
        setTimeout(() => setShareState(null), 2000);
      })
      .catch(() => {
        setShareState('error');
        setTimeout(() => setShareState(null), 3000);
      });
  }

  const wrapMain = (content) => (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <PageHeader />
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        <div style={{ maxWidth: "1100px", width: "100%" }}>
          <a
            href="/"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-muted)",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: "32px",
              transition: "color 0.15s",
            }}
          >
            ← Back
          </a>
          {content}
        </div>
      </main>
    </div>
  );

  if (loading)
    return wrapMain(
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading…</p>,
    );

  if (error)
    return wrapMain(
      <p style={{ color: "var(--error)", fontSize: "14px" }}>Error: {error}</p>,
    );

  const fieldLabel = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "4px",
  };
  const fieldValue = { color: "var(--text)", fontSize: "15px" };

  return wrapMain(
    <React.Fragment>
      {/* Title + status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
          gap: "16px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
            flex: 1,
          }}
        >
          {song.title}
        </h1>
        <PageStatusBadge status={song.status} />
      </div>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {song.genre} · {song.mood} · {song.ocasion}
      </p>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "12px",
          marginBottom: "40px",
          opacity: 0.6,
        }}
      >
        {formatFullDate(song.created_at)} · {formatRelativeTime(song.created_at)}
      </p>

      {(song.audio_file || song.shareable_link) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {song.audio_file && (
              <div ref={dlMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => dlState !== 'error' && setShowDlMenu(v => !v)}
                  onMouseEnter={(e) => {
                    if (dlState !== 'error') { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "scale(1.02)"; }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = dlState === 'error' ? "rgba(241,94,108,0.15)" : "var(--accent)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: dlState === 'error' ? "rgba(241,94,108,0.15)" : "var(--accent)",
                    color: dlState === 'error' ? "var(--error)" : "#000",
                    border: dlState === 'error' ? "1px solid var(--error)" : "none",
                    fontSize: "13px", fontWeight: 700, padding: "9px 18px",
                    borderRadius: "999px", cursor: "pointer",
                    transition: "background 0.15s, transform 0.1s",
                    boxShadow: dlState === 'error' ? "none" : "0 4px 16px rgba(29,185,84,0.35)",
                  }}
                >
                  {dlState === 'error' ? '✕ Download Failed' : '↓ Download ▾'}
                </button>
                {showDlMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', overflow: 'hidden', zIndex: 100,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '130px',
                  }}>
                    {['m4a', 'mp3'].map(ext => (
                      <button
                        key={ext}
                        onClick={() => { setShowDlMenu(false); handleDownload(ext); }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          background: 'transparent', border: 'none',
                          color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                          padding: '10px 16px', cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        ↓ {ext.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {song.shareable_link && (
              <button
                onClick={handleCopyShareLink}
                onMouseEnter={(e) => {
                  if (!shareState)
                    e.currentTarget.style.background = "rgba(29,185,84,0.15)";
                }}
                onMouseLeave={(e) => {
                  if (!shareState)
                    e.currentTarget.style.background = "transparent";
                }}
                style={{
                  background: shareState === 'copied' ? "rgba(29,185,84,0.22)" : shareState === 'error' ? "rgba(241,94,108,0.15)" : "transparent",
                  border: shareState === 'error' ? "1px solid var(--error)" : "1px solid rgba(29,185,84,0.5)",
                  color: shareState === 'copied' ? "var(--accent)" : shareState === 'error' ? "var(--error)" : "var(--text)",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "9px 16px",
                  cursor: "pointer",
                  borderRadius: "999px",
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {shareState === 'copied' ? "✓ Copied Link" : shareState === 'error' ? "✕ Copy Failed" : "⎘ Share Link"}
              </button>
            )}
          </div>

          <button
            onClick={openDeleteConfirm}
            disabled={deleting}
            onMouseEnter={(e) => {
              if (!deleting)
                e.currentTarget.style.background = "rgba(241,94,108,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              background: "transparent",
              border: "1px solid var(--error)",
              color: "var(--error)",
              fontSize: "13px",
              fontWeight: 600,
              padding: "9px 16px",
              cursor: deleting ? "not-allowed" : "pointer",
              borderRadius: "999px",
              opacity: deleting ? 0.6 : 1,
              transition: "background 0.15s, opacity 0.15s",
              whiteSpace: "nowrap",
              marginLeft: "auto",
            }}
          >
            {deleting ? "Deleting…" : "Delete Song"}
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
          marginBottom: "28px",
          alignItems: "start",
        }}
      >
        {/* Audio col */}
        {song.audio_file ? (
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <AudioPlayer song={song} />
          </div>
        ) : song.status === "Pending" || song.status === "Generating" ? (
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <GeneratingCard status={song.status} createdAt={song.created_at} />
          </div>
        ) : song.status === "Failed" ? (
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <FailedCard song={song} />
          </div>
        ) : null}

        {/* Metadata col */}
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px 32px",
              marginBottom: "24px",
            }}
          >
            <div style={{ flex: "1 1 110px", minWidth: 0 }}>
              <div style={fieldLabel}>Genre</div>
              <div style={fieldValue}>{song.genre}</div>
            </div>
            <div style={{ flex: "1 1 110px", minWidth: 0 }}>
              <div style={fieldLabel}>Mood</div>
              <div style={fieldValue}>{song.mood}</div>
            </div>
            <div style={{ flex: "1 1 110px", minWidth: 0 }}>
              <div style={fieldLabel}>Occasion</div>
              <div style={fieldValue}>{song.ocasion}</div>
            </div>
            <div style={{ flex: "1 1 110px", minWidth: 0 }}>
              <div style={fieldLabel}>Singer Voice</div>
              <div style={fieldValue}>{song.singer_voice}</div>
            </div>
          </div>

          {song.prompt && (
            <div style={{ marginBottom: "20px" }}>
              <div style={fieldLabel}>Prompt</div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                {song.prompt}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          onClick={closeDeleteConfirm}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
              padding: "22px",
            }}
          >
            <div
              style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}
            >
              Delete song?
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "18px",
              }}
            >
              This action cannot be undone. The song will be permanently removed
              from your library.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deleting}
                style={{
                  background: "transparent",
                  border: "1px solid var(--surface-3)",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "9px 14px",
                  borderRadius: "999px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: "var(--error)",
                  border: "1px solid var(--error)",
                  color: "#1a0004",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "9px 14px",
                  borderRadius: "999px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>,
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SongDetail />);
