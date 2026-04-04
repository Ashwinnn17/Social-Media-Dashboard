import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, card, lbl } from "../../theme/styles";
import Loader from "../../ui/Loader";
import ErrMsg from "../../ui/ErrMsg";

export default function SteamPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);

  useEffect(() => {
    apiFetch("/feed/steam", {}, token).then(setData).catch(e => setErr(e.message));
  }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <Loader />;

  const { profile, recentGames, totalGames } = data;
  const statusColor = profile.status === "Online" ? C.ok : C.muted;

  return (
    <>
      {/* Profile card */}
      <div style={{ ...card, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
        <img src={profile.avatar} alt="" style={{ width: 56, height: 56, borderRadius: 4, border: `1px solid ${C.border}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{profile.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: statusColor }}>{profile.status}</span>
            {profile.gameExtraInfo && (
              <span style={{ fontSize: 11, color: PC.Steam }}>▶ {profile.gameExtraInfo}</span>
            )}
          </div>
          <a href={profile.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: C.muted, textDecoration: "none" }}>{profile.profileUrl}</a>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{totalGames.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>GAMES</div>
        </div>
      </div>

      {/* Recently played */}
      <div style={card}>
        <div style={lbl}>Recently Played — Last 2 Weeks</div>
        {recentGames.length === 0 ? (
          <div style={{ fontSize: 11, color: C.muted }}>No recent activity</div>
        ) : recentGames.map((g, i) => (
          <div key={g.appid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < recentGames.length - 1 ? `1px solid ${C.border}` : "none" }}>
            {g.img_icon_url && (
              <img src={g.img_icon_url} alt="" style={{ width: 32, height: 32, borderRadius: 3 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{g.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{g.playtime_forever} hrs total</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: PC.Steam }}>{g.playtime_2weeks}h</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>LAST 2 WKS</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
