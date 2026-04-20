/* Create song page — form that POSTs to /songs/create/ */
const PageHeader = window.Header;

const GENRES = ["Pop", "Rock", "Jazz", "Hip-Hop", "Country"];

const inputStyle = {
  background: "var(--surface-2)",
  border: "1px solid transparent",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
  fontSize: "14px",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
  borderRadius: "8px",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: "4px",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const PROMPT_LIMITS = { idea: 300, lyric: 1000 };

function CreateSong() {
  const [form, setForm] = React.useState({
    title: "",
    genre: "",
    mood: "",
    ocasion: "",
    singer_voice: "",
    prompt: "",
  });
  const [promptMode, setPromptMode] = React.useState("lyric"); // 'idea' | 'lyric'
  const [step, setStep] = React.useState("form"); // 'form' | 'confirm'
  const [isRegenerate, setIsRegenerate] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const promptLimit = PROMPT_LIMITS[promptMode];

  /* Pre-fill form from URL query params when arriving via Regenerate */
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fields = [
      "title",
      "genre",
      "mood",
      "ocasion",
      "singer_voice",
      "prompt",
    ];
    const prefill = {};
    fields.forEach((k) => {
      const v = params.get(k);
      if (v) prefill[k] = v;
    });
    if (params.get("prompt_mode") === "lyric") setPromptMode("lyric");
    if (Object.keys(prefill).length > 0) {
      setForm((prev) => ({ ...prev, ...prefill }));
      setIsRegenerate(true);
    }
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function focusGreen(e) {
    e.target.style.borderColor = "var(--accent)";
  }
  function blurRestore(e) {
    e.target.style.borderColor = "transparent";
  }

  /* Form submit → show confirm summary instead of calling API */
  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.prompt.length > promptLimit) {
      setError(
        `Prompt is too long — ${form.prompt.length.toLocaleString()} / ${promptLimit.toLocaleString()} characters. Please shorten it before continuing.`,
      );
      return;
    }
    if (promptMode === "lyric" && !form.prompt.trim()) {
      setError(
        "Lyrics are required in Lyric mode. Please write your lyrics or switch to Idea mode.",
      );
      return;
    }
    setStep("confirm");
  }

  /* Confirm → call the API */
  async function handleConfirm() {
    setError(null);
    setSubmitting(true);

    const body = {
      title: form.title,
      genre: form.genre,
      mood: form.mood,
      ocasion: form.ocasion,
      singer_voice: form.singer_voice,
    };
    if (form.prompt.trim()) body.prompt = form.prompt.trim();
    body.prompt_mode = promptMode;

    try {
      const res = await fetch("/songs/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (typeof data.error === "object") {
          const fieldLabels = {
            prompt: "Prompt",
            title: "Title",
            genre: "Genre",
            mood: "Mood",
            ocasion: "Occasion",
            singer_voice: "Singer Voice",
          };
          const parts = [];
          for (const [field, msgs] of Object.entries(data.error)) {
            const label = fieldLabels[field] || field;
            (Array.isArray(msgs) ? msgs : [msgs]).forEach((m) =>
              parts.push(`${label}: ${m}`),
            );
          }
          setError(parts.join(" · "));
        } else {
          setError(data.error);
        }
        setStep("form");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Network error — check the server is running");
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  }

  const summaryRows = [
    { label: "Title", value: form.title },
    { label: "Genre", value: form.genre },
    { label: "Mood", value: form.mood },
    { label: "Occasion", value: form.ocasion },
    { label: "Singer Voice", value: form.singer_voice },
    {
      label: "Mode",
      value:
        promptMode === "lyric" ? "Lyric (customMode)" : "Idea (auto-generated)",
    },
    ...(form.prompt.trim()
      ? [
          {
            label: promptMode === "lyric" ? "Lyrics" : "Prompt",
            value: form.prompt.trim(),
          },
        ]
      : []),
  ];

  const wrapPage = (content) => (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#060606",
      }}
    >
      <PageHeader />
      <main
        style={{
          flex: 1,
          padding: "20px 40px",
          overflowY: "auto",
          background: "var(--bg)",
          margin: "8px 8px 8px 0",
          borderRadius: "12px",
          height: "calc(100vh - 16px)",
        }}
      >
        <div style={{ maxWidth: "960px", width: "100%" }}>{content}</div>
      </main>
    </div>
  );

  /* ── Confirm screen ─────────────────────────────────────── */
  if (step === "confirm") {
    return wrapPage(
      <React.Fragment>
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
            marginBottom: "12px",
            transition: "color 0.15s",
          }}
        >
          ← Back
        </a>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: 900,
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          {isRegenerate ? "Confirm regeneration" : "Confirm your song"}
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {isRegenerate
            ? "A new song will be created with these settings. Your previous song stays in the library."
            : "Review the details below before starting AI generation."}
        </p>

        {/* Summary card */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {summaryRows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: row.label === "Prompt" ? "flex-start" : "center",
                gap: "16px",
                padding: "13px 20px",
                borderBottom:
                  i < summaryRows.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
              }}
            >
              <span
                style={{
                  width: "110px",
                  flexShrink: 0,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  paddingTop: row.label === "Prompt" ? "2px" : "0",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                  lineHeight: 1.55,
                  flex: 1,
                  whiteSpace: row.label === "Prompt" ? "pre-wrap" : "normal",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p
            style={{
              color: "var(--error)",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setStep("form")}
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting)
                e.currentTarget.style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              background: "transparent",
              border: "1px solid var(--surface-3)",
              color: "var(--text-muted)",
              padding: "11px 24px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              borderRadius: "50px",
              opacity: submitting ? 0.5 : 1,
              transition: "background 0.15s",
            }}
          >
            ← Edit
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = submitting
                ? "var(--surface-3)"
                : "var(--accent)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            style={{
              background: submitting ? "var(--surface-3)" : "var(--accent)",
              color: submitting ? "var(--text-muted)" : "#060606",
              border: "none",
              padding: "11px 32px",
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              borderRadius: "50px",
              boxShadow: submitting
                ? "none"
                : "0 4px 16px rgba(29,185,84,0.35)",
              transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
            }}
          >
            {submitting ? "Generating…" : "✓ Generate Song"}
          </button>
        </div>
      </React.Fragment>,
    );
  }

  /* ── Form screen ────────────────────────────────────────── */
  return wrapPage(
    <React.Fragment>
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
          marginBottom: "12px",
          transition: "color 0.15s",
        }}
      >
        ← Back
      </a>

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 900,
          letterSpacing: "-0.5px",
          marginBottom: "4px",
        }}
      >
        {isRegenerate ? "Regenerate Song" : "New Song"}
      </h1>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "13px",
          marginBottom: "20px",
        }}
      >
        {isRegenerate
          ? "Edit the details below — a new song will be created, the old one stays."
          : "Fill in the details and let AI compose your song."}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <Field label="Title *">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={focusGreen}
            onBlur={blurRestore}
            placeholder="My Song"
          />
        </Field>

        {/* Genre + Mood */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Field label="Genre *">
              <select
                name="genre"
                value={form.genre}
                onChange={handleChange}
                required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={focusGreen}
                onBlur={blurRestore}
              >
                <option value="">Select genre</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Field label="Mood *">
              <input
                name="mood"
                value={form.mood}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={focusGreen}
                onBlur={blurRestore}
                placeholder="e.g. happy, melancholic, energetic"
              />
            </Field>
          </div>
        </div>

        {/* Occasion + Singer Voice */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Field label="Occasion *">
              <input
                name="ocasion"
                value={form.ocasion}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={focusGreen}
                onBlur={blurRestore}
                placeholder="e.g. birthday, wedding, road trip"
              />
            </Field>
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Field label="Singer Voice *">
              <input
                name="singer_voice"
                value={form.singer_voice}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={focusGreen}
                onBlur={blurRestore}
                placeholder="e.g. female, male, deep baritone"
              />
            </Field>
          </div>
        </div>

        {/* Prompt mode toggle */}
        <div>
          <label style={labelStyle}>Prompt Mode</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["lyric", "idea"].map((mode) => {
              const active = promptMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPromptMode(mode);
                    setError(null);
                  }}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "50px",
                    border: active ? "none" : "1px solid var(--surface-3)",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#060606" : "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {mode === "idea" ? "💡 Idea" : "🎵 Lyric"}
                </button>
              );
            })}
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "6px",
            }}
          >
            {promptMode === "idea"
              ? "Suno will generate lyrics from your idea. Limit: 300 chars."
              : "Provide your own lyrics. Suno will compose music around them. Limit: 1,000 chars."}
          </p>
        </div>

        <Field
          label={promptMode === "lyric" ? "Lyrics *" : "Prompt (optional)"}
        >
          <textarea
            name="prompt"
            value={form.prompt}
            onChange={handleChange}
            rows={promptMode === "lyric" ? 6 : 3}
            required={promptMode === "lyric"}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: "1.6",
              borderColor:
                form.prompt.length > promptLimit
                  ? "var(--error)"
                  : "transparent",
            }}
            onFocus={focusGreen}
            onBlur={blurRestore}
            placeholder={
              promptMode === "lyric"
                ? "Write your lyrics here…"
                : "Additional instructions for the AI…"
            }
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color:
                  form.prompt.length > promptLimit
                    ? "var(--error)"
                    : "var(--text-muted)",
                fontWeight: form.prompt.length > promptLimit ? 600 : 400,
              }}
            >
              {form.prompt.length.toLocaleString()} /{" "}
              {promptLimit.toLocaleString()}
            </span>
          </div>
        </Field>

        {error && (
          <p style={{ color: "var(--error)", fontSize: "13px" }}>{error}</p>
        )}

        <div>
          <button
            type="submit"
            style={{
              background: "var(--accent)",
              color: "#060606",
              border: "none",
              padding: "11px 32px",
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "50px",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isRegenerate ? "Regenerate →" : "Create Song →"}
          </button>
        </div>
      </form>
    </React.Fragment>,
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CreateSong />);
