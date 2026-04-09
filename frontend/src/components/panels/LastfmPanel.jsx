import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, card, lbl } from "../../theme/styles";
import HoverCard from "../../ui/HoverCard";
import ErrMsg from "../../ui/ErrMsg";
import { SkelLine, SkelRect } from "../../ui/Skeleton";

function LastfmSkeleton() {
  const halfCard = { background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20 };
  return (
    <>
      {/* Now playing bar */}
      <div style={{ ...halfCard, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <SkelLine width={90} height={10} mb={0} />
        <SkelLine width="40%" height={13} mb={0} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[0, 1].map(col => (
          <div key={col} style={halfCard}>
            <SkelLine width="50%" height={9} mb={14} />
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ borderBottom: i < 5 ? `1px solid #242424` : "none", padding: "9px 0" }}>
                <SkelLine width="70%" height={12} mb={5} />
                <SkelLine width="45%" height={10} mb={0} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default function LastfmPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    apiFetch("/feed/lastfm", {}, token)
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <LastfmSkeleton />;

  const { info, recent, topArtists } = data;
  const nowPlaying = recent.find(t => t.nowplaying);

  return (
    <>
      {nowPlaying && (
        <HoverCard glowColor={PC["Last.fm"]} style={{ marginBottom: 12, borderColor: PC["Last.fm"], display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: PC["Last.fm"], letterSpacing: 1 }}>▶ NOW PLAYING</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{nowPlaying.name}</span>
          <span style={{ fontSize: 11, color: C.muted }}>— {nowPlaying.artist}</span>
        </HoverCard>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <HoverCard glowColor={PC["Last.fm"]}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ ...lbl, marginBottom: 0 }}>Recent Tracks</div>
            <button onClick={fetchData} disabled={refreshing} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px" }}>
              {refreshing ? "..." : "↻ Refresh"}
            </button>
          </div>
          {recent.slice(0, 5).map((t, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? `1px solid ${C.border}` : "none", padding: "9px 0" }}>
              <div style={{ fontSize: 12 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{t.artist}</div>
            </div>
          ))}
        </HoverCard>

        <HoverCard glowColor={PC["Last.fm"]}>
          <div style={{ ...lbl }}>Top Artists (7 days)</div>
          {topArtists.map((a, i) => (
            <div key={i} style={{ borderBottom: i < topArtists.length - 1 ? `1px solid ${C.border}` : "none", padding: "9px 0", display: "flex", justifyContent: "space-between" }}>
              <a href={a.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.text, textDecoration: "none" }}>{a.name}</a>
              <span style={{ fontSize: 11, color: C.muted }}>{parseInt(a.playcount).toLocaleString()} plays</span>
            </div>
          ))}
        </HoverCard>
      </div>
    </>
  );
}
