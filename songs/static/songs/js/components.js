/* Shared React components — exported to window.* for cross-script access.
   Use function declarations (not const/let) so component names are uppercase
   and valid as JSX tags within this file. Assign to window.* at the bottom
   so separate type="text/babel" page scripts can import them. */

function Header({ rightSlot }) {
  const currentUser = window.CURRENT_USER;

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

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent)',
          fontSize: '13px',
          letterSpacing: '4px',
          fontWeight: 700,
        }}>◆ CITHARA</span>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {rightSlot && <div>{rightSlot}</div>}
        <span style={{
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '1px',
        }}>{currentUser}</span>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '4px 10px',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          SIGN OUT
        </button>
      </div>
    </header>
  );
}

function StatusBadge({ status }) {
  const colorMap = {
    Completed:  'var(--accent)',
    Generating: 'var(--warn)',
    Pending:    'var(--warn)',
    Failed:     'var(--error)',
  };
  const color = colorMap[status] || 'var(--text-muted)';
  const prefix = status === 'Completed' ? '● ' : status === 'Generating' ? '◌ ' : '';

  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      letterSpacing: '1px',
      color,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {prefix}{status}
    </span>
  );
}

function SongRow({ song, onClick }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);

  const borderColor = {
    Completed:  'var(--accent)',
    Generating: 'var(--warn)',
    Pending:    'var(--warn)',
    Failed:     'var(--error)',
  }[song.status] || 'var(--border)';

  function handlePlay(e) {
    e.stopPropagation();
    if (!song.audio_file || !audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `2px solid ${borderColor}`,
        padding: '12px 16px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
    >
      <button
        onClick={handlePlay}
        disabled={!song.audio_file}
        style={{
          width: '36px',
          height: '36px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          cursor: song.audio_file ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: song.audio_file ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: '11px',
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      {song.audio_file && (
        <audio
          ref={audioRef}
          src={song.audio_file}
          onEnded={() => setPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: 'var(--text)',
          fontSize: '14px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {song.title}
        </div>
        <div style={{
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          marginTop: '3px',
          letterSpacing: '0.5px',
        }}>
          {song.genre} · {song.mood} · {song.ocasion}
        </div>
      </div>

      <StatusBadge status={song.status} />
    </div>
  );
}

/* Export to window so page scripts (separate type="text/babel" tags) can access them.
   const/let are script-scoped across Babel tags; window.* is the shared channel. */
window.Header      = Header;
window.StatusBadge = StatusBadge;
window.SongRow     = SongRow;
