import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, lbl } from "../../theme/styles";
import HoverCard from "../../ui/HoverCard";
import ErrMsg from "../../ui/ErrMsg";
import { SkelLine, SkelRect } from "../../ui/Skeleton";

function RedditSkeleton() {
  return (
    <>
      {/* Profile card */}
      <div style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <SkelLine width={120} height={13} mb={8} />
          <SkelLine width={60} height={10} mb={0} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[0,1,2].map(i => <SkelRect key={i} width={50} height={36} mb={0} />)}
        </div>
      </div>
      {/* Post skeletons */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20, marginBottom: 8 }}>
          <SkelLine width="25%" height={9} mb={8} />
          <SkelLine width="90%" height={13} mb={6} />
          <SkelLine width="70%" height={13} mb={12} />
          <div style={{ display: "flex", gap: 16 }}>
            <SkelLine width={40} height={10} mb={0} />
            <SkelLine width={40} height={10} mb={0} />
          </div>
        </div>
      ))}
    </>
  );
}

export default function RedditPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);
  const [sort, setSort] = useState("new");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    apiFetch(`/feed/reddit?sort=${sort}`, {}, token)
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, [token, sort]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <RedditSkeleton />;

  const { about, posts } = data;
  return (
    <>
      <HoverCard glowColor={PC.Reddit} style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
      </HoverCard>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 16 }}>
        <div style={{ ...lbl, marginBottom: 0 }}>Posts</div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, padding: "2px 6px", outline: "none" }}>
            <option value="new">New</option>
            <option value="hot">Hot</option>
            <option value="top">Top</option>
          </select>
          <button onClick={fetchData} disabled={refreshing} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px" }}>
            {refreshing ? "..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {posts.map(p => (
        <HoverCard key={p.id} glowColor={PC.Reddit} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, marginBottom: 6 }}>
            <a href={`https://reddit.com/${p.subreddit}`} target="_blank" rel="noreferrer" style={{ color: PC.Reddit, textDecoration: "none" }}>{p.subreddit}</a>
          </div>
          <a href={p.permalink} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.text, textDecoration: "none", lineHeight: 1.6, display: "block", marginBottom: 10 }}>{p.title}</a>
          <div style={{ display: "flex", gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <span style={{ fontSize: 11, color: C.muted }}>↑ {p.score}</span>
            <span style={{ fontSize: 11, color: C.muted }}>◎ {p.num_comments}</span>
          </div>
        </HoverCard>
      ))}
    </>
  );
}
