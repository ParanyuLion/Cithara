/* Shared React components — exported to window.* for cross-script access. */

function Header() {
  const currentUser = window.CURRENT_USER;
  const path = window.location.pathname;

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
    { label: "My Library", href: "/", icon: "◉" },
    { label: "New Song", href: "/new/", icon: "+" },
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
          const active = path === item.href;
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
                transition: "background 0.12s",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  color: active ? "var(--accent)" : "inherit",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--surface-2)" }}>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "12px",
            marginBottom: "10px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentUser}
        </div>
        <button
          onClick={handleSignOut}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid var(--surface-3)",
            color: "var(--text-muted)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          Sign Out
        </button>
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
  const [copied, setCopied] = React.useState(false);

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

  function handleCopyLink(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(song.shareable_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDeleteClick(e) {
    e.stopPropagation();
    onDelete && onDelete();
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
          (hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"),
        boxShadow: hovered
          ? "0 4px 20px rgba(0,0,0,0.45)"
          : "0 1px 4px rgba(0,0,0,0.25)",
        cursor: "pointer",
        transition:
          "background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.15s",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        userSelect: "none",
      }}
    >
      {/* Index */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          style={{
            color: isActive ? "var(--accent)" : "var(--text-muted)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {isActive ? "♪" : index !== undefined ? index + 1 : ""}
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
        }}
      >
        ♪
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
          }}
        >
          {song.title}
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
      </div>

      {/* Status + action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Actions */}
        <div
          style={{ display: "flex", gap: "4px", alignItems: "center" }}
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
            <a
              href={song.audio_file}
              download
              title="Download"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              style={actionBtn}
            >
              ↓
            </a>
          )}

          {/* Copy link */}
          {song.shareable_link && (
            <button
              onClick={handleCopyLink}
              title={copied ? "Copied!" : "Copy link"}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
              style={{
                ...actionBtn,
                background: copied
                  ? "rgba(29,185,84,0.2)"
                  : "rgba(255,255,255,0.07)",
                color: copied ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {copied ? "✓" : "⎘"}
            </button>
          )}

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

        <StatusBadge status={song.status} />
      </div>
    </div>
  );
}

/* Export to window so page scripts can access them. */
window.Header = Header;
window.StatusBadge = StatusBadge;
window.SongRow = SongRow;
window.SPEEDS = SPEEDS;
