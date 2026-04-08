import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, card, lbl } from "../../theme/styles";
import Loader from "../../ui/Loader";
import ErrMsg from "../../ui/ErrMsg";

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

  useEffect(() => {
    fetchData();
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
