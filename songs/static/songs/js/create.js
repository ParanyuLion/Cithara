/* Create song page — form that POSTs to /songs/create/ */
const PageHeader = window.Header;

const GENRES = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Country'];

const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  borderRadius: '2px',
};

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '2px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
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
  function blurRestore(e) { e.target.style.borderColor = 'var(--border)'; }

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

  const backLink = (
    <a href="/" style={{
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '1px',
      textDecoration: 'none',
    }}>
      ← BACK
    </a>
  );

  return (
    <div>
      <PageHeader rightSlot={backLink} />
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          letterSpacing: '4px',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          NEW SONG
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <Field label="Title *">
            <input
              name="title" value={form.title} onChange={handleChange} required
              style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
            />
          </Field>

          <Field label="Genre *">
            <select
              name="genre" value={form.genre} onChange={handleChange} required
              style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focusGreen} onBlur={blurRestore}
            >
              <option value="">Select genre</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <Field label="Mood *">
            <input
              name="mood" value={form.mood} onChange={handleChange} required
              style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
              placeholder="e.g. happy, melancholic, energetic"
            />
          </Field>

          <Field label="Occasion *">
            <input
              name="ocasion" value={form.ocasion} onChange={handleChange} required
              style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
              placeholder="e.g. birthday, wedding, road trip"
            />
          </Field>

          <Field label="Singer Voice *">
            <input
              name="singer_voice" value={form.singer_voice} onChange={handleChange} required
              style={inputStyle} onFocus={focusGreen} onBlur={blurRestore}
              placeholder="e.g. female, male, deep baritone"
            />
          </Field>

          <Field label="Prompt (optional)">
            <textarea
              name="prompt" value={form.prompt} onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              onFocus={focusGreen} onBlur={blurRestore}
              placeholder="Additional instructions for the AI…"
            />
          </Field>

          {error && (
            <p style={{
              color: 'var(--error)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1px',
            }}>
              ERROR: {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? 'var(--text-muted)' : 'var(--accent)',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              borderRadius: '2px',
            }}
          >
            {submitting ? 'CREATING...' : 'CREATE SONG'}
          </button>

        </form>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CreateSong />);
