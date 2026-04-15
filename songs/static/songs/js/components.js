/* Shared React components — exported to window.* for cross-script access. */

function Header() {
  const currentUser = window.CURRENT_USER;
  const path = window.location.pathname;

  function handleSignOut() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/accounts/logout/';
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = 'csrfmiddlewaretoken';
    csrf.value = window.CSRF_TOKEN;
    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
  }

  const navItems = [
    { label: 'My Library', href: '/',     icon: '◉' },
    { label: 'New Song',   href: '/new/', icon: '+' },
  ];

  return (
    <aside style={{
      width: '220px',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px', lineHeight: 1 }}>♪</span>
          <span style={{ color: 'var(--text)', fontSize: '19px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Cithara
          </span>
        </a>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 8px', flex: 1 }}>
        {navItems.map(item => {
          const active = path === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 14px',
                borderRadius: '6px',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                fontSize: '14px',
                background: active ? 'var(--surface-2)' : 'transparent',
                marginBottom: '2px',
              }}
            >
              <span style={{ fontSize: '15px', color: active ? 'var(--accent)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--surface-2)' }}>
        <div style={{
          color: 'var(--text-muted)',
          fontSize: '12px',
          marginBottom: '10px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {currentUser}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--surface-3)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
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
    Completed:  { bg: 'rgba(29,185,84,0.15)',   color: 'var(--accent)', dot: '●' },
    Generating: { bg: 'rgba(255,164,43,0.15)',  color: 'var(--warn)',   dot: '◌' },
    Pending:    { bg: 'rgba(255,164,43,0.15)',  color: 'var(--warn)',   dot: '○' },
    Failed:     { bg: 'rgba(241,94,108,0.15)',  color: 'var(--error)',  dot: '✕' },
  };
  const s = styles[status] || { bg: 'var(--surface-2)', color: 'var(--text-muted)', dot: '·' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: s.bg,
      color: s.color,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: '50px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '8px' }}>{s.dot}</span>
      {status}
    </span>
  );
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function SongRow({ song, onClick, index, onPlay, isPlaying, isActive }) {
  const [hovered, setHovered] = React.useState(false);

  const thumbGradients = {
    Completed:  'linear-gradient(135deg,#1DB954 0%,#0d7a3a 100%)',
    Generating: 'linear-gradient(135deg,#ffa42b 0%,#b56a00 100%)',
    Pending:    'linear-gradient(135deg,#535353 0%,#282828 100%)',
    Failed:     'linear-gradient(135deg,#f15e6c 0%,#7a1a23 100%)',
  };
  const thumbGrad = thumbGradients[song.status] || thumbGradients.Pending;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 52px 1fr auto',
        alignItems: 'center',
        gap: '14px',
        padding: '8px 12px',
        borderRadius: '6px',
        background: hovered ? 'var(--surface-2)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
        userSelect: 'none',
      }}
    >
      {/* Index / play */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {(hovered || isActive) && song.audio_file ? (
          <button
            onClick={e => { e.stopPropagation(); onPlay && onPlay(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isPlaying ? 'var(--accent)' : 'var(--text)',
              fontSize: '14px', padding: 0, lineHeight: 1,
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        ) : (
          <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            {isActive ? '♪' : (index !== undefined ? index + 1 : '')}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '6px',
        background: thumbGrad, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', color: 'rgba(255,255,255,0.8)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}>
        ♪
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          color: isActive ? 'var(--accent)' : 'var(--text)',
          fontSize: '15px', fontWeight: 600,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '3px',
        }}>
          {song.title}
        </div>
        <div style={{
          color: 'var(--text-muted)', fontSize: '13px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {song.genre} · {song.mood} · {song.ocasion}
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={song.status} />
    </div>
  );
}

/* Export to window so page scripts can access them. */
window.Header      = Header;
window.StatusBadge = StatusBadge;
window.SongRow     = SongRow;
window.SPEEDS      = SPEEDS;
