/* Create song page — form that POSTs to /songs/create/ */
const PageHeader = window.Header;

const GENRES = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Country'];

const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid transparent',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  padding: '12px 14px',
  width: '100%',
  outline: 'none',
  borderRadius: '8px',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function CreateSong() {
  const [form, setForm] = React.useState({
    title: '', genre: '', mood: '', ocasion: '', singer_voice: '', prompt: '',
  });
  const [error, setError]           = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function focusGreen(e)  { e.target.style.borderColor = 'var(--accent)'; }
  function blurRestore(e) { e.target.style.borderColor = 'transparent'; }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = {
      title:        form.title,
      genre:        form.genre,
      mood:         form.mood,
      ocasion:      form.ocasion,
      singer_voice: form.singer_voice,
    };
    if (form.prompt.trim()) body.prompt = form.prompt.trim();

    try {
      const res = await fetch('/songs/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Network error — check the server is running');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <PageHeader />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Back link */}
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: '32px',
          }}>
            ← Back
          </a>

          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            New Song
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
            Fill in the details and let AI compose your song.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <Field label="Title *">
              <input
                name="title" value={form.title} onChange={handleChange} required
                style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
                placeholder="My Song"
              />
            </Field>

            {/* Genre + Mood — flex wrap: 2-col on wide, stacks on narrow */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Field label="Genre *">
                  <select
                    name="genre" value={form.genre} onChange={handleChange} required
                    style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focusGreen} onBlur={blurRestore}
                  >
                    <option value="">Select genre</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Field label="Mood *">
                  <input
                    name="mood" value={form.mood} onChange={handleChange} required
                    style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
                    placeholder="e.g. happy, melancholic, energetic"
                  />
                </Field>
              </div>
            </div>

            {/* Occasion + Singer Voice — flex wrap */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Field label="Occasion *">
                  <input
                    name="ocasion" value={form.ocasion} onChange={handleChange} required
                    style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
                    placeholder="e.g. birthday, wedding, road trip"
                  />
                </Field>
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Field label="Singer Voice *">
                  <input
                    name="singer_voice" value={form.singer_voice} onChange={handleChange} required
                    style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
                    placeholder="e.g. female, male, deep baritone"
                  />
                </Field>
              </div>
            </div>

            <Field label="Prompt (optional)">
              <textarea
                name="prompt" value={form.prompt} onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                onFocus={focusGreen} onBlur={blurRestore}
                placeholder="Additional instructions for the AI…"
              />
            </Field>

            {error && (
              <p style={{ color: 'var(--error)', fontSize: '13px' }}>
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? 'var(--surface-3)' : 'var(--accent)',
                  color: submitting ? 'var(--text-muted)' : '#000',
                  border: 'none',
                  padding: '14px 36px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  borderRadius: '50px',
                  transition: 'background 0.15s',
                }}
              >
                {submitting ? 'Creating…' : 'Create Song'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CreateSong />);
