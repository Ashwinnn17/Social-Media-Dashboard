import { useState, useEffect } from "react";
import { apiFetch } from "../api/apiFetch";
import { C, PC, card, lbl } from "../theme/styles";

export default function AnalyticsPanel({ token }) {
  const [gh, setGh] = useState(null);
  const [rd, setRd] = useState(null);
  const [lf, setLf] = useState(null);
  const [st, setSt] = useState(null);

  useEffect(() => {
    apiFetch("/feed/github", {}, token).then(setGh).catch(() => setGh("err"));
    apiFetch("/feed/reddit", {}, token).then(setRd).catch(() => setRd("err"));
    apiFetch("/feed/lastfm", {}, token).then(setLf).catch(() => setLf("err"));
    apiFetch("/feed/steam",  {}, token).then(setSt).catch(() => setSt("err"));
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
    {
      p: "Steam", color: PC.Steam,
      rows: st && st !== "err"
        ? [["Games Owned", st.totalGames.toLocaleString()], ["Status", st.profile.status], ["Top Game", st.recentGames[0]?.name || "—"], ["Hrs (2 wks)", st.recentGames[0]?.playtime_2weeks ?? "—"]]
        : null,
    },
  ];

  return (
    <>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {summaries.map(({ p, color, rows }) => (
          <div key={p} style={{ ...card, borderTop: `2px solid ${color}` }}>
            <div style={{ ...lbl, color }}>{p}</div>
            {!rows
              ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div>
              : rows.map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{l}</span><span>{v}</span>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      {/* Detail charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={card}>
          <div style={lbl}>Top Artists — Last.fm</div>
          {!lf || lf === "err"
            ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div>
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
              })
          }
        </div>

        <div style={card}>
          <div style={lbl}>Top Repos — GitHub</div>
          {!gh || gh === "err"
            ? <div style={{ fontSize: 11, color: C.muted }}>loading...</div>
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
              })
          }
        </div>
      </div>
    </>
  );
}
