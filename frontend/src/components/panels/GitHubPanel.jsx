import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, LANG_COLOR, card, lbl } from "../../theme/styles";
import Loader from "../../ui/Loader";
import ErrMsg from "../../ui/ErrMsg";

export default function GitHubPanel({ token }) {
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
