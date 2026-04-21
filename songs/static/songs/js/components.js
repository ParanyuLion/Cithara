/* Shared React components — exported to window.* for cross-script access. */

(function () {
  if (document.getElementById("cithara-styles")) return;
  const s = document.createElement("style");
  s.id = "cithara-styles";
  s.textContent = [
    "@keyframes ceq1{0%,100%{height:3px}50%{height:12px}}",
    "@keyframes ceq2{0%,100%{height:10px}50%{height:3px}}",
    "@keyframes ceq3{0%,100%{height:6px}50%{height:14px}}",
    "@keyframes cithara-spin{to{transform:rotate(360deg)}}",
    "@keyframes rowIn{from{opacity:0}to{opacity:1}}",
    "@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}",
    "@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}",
  ].join("");
  document.head.appendChild(s);
})();

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
  const SIDEBAR_MIN = 240;
  const SIDEBAR_MAX = 460;
  const SIDEBAR_STORAGE_KEY = "cithara.sidebar.width";

  const displayName =
    (currentUser || "Guest")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || "Guest";
  const avatarText = displayName.charAt(0).toUpperCase() || "G";
  const [sidebarWidth, setSidebarWidth] = React.useState(() => {
    const saved = parseInt(localStorage.getItem(SIDEBAR_STORAGE_KEY) || "", 10);
    if (Number.isFinite(saved)) {
      return Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, saved));
    }
    const cssWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--sidebar-width",
      ),
      10,
    );
    if (Number.isFinite(cssWidth)) {
      return Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, cssWidth));
    }
    return 330;
  });
  const [isResizing, setIsResizing] = React.useState(false);
  const [isResizeHover, setIsResizeHover] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`,
    );
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  React.useEffect(() => {
    if (!isResizing) return undefined;

    function handleMouseMove(e) {
      const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, e.clientX));
      setSidebarWidth(next);
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
        width: "var(--sidebar-width)",
        background: "#060606",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        overflow: "hidden",
        padding: "8px",
        gap: "8px",
        userSelect: isResizing ? "none" : "auto",
      }}
    >
      <div
        style={{
          background: "#0f0f10",
          borderRadius: "10px",
          padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src="/static/songs/images/cithara-logo.png"
            alt="Cithara logo"
            style={{
              width: "30px",
              height: "30px",
              objectFit: "contain",
              display: "block",
            }}
          />
          <span
            style={{
              color: "var(--text)",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.3px",
              fontFamily: "var(--font-display)",
            }}
          >
            Cithara
          </span>
        </a>
      </div>

      <div
        style={{
          background: "#0f0f10",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.05)",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <nav style={{ padding: "10px 10px 8px", flex: 1 }}>
          {navItems.map((item) => {
            const active = item.activeOn(path);
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontWeight: active ? 700 : 500,
                  textDecoration: "none",
                  fontSize: "14px",
                  background: active ? "rgba(29,185,84,0.12)" : "transparent",
                  marginBottom: "4px",
                  transition: "background 0.12s, color 0.12s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
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

        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
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
              }}
            >
              {avatarText}
            </div>
            <div style={{ minWidth: 0 }}>
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
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
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

      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "4px",
          width: "1px",
          height: "calc(100% - 24px)",
          background: "rgba(255,255,255,0.92)",
          opacity: isResizing || isResizeHover ? 1 : 0,
          transition: "opacity .15s ease-out",
          transitionBehavior: "normal",
          transitionDuration: "0.15s",
          transitionTimingFunction: "ease-out",
          transitionDelay: "0s",
          transitionProperty: "opacity",
          pointerEvents: "none",
          zIndex: 19,
          borderRadius: "999px",
        }}
      />

      <div
        onMouseEnter={() => setIsResizeHover(true)}
        onMouseLeave={() => setIsResizeHover(false)}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizeHover(true);
          setIsResizing(true);
        }}
        title="Drag to resize"
        style={{
          position: "absolute",
          top: "12px",
          right: 0,
          width: "10px",
          height: "calc(100% - 24px)",
          cursor: isResizing ? "grabbing" : "grab",
          zIndex: 20,
          background: "transparent",
        }}
      />
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
      if (
        dlMenuRef.current &&
        !dlMenuRef.current.contains(e.target) &&
        dlBtnRef.current &&
        !dlBtnRef.current.contains(e.target)
      ) {
        setShowDlMenu(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
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
        animation: index !== undefined ? `rowIn 0.35s ease ${Math.min(index * 0.055, 0.44).toFixed(3)}s both` : undefined,
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
        {song.cover_image_url ? (
          <img
            src={song.cover_image_url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          "♪"
        )}
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
                  setDlMenuPos({
                    top: rect.bottom + 6,
                    left: rect.right - 110,
                  });
                  setShowDlMenu((v) => !v);
                }}
                title={dlState === "error" ? "Download failed" : "Download"}
                onMouseEnter={(e) => {
                  if (dlState !== "error") {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (dlState !== "error") {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
                style={{
                  ...actionBtn,
                  background:
                    dlState === "error"
                      ? "rgba(241,94,108,0.2)"
                      : "rgba(255,255,255,0.07)",
                  color:
                    dlState === "error" ? "var(--error)" : "var(--text-muted)",
                  borderColor:
                    dlState === "error"
                      ? "var(--error)"
                      : "rgba(255,255,255,0.1)",
                }}
              >
                {dlState === "error" ? "✕" : "↓"}
              </button>
              {showDlMenu &&
                ReactDOM.createPortal(
                  <div
                    ref={dlMenuRef}
                    style={{
                      position: "fixed",
                      top: dlMenuPos.top,
                      left: dlMenuPos.left,
                      background: "var(--surface-2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      zIndex: 9999,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      minWidth: "110px",
                    }}
                  >
                    {["m4a", "mp3"].map((ext) => (
                      <button
                        key={ext}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDlMenu(false);
                          handleDownload(e, ext);
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          color: "var(--text)",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "9px 14px",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        ↓ {ext.toUpperCase()}
                      </button>
                    ))}
                  </div>,
                  document.body,
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
              {copyState === "copied" ? "✓" : copyState === "error" ? "✕" : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              )}
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

function SkeletonRow() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 52px 1fr auto",
        alignItems: "center",
        gap: "14px",
        padding: "10px 14px",
        borderRadius: "10px",
        background: "var(--surface-2)",
        border: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)",
          animation: "shimmer 1.7s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "13px",
          height: "13px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.07)",
          margin: "0 auto",
        }}
      />
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.07)",
        }}
      />
      <div>
        <div
          style={{
            height: "14px",
            width: "44%",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.09)",
            marginBottom: "8px",
          }}
        />
        <div
          style={{
            height: "11px",
            width: "31%",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>
      <div
        style={{
          height: "22px",
          width: "70px",
          borderRadius: "50px",
          background: "rgba(255,255,255,0.07)",
        }}
      />
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)",
          animation: "shimmer 1.7s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          width: "56px",
          height: "13px",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.07)",
          marginBottom: "32px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
          gap: "16px",
        }}
      >
        <div
          style={{
            height: "36px",
            width: "52%",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            height: "22px",
            width: "72px",
            borderRadius: "50px",
            background: "rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        />
      </div>
      <div
        style={{
          height: "14px",
          width: "30%",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.07)",
          marginBottom: "6px",
        }}
      />
      <div
        style={{
          height: "12px",
          width: "20%",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.05)",
          marginBottom: "40px",
        }}
      />
      <div
        style={{
          background: "var(--surface-2)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div>
            <div
              style={{
                height: "18px",
                width: "40%",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.1)",
                marginBottom: "6px",
              }}
            />
            <div
              style={{
                height: "13px",
                width: "25%",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.07)",
              }}
            />
          </div>
          <div
            style={{
              height: "64px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.07)",
            }}
          />
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              }}
            />
            <div
              style={{
                height: "22px",
                width: "64px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.07)",
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 32px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: "1 1 110px" }}>
            <div
              style={{
                height: "10px",
                width: "50%",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.07)",
                marginBottom: "6px",
              }}
            />
            <div
              style={{
                height: "15px",
                width: "70%",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.09)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Export to window so page scripts can access them. */
window.Header = Header;
window.StatusBadge = StatusBadge;
window.SongRow = SongRow;
window.SkeletonRow = SkeletonRow;
window.SkeletonDetail = SkeletonDetail;
window.SPEEDS = SPEEDS;
