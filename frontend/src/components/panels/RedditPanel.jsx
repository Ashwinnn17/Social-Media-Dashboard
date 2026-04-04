import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, card, lbl } from "../../theme/styles";
import Loader from "../../ui/Loader";
import ErrMsg from "../../ui/ErrMsg";

export default function RedditPanel({ token }) {
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
