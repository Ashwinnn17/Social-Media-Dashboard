import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = { bg: "#0f0f0f", surface: "#161616", border: "#242424", text: "#ddd", muted: "#555", err: "#f87171", ok: "#4ade80" };
const PC = { GitHub: "#e8e8e8", Reddit: "#ff4500", "Last.fm": "#d51007" };
const LANG_COLOR = { JavaScript: "#f7df1e", Python: "#3572A5", TypeScript: "#3178c6", "C++": "#f34b7d", Go: "#00add8", Rust: "#dea584" };

// ── Style helpers ─────────────────────────────────────────────────────────────
const card  = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: 20 };
const lbl   = { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 };
const pill  = c => ({ display: "inline-block", padding: "2px 7px", borderRadius: 3, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${c}`, color: c });
const dot   = c => ({ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block", marginRight: 6, flexShrink: 0 });
const navS  = a => ({ padding: "10px 24px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", color: a ? C.text : C.muted, borderLeft: a ? `2px solid ${C.text}` : "2px solid transparent" });
const tabS  = a => ({ padding: "5px 13px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", border: `1px solid ${a ? C.text : C.border}`, color: a ? C.bg : C.muted, background: a ? C.text : "transparent", borderRadius: 3, display: "flex", alignItems: "center", gap: 6 });
const input = { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const btnP  = { padding: "10px 20px", background: C.text, color: C.bg, border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", width: "100%" };
const btnS  = { ...btnP, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, width: "auto" };

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("token", data.token);
      onAuth(data.user, data.token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>
      <div style={{ width: 360 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.text, marginBottom: 32, textAlign: "center" }}>Dashboard</div>

        <div style={{ ...card, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.text, marginBottom: 24 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Name</div>
              <input style={input} placeholder="Your name" value={form.name} onChange={set("name")} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={lbl}>Email</div>
            <input style={input} placeholder="you@example.com" value={form.email} onChange={set("email")}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={lbl}>Password</div>
            <input style={input} type="password" placeholder="••••••" value={form.password} onChange={set("password")}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          {err && <div style={{ fontSize: 11, color: C.err, marginBottom: 14 }}>{err}</div>}

          <button style={btnP} onClick={submit} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Register"}
          </button>

          <div style={{ marginTop: 16, fontSize: 11, color: C.muted, textAlign: "center" }}>
            {mode === "login" ? "No account? " : "Have an account? "}
            <span style={{ color: C.text, cursor: "pointer" }}
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
              {mode === "login" ? "Register" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings Screen ───────────────────────────────────────────────────────────
function SettingsScreen({ user, token, onSave, onBack }) {
  const [form, setForm]   = useState({ github: user.accounts?.github || "", reddit: user.accounts?.reddit || "", lastfm: user.accounts?.lastfm || "" });
  const [msg, setMsg]     = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setMsg(""); setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/user/accounts", { method: "PUT", body: JSON.stringify(form) }, token);
      setMsg("Saved.");
      onSave(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>
      <div style={{ width: 400 }}>
        <div style={{ ...card, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.text }}>Connected Accounts</div>
            <button style={btnS} onClick={onBack}>Back</button>
          </div>

          {[
            { key: "github",  label: "GitHub Username",  placeholder: "e.g. torvalds",  color: PC.GitHub  },
            { key: "reddit",  label: "Reddit Username",  placeholder: "e.g. spez",       color: PC.Reddit  },
            { key: "lastfm",  label: "Last.fm Username", placeholder: "e.g. rj",         color: PC["Last.fm"] },
          ].map(({ key, label, placeholder, color }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ ...lbl, color }}>{label}</div>
              <input style={input} placeholder={placeholder} value={form[key]} onChange={set(key)} />
            </div>
          ))}

          {msg && <div style={{ fontSize: 11, color: C.ok, marginBottom: 12 }}>{msg}</div>}
          {err && <div style={{ fontSize: 11, color: C.err, marginBottom: 12 }}>{err}</div>}

          <button style={btnP} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Platform panels ───────────────────────────────────────────────────────────
function Loader() {
  return <div style={{ fontSize: 11, color: C.muted, padding: "40px 0" }}>loading...</div>;
}
function ErrMsg({ msg }) {
  return <div style={{ fontSize: 11, color: C.err, padding: "16px 0" }}>{msg}</div>;
}

function GitHubPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);

  useEffect(() => {
    apiFetch("/feed/github", {}, token).then(setData).catch(e => setErr(e.message));
  }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <Loader />;

  const { user, repos } = data;
  return (
    <>
      <div style={{ ...card, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <img src={user.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${C.border}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name || user.login}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{user.html_url}</div>
          {user.bio && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{user.bio}</div>}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Followers", user.followers], ["Repos", user.public_repos], ["Following", user.following]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {repos.map(r => (
        <div key={r.id} style={{ ...card, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <a href={r.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: PC.GitHub, fontWeight: 600, textDecoration: "none" }}>{r.name}</a>
            <span style={{ fontSize: 11, color: C.muted }}>★ {r.stargazers_count}</span>
          </div>
          {r.description && <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{r.description}</div>}
          {r.language && <span style={{ fontSize: 9, color: LANG_COLOR[r.language] || C.muted }}>● {r.language}</span>}
        </div>
      ))}
    </>
  );
}

function RedditPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);

  useEffect(() => {
    apiFetch("/feed/reddit", {}, token).then(setData).catch(e => setErr(e.message));
  }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <Loader />;

  const { about, posts } = data;
  return (
    <>
      <div style={{ ...card, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>u/{about.name}</div>
          <div style={{ fontSize: 10, color: C.muted }}>Reddit</div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Karma", about.total_karma?.toLocaleString()], ["Post", about.link_karma?.toLocaleString()], ["Comment", about.comment_karma?.toLocaleString()]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {posts.map(p => (
        <div key={p.id} style={{ ...card, marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: PC.Reddit, marginBottom: 6 }}>{p.subreddit}</div>
          <a href={p.permalink} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.text, textDecoration: "none", lineHeight: 1.6, display: "block", marginBottom: 10 }}>{p.title}</a>
          <div style={{ display: "flex", gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <span style={{ fontSize: 11, color: C.muted }}>↑ {p.score}</span>
            <span style={{ fontSize: 11, color: C.muted }}>◎ {p.num_comments}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function LastfmPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);

  useEffect(() => {
    apiFetch("/feed/lastfm", {}, token).then(setData).catch(e => setErr(e.message));
  }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <Loader />;

  const { info, recent, topArtists } = data;
  const nowPlaying = recent.find(t => t.nowplaying);

  return (
    <>
      {nowPlaying && (
        <div style={{ ...card, marginBottom: 12, borderColor: PC["Last.fm"], display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: PC["Last.fm"], letterSpacing: 1 }}>▶ NOW PLAYING</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{nowPlaying.name}</span>
          <span style={{ fontSize: 11, color: C.muted }}>— {nowPlaying.artist}</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={card}>
          <div style={lbl}>Recent Tracks</div>
          {recent.slice(0, 5).map((t, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? `1px solid ${C.border}` : "none", padding: "9px 0" }}>
              <div style={{ fontSize: 12 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{t.artist}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={lbl}>Top Artists (7 days)</div>
          {topArtists.map((a, i) => (
            <div key={i} style={{ borderBottom: i < topArtists.length - 1 ? `1px solid ${C.border}` : "none", padding: "9px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12 }}>{a.name}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{parseInt(a.playcount).toLocaleString()} plays</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AnalyticsPanel({ token }) {
  const [gh,  setGh]  = useState(null);
  const [rd,  setRd]  = useState(null);
  const [lf,  setLf]  = useState(null);

  useEffect(() => {
    apiFetch("/feed/github", {}, token).then(setGh).catch(() => setGh("err"));
    apiFetch("/feed/reddit", {}, token).then(setRd).catch(() => setRd("err"));
    apiFetch("/feed/lastfm", {}, token).then(setLf).catch(() => setLf("err"));
  }, [token]);

  const summaries = [
    {
      p: "GitHub", color: PC.GitHub,
      rows: gh && gh !== "err"
        ? [["Followers", gh.user.followers], ["Repos", gh.user.public_repos], ["Following", gh.user.following], ["Stars", gh.repos.reduce((a, r) => a + r.stargazers_count, 0)]]
        : null,
    },
    {
      p: "Reddit", color: PC.Reddit,
      rows: rd && rd !== "err"
        ? [["Total Karma", rd.about.total_karma?.toLocaleString()], ["Post Karma", rd.about.link_karma?.toLocaleString()], ["Comment Karma", rd.about.comment_karma?.toLocaleString()], ["Recent Posts", rd.posts.length]]
        : null,
    },
    {
      p: "Last.fm", color: PC["Last.fm"],
      rows: lf && lf !== "err"
        ? [["Scrobbles", parseInt(lf.info.playcount).toLocaleString()], ["Country", lf.info.country || "—"], ["Top Artist", lf.topArtists[0]?.name || "—"], ["Tracks Today", lf.recent.length]]
        : null,
    },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
        {summaries.map(({ p, color, rows }) => (
          <div key={p} style={{ ...card, borderTop: `2px solid ${color}` }}>
            <div style={{ ...lbl, color }}>{p}</div>
            {!rows ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div> : rows.map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={card}>
          <div style={lbl}>Top Artists — Last.fm</div>
          {!lf || lf === "err" ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div>
            : lf.topArtists.map((a, i) => {
              const max = parseInt(lf.topArtists[0].playcount);
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12 }}>{a.name}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{parseInt(a.playcount).toLocaleString()} plays</span>
                  </div>
                  <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
                    <div style={{ height: "100%", width: `${(parseInt(a.playcount) / max) * 100}%`, background: PC["Last.fm"], borderRadius: 1 }} />
                  </div>
                </div>
              );
            })}
        </div>

        <div style={card}>
          <div style={lbl}>Top Repos — GitHub</div>
          {!gh || gh === "err" ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div>
            : gh.repos.map((r, i) => {
              const max = gh.repos[0].stargazers_count || 1;
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>★ {r.stargazers_count}</span>
                  </div>
                  <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
                    <div style={{ height: "100%", width: `${(r.stargazers_count / max) * 100}%`, background: PC.GitHub, borderRadius: 1 }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem("token"));
  const [user,     setUser]     = useState(null);
  const [screen,   setScreen]   = useState("feed"); // feed | analytics | settings
  const [platform, setPlatform] = useState("GitHub");
  const [authReady, setAuthReady] = useState(false);

  // On mount, verify stored token
  useEffect(() => {
    if (!token) { setAuthReady(true); return; }
    apiFetch("/user/me", {}, token)
      .then(u => { setUser(u); setAuthReady(true); })
      .catch(() => { localStorage.removeItem("token"); setToken(null); setAuthReady(true); });
  }, []);

  const onAuth = (u, t) => { setUser(u); setToken(t); };
  const logout = () => { localStorage.removeItem("token"); setToken(null); setUser(null); };
  const onSaveAccounts = (u) => { setUser(u); setScreen("feed"); };

  if (!authReady) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: C.muted, fontSize: 11 }}>
      loading...
    </div>
  );

  if (!token || !user) return <AuthScreen onAuth={onAuth} />;
  if (screen === "settings") return <SettingsScreen user={user} token={token} onSave={onSaveAccounts} onBack={() => setScreen("feed")} />;

  const hasAccounts = user.accounts?.github || user.accounts?.reddit || user.accounts?.lastfm;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>

      {/* Sidebar */}
      <div style={{ width: 200, borderRight: `1px solid ${C.border}`, padding: "28px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, padding: "0 24px 22px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>Dashboard</div>

        {/* User block */}
        <div style={{ padding: "0 24px 18px", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{user.email}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {Object.entries(user.accounts || {}).filter(([, v]) => v).map(([k]) => {
              const label = k === "lastfm" ? "Last.fm" : k.charAt(0).toUpperCase() + k.slice(1);
              return <span key={k} style={dot(PC[label])} />;
            })}
            <span style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>
              {Object.values(user.accounts || {}).filter(Boolean).length} connected
            </span>
          </div>
        </div>

        {[["feed", "Feed"], ["analytics", "Analytics"]].map(([id, l]) => (
          <div key={id} style={navS(screen === id)} onClick={() => setScreen(id)}>{l}</div>
        ))}

        <div style={{ marginTop: "auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: 1 }} onClick={() => setScreen("settings")}>⚙ Settings</div>
          <div style={{ fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: 1 }} onClick={logout}>→ Sign out</div>
          <div style={{ fontSize: 9, color: C.border, letterSpacing: 1, marginTop: 4 }}>ICT 3230 · Group 13</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 200, flex: 1, padding: "36px 44px" }}>

        {/* No accounts set warning */}
        {!hasAccounts && (
          <div style={{ ...card, marginBottom: 20, borderColor: C.muted, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>No accounts connected yet.</span>
            <button style={{ ...btnS, fontSize: 11 }} onClick={() => setScreen("settings")}>Connect accounts →</button>
          </div>
        )}

        {/* FEED */}
        {screen === "feed" && <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Feed</div>
            <div style={{ fontSize: 11, color: C.muted }}>Live data from your connected accounts</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {["GitHub", "Reddit", "Last.fm"].map(p => (
              <button key={p} style={tabS(platform === p)} onClick={() => setPlatform(p)}>
                <span style={dot(PC[p])} />{p}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: 660 }}>
            {platform === "GitHub"  && <GitHubPanel  token={token} />}
            {platform === "Reddit"  && <RedditPanel  token={token} />}
            {platform === "Last.fm" && <LastfmPanel  token={token} />}
          </div>
        </>}

        {/* ANALYTICS */}
        {screen === "analytics" && <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Analytics</div>
            <div style={{ fontSize: 11, color: C.muted }}>Combined overview across all platforms</div>
          </div>
          <AnalyticsPanel token={token} />
        </>}
      </div>
    </div>
  );
}