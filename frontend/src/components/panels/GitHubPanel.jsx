import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, LANG_COLOR, lbl } from "../../theme/styles";
import HoverCard from "../../ui/HoverCard";
import ErrMsg from "../../ui/ErrMsg";
import { SkelLine, SkelCircle, SkelRect } from "../../ui/Skeleton";

function GitHubSkeleton() {
  return (
    <>
      {/* Profile card skeleton */}
      <div style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <SkelCircle size={44} />
        <div style={{ flex: 1 }}>
          <SkelLine width="40%" height={14} mb={8} />
          <SkelLine width="60%" height={10} mb={0} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[0,1,2].map(i => <SkelRect key={i} width={40} height={36} mb={0} />)}
        </div>
      </div>
      {/* Repo card skeletons */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <SkelLine width="35%" height={13} mb={0} />
            <SkelLine width="10%" height={13} mb={0} />
          </div>
          <SkelLine width="80%" height={10} mb={10} />
          <SkelLine width="12%" height={9} mb={0} />
        </div>
      ))}
    </>
  );
}

export default function GitHubPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);
  const [sort, setSort] = useState("updated");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    apiFetch(`/feed/github?sort=${sort}`, {}, token)
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, [token, sort]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <GitHubSkeleton />;

  const { user, repos } = data;
  return (
    <>
      <HoverCard glowColor={PC.GitHub} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
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
      </HoverCard>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 16 }}>
        <div style={{ ...lbl, marginBottom: 0 }}>Repositories</div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, padding: "2px 6px", outline: "none" }}>
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
          </select>
          <button onClick={fetchData} disabled={refreshing} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px" }}>
            {refreshing ? "..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {repos.map(r => (
        <HoverCard key={r.id} glowColor={PC.GitHub} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <a href={r.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: PC.GitHub, fontWeight: 600, textDecoration: "none" }}>{r.name}</a>
            <span style={{ fontSize: 11, color: C.muted }}>★ {r.stargazers_count}</span>
          </div>
          {r.description && <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{r.description}</div>}
          {r.language && <span style={{ fontSize: 9, color: LANG_COLOR[r.language] || C.muted }}>● {r.language}</span>}
        </HoverCard>
      ))}
    </>
  );
}
