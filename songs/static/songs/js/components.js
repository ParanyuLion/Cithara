/* Shared React components — exported to window.* for cross-script access. */

function LibraryIcon({ active }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active ? "var(--accent)" : "currentColor",
        filter: active ? "drop-shadow(0 0 6px rgba(29,185,84,0.55))" : "none",
        transition: "color 0.15s, filter 0.15s",
      }}
      aria-hidden="true"
    >
      <path
        d="M4.5 5.5C4.5 4.95 4.95 4.5 5.5 4.5H18.5C19.05 4.5 19.5 4.95 19.5 5.5V18.5C19.5 19.05 19.05 19.5 18.5 19.5H5.5C4.95 19.5 4.5 19.05 4.5 18.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 9H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 13H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="16.7"
        cy="14.8"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SparkleIcon({ active }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: active ? "var(--accent)" : "currentColor",
        filter: active ? "drop-shadow(0 0 6px rgba(29,185,84,0.55))" : "none",
        transition: "color 0.15s, filter 0.15s",
      }}
      aria-hidden="true"
    >
      <path
        d="M12 4L13.8 8.2L18 10L13.8 11.8L12 16L10.2 11.8L6 10L10.2 8.2L12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 4.5V7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 6H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.5 16.5V19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 18H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Header() {
  const currentUser = window.CURRENT_USER;
  const path = window.location.pathname;

  const displayName =
    (currentUser || "Guest")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || "Guest";
  const avatarText = displayName.charAt(0).toUpperCase() || "G";

  function handleSignOut() {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/accounts/logout/";
    const csrf = document.createElement("input");
    csrf.type = "hidden";
    csrf.name = "csrfmiddlewaretoken";
    csrf.value = window.CSRF_TOKEN;
    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
  }

  const navItems = [
    {
      label: "My Library",
      href: "/",
      icon: LibraryIcon,
      activeOn: (p) => p === "/" || p.startsWith("/song/"),
    },
    {
      label: "New Song",
      href: "/new/",
      icon: SparkleIcon,
      activeOn: (p) => p === "/new/",
    },
  ];

  return (
    <aside
      style={{
        width: "220px",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px" }}>
        <a
          href="/"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "26px", lineHeight: 1 }}>♪</span>
          <span
            style={{
              color: "var(--text)",
              fontSize: "19px",
              fontWeight: 900,
              letterSpacing: "-0.5px",
            }}
          >
            Cithara
          </span>
        </a>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0 8px", flex: 1 }}>
        {navItems.map((item) => {
          const active = item.activeOn(path);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "11px 14px",
                borderRadius: "6px",
                color: active ? "var(--text)" : "var(--text-muted)",
                fontWeight: active ? 700 : 500,
                textDecoration: "none",
                fontSize: "14px",
                background: active ? "var(--surface-2)" : "transparent",
                marginBottom: "2px",
                transition: "background 0.12s, color 0.12s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "18%",
                  bottom: "18%",
                  width: "3px",
                  borderRadius: "0 3px 3px 0",
                  background: "var(--accent)",
                  opacity: active ? 1 : 0,
                  transition: "opacity 0.15s",
                }}
              />
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon active={active} />
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* User mini-card */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--surface-2)" }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  "radial-gradient(circle at 30% 25%, #43dd7f 0%, #1DB954 45%, #0d7a3a 100%)",
                color: "#06140a",
                fontWeight: 800,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 0 0 2px rgba(29,185,84,0.2), 0 4px 12px rgba(29,185,84,0.2)",
              }}
            >
              {avatarText}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: "var(--text)",
                  fontSize: "13px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={displayName}
              >
                {displayName}
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  marginTop: "1px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={currentUser}
              >
                {currentUser}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(241,94,108,0.16)";
              e.currentTarget.style.color = "#ffd5da";
              e.currentTarget.style.borderColor = "rgba(241,94,108,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--surface-3)";
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              background: "transparent",
              border: "1px solid var(--surface-3)",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 600,
              padding: "7px 9px",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "center",
              transition: "background 0.12s, color 0.12s, border-color 0.12s",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: { bg: "rgba(29,185,84,0.15)", color: "var(--accent)", dot: "●" },
    Generating: { bg: "rgba(255,164,43,0.15)", color: "var(--warn)", dot: "◌" },
    Pending: { bg: "rgba(255,164,43,0.15)", color: "var(--warn)", dot: "○" },
    Failed: { bg: "rgba(241,94,108,0.15)", color: "var(--error)", dot: "✕" },
  };
  const s = styles[status] || {
    bg: "var(--surface-2)",
    color: "var(--text-muted)",
    dot: "·",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: s.bg,
        color: s.color,
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "50px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "8px" }}>{s.dot}</span>
      {status}
    </span>
  );
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

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
  return (
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}
function SongRow({
  song,
  onClick,
  index,
  onPlay,
  isPlaying,
  isActive,
  onDelete,
}) {
  const [hovered, setHovered] = React.useState(false);
  const [copyState, setCopyState] = React.useState(null); // null | 'copied' | 'error'
  const [dlState, setDlState] = React.useState(null); // null | 'error'
  const [showDlMenu, setShowDlMenu] = React.useState(false);
  const [dlMenuPos, setDlMenuPos] = React.useState({ top: 0, left: 0 });
  const dlBtnRef = React.useRef(null);
  const dlMenuRef = React.useRef(null);
  React.useEffect(() => {
    function onClickOutside(e) {
      if (dlMenuRef.current && !dlMenuRef.current.contains(e.target) &&
          dlBtnRef.current && !dlBtnRef.current.contains(e.target)) {
        setShowDlMenu(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  function calcProgress() {
    const elapsed = (Date.now() - new Date(song.created_at).getTime()) / 1000;
    return Math.min(85, 5 + (elapsed / 120) * 80);
  }

  const [fakeProgress, setFakeProgress] = React.useState(calcProgress);

  React.useEffect(() => {
    if (song.status !== "Pending" && song.status !== "Generating") return;
    const id = setInterval(() => setFakeProgress(calcProgress()), 900);
    return () => clearInterval(id);
  }, [song.status]);

  React.useEffect(() => {
    if (document.getElementById("cithara-eq-style")) return;
    const s = document.createElement("style");
    s.id = "cithara-eq-style";
    s.textContent = [
      "@keyframes ceq1{0%,100%{height:3px}50%{height:12px}}",
      "@keyframes ceq2{0%,100%{height:10px}50%{height:3px}}",
      "@keyframes ceq3{0%,100%{height:6px}50%{height:14px}}",
    ].join("");
    document.head.appendChild(s);
  }, []);

  const thumbGradients = {
    Completed: "linear-gradient(135deg,#1DB954 0%,#0d7a3a 100%)",
    Generating: "linear-gradient(135deg,#ffa42b 0%,#b56a00 100%)",
    Pending: "linear-gradient(135deg,#535353 0%,#282828 100%)",
    Failed: "linear-gradient(135deg,#f15e6c 0%,#7a1a23 100%)",
  };
  const thumbGrad = thumbGradients[song.status] || thumbGradients.Pending;

  const hoverTints = {
    Completed: "rgba(29,185,84,0.07)",
    Generating: "rgba(255,164,43,0.07)",
    Pending: "rgba(255,255,255,0.03)",
    Failed: "rgba(241,94,108,0.07)",
  };
  const hoverTint = hoverTints[song.status] || hoverTints.Pending;

  const cardBg = hovered
    ? `linear-gradient(100deg, ${hoverTint} 0%, var(--surface-2) 55%)`
    : "var(--surface-2)";

  const actionBtn = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text-muted)",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.12s, color 0.12s",
    textDecoration: "none",
  };

  async function handleDownload(e, ext) {
    e.stopPropagation();
    try {
      const res = await fetch(song.audio_file);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (song.title || "song").replace(/[^\w\s-]/g, "") + "." + ext;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDlState("error");
      setTimeout(() => setDlState(null), 3000);
    }
  }

  function handleCopyLink(e) {
    e.stopPropagation();
    if (!song.shareable_link) {
      setCopyState("error");
      setTimeout(() => setCopyState(null), 3000);
      return;
    }
    navigator.clipboard
      .writeText(song.shareable_link)
      .then(() => {
        setCopyState("copied");
        setTimeout(() => setCopyState(null), 2000);
      })
      .catch(() => {
        setCopyState("error");
        setTimeout(() => setCopyState(null), 3000);
      });
  }

  function handleDeleteClick(e) {
    e.stopPropagation();
    onDelete && onDelete();
  }

  function handleRegenerate(e) {
    e.stopPropagation();
    const params = new URLSearchParams({
      title: song.title || "",
      genre: song.genre || "",
      mood: song.mood || "",
      ocasion: song.ocasion || "",
      singer_voice: song.singer_voice || "",
      prompt: song.prompt || "",
      prompt_mode: song.prompt_mode || "lyric",
    });
    window.location.href = `/new/?${params.toString()}`;
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "32px 52px 1fr auto",
        alignItems: "center",
        gap: "14px",
        padding: "10px 14px",
        borderRadius: "10px",
        background: cardBg,
        border:
          "1px solid " +
          (isPlaying
            ? "rgba(29,185,84,0.55)"
            : hovered
              ? "rgba(255,255,255,0.09)"
              : "rgba(255,255,255,0.05)"),
        boxShadow: isPlaying
          ? "0 0 0 1px rgba(29,185,84,0.1), 0 4px 24px rgba(29,185,84,0.28)"
          : hovered
            ? "0 4px 20px rgba(0,0,0,0.45)"
            : "0 1px 4px rgba(0,0,0,0.25)",
        cursor: "pointer",
        transition:
          "background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.15s",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Index — click to play/pause without navigating to detail */}
      <div
        style={{ display: "flex", justifyContent: "center" }}
        onClick={(e) => {
          if (song.audio_file && onPlay) {
            e.stopPropagation();
            onPlay();
          }
        }}
      >
        <span
          style={{
            color:
              hovered && song.audio_file
                ? "var(--text)"
                : isActive
                  ? "var(--accent)"
                  : "var(--text-muted)",
            fontSize: hovered && song.audio_file ? "14px" : "13px",
            fontWeight: 500,
            transition: "color 0.12s, font-size 0.12s",
          }}
        >
          {hovered && song.audio_file
            ? isActive && isPlaying
              ? "⏸"
              : "▶"
            : isActive
              ? "♪"
              : index !== undefined
                ? index + 1
                : ""}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "6px",
          background: thumbGrad,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: "rgba(255,255,255,0.8)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {song.cover_image_url
          ? <img src={song.cover_image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : "♪"
        }
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: isActive ? "var(--accent)" : "var(--text)",
            fontSize: "15px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "3px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          {isActive && isPlaying && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "flex-end",
                gap: "2px",
                flexShrink: 0,
                height: "14px",
              }}
            >
              <span
                style={{
                  width: "3px",
                  background: "var(--accent)",
                  borderRadius: "1px",
                  animation: "ceq1 0.7s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  width: "3px",
                  background: "var(--accent)",
                  borderRadius: "1px",
                  animation: "ceq2 0.55s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  width: "3px",
                  background: "var(--accent)",
                  borderRadius: "1px",
                  animation: "ceq3 0.85s ease-in-out infinite",
                }}
              />
            </span>
          )}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {song.title}
          </span>
        </div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "13px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.genre} · {song.mood} · {song.ocasion}
        </div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            marginTop: "3px",
            opacity: 0.6,
          }}
        >
          {formatRelativeTime(song.created_at)}
        </div>
      </div>

      {/* Status + action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Actions */}
        <div
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play / Pause */}
          {song.audio_file && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay && onPlay();
              }}
              title={isPlaying ? "Pause" : "Play"}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(29,185,84,0.2)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              style={{
                ...actionBtn,
                color: isPlaying ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          )}

          {/* Download */}
          {song.audio_file && (
            <React.Fragment>
              <button
                ref={dlBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dlState === "error") return;
                  const rect = dlBtnRef.current.getBoundingClientRect();
                  setDlMenuPos({ top: rect.bottom + 6, left: rect.right - 110 });
                  setShowDlMenu(v => !v);
                }}
                title={dlState === "error" ? "Download failed" : "Download"}
                onMouseEnter={(e) => {
                  if (dlState !== "error") { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "var(--text)"; }
                }}
                onMouseLeave={(e) => {
                  if (dlState !== "error") { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "var(--text-muted)"; }
                }}
                style={{
                  ...actionBtn,
                  background: dlState === "error" ? "rgba(241,94,108,0.2)" : "rgba(255,255,255,0.07)",
                  color: dlState === "error" ? "var(--error)" : "var(--text-muted)",
                  borderColor: dlState === "error" ? "var(--error)" : "rgba(255,255,255,0.1)",
                }}
              >
                {dlState === "error" ? "✕" : "↓"}
              </button>
              {showDlMenu && ReactDOM.createPortal(
                <div
                  ref={dlMenuRef}
                  style={{
                    position: 'fixed', top: dlMenuPos.top, left: dlMenuPos.left,
                    background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', overflow: 'hidden', zIndex: 9999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '110px',
                  }}
                >
                  {['m4a', 'mp3'].map(ext => (
                    <button
                      key={ext}
                      onClick={(e) => { e.stopPropagation(); setShowDlMenu(false); handleDownload(e, ext); }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'transparent', border: 'none',
                        color: 'var(--text)', fontSize: '12px', fontWeight: 600,
                        padding: '9px 14px', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      ↓ {ext.toUpperCase()}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </React.Fragment>
          )}

          {/* Copy link */}
          {song.shareable_link && (
            <button
              onClick={handleCopyLink}
              title={
                copyState === "copied"
                  ? "Copied!"
                  : copyState === "error"
                    ? "Copy failed"
                    : "Copy link"
              }
              onMouseEnter={(e) => {
                if (!copyState) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!copyState) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
              style={{
                ...actionBtn,
                background:
                  copyState === "copied"
                    ? "rgba(29,185,84,0.2)"
                    : copyState === "error"
                      ? "rgba(241,94,108,0.2)"
                      : "rgba(255,255,255,0.07)",
                color:
                  copyState === "copied"
                    ? "var(--accent)"
                    : copyState === "error"
                      ? "var(--error)"
                      : "var(--text-muted)",
                borderColor:
                  copyState === "error"
                    ? "var(--error)"
                    : "rgba(255,255,255,0.1)",
              }}
            >
              {copyState === "copied" ? "✓" : copyState === "error" ? "✕" : "⎘"}
            </button>
          )}

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            title="Regenerate with same prompt"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,164,43,0.2)";
              e.currentTarget.style.color = "var(--warn)";
              e.currentTarget.style.borderColor = "var(--warn)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
            style={actionBtn}
          >
            ↻
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            title="Delete"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(241,94,108,0.2)";
              e.currentTarget.style.color = "var(--error)";
              e.currentTarget.style.borderColor = "var(--error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
            style={actionBtn}
          >
            🗑
          </button>
        </div>

        <span
          title={
            song.status === "Failed" && song.failure_reason
              ? song.failure_reason
              : undefined
          }
        >
          <StatusBadge status={song.status} />
        </span>
      </div>

      {/* Fake progress bar — visible only while generating */}
      {(song.status === "Pending" || song.status === "Generating") && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: fakeProgress + "%",
              background: "var(--warn)",
              transition: "width 0.85s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* Export to window so page scripts can access them. */
window.Header = Header;
window.StatusBadge = StatusBadge;
window.SongRow = SongRow;
window.SPEEDS = SPEEDS;
