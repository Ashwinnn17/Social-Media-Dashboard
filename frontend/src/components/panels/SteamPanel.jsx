import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiFetch";
import { C, PC, card, lbl } from "../../theme/styles";
import HoverCard from "../../ui/HoverCard";
import ErrMsg from "../../ui/ErrMsg";
import { SkelLine, SkelCircle, SkelRect } from "../../ui/Skeleton";

function SteamSkeleton() {
  return (
    <>
      {/* Profile card */}
      <div style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
        <SkelRect width={56} height={56} mb={0} />
        <div style={{ flex: 1 }}>
          <SkelLine width="40%" height={14} mb={8} />
          <SkelLine width="25%" height={10} mb={6} />
          <SkelLine width="55%" height={9} mb={0} />
        </div>
        <SkelRect width={50} height={40} mb={0} />
      </div>
      {/* Games card */}
      <div style={{ background: "#161616", border: "1px solid #242424", borderRadius: 5, padding: 20 }}>
        <SkelLine width="30%" height={9} mb={16} />
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid #242424" : "none" }}>
            <SkelRect width={32} height={32} mb={0} />
            <div style={{ flex: 1 }}>
              <SkelLine width="55%" height={13} mb={6} />
              <SkelLine width="30%" height={10} mb={0} />
            </div>
            <SkelRect width={48} height={36} mb={0} />
          </div>
        ))}
      </div>
    </>
  );
}

export default function SteamPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState(null);
  const [sort, setSort] = useState("recent");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    apiFetch("/feed/steam", {}, token)
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  if (err)   return <ErrMsg msg={err} />;
  if (!data) return <SteamSkeleton />;

  const { profile, recentGames, ownedGames, totalGames } = data;
  const statusColor = profile.status === "Online" ? C.ok : C.muted;

  let displayGames = [];
  if (sort === "total") {
    displayGames = (ownedGames || []).slice(0, 50);
  } else {
    displayGames = [...(recentGames || [])].sort((a, b) => b.playtime_2weeks - a.playtime_2weeks);
  }

  return (
    <>
      {/* Profile card */}
      <HoverCard glowColor={PC.Steam} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
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
      </HoverCard>

      {/* Games list */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...lbl, marginBottom: 0 }}>Games {sort === "total" && "(Top 50)"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, padding: "2px 6px", outline: "none" }}>
              <option value="recent">Last 2 Weeks</option>
              <option value="total">All Library</option>
            </select>
            <button onClick={fetchData} disabled={refreshing} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 8px" }}>
              {refreshing ? "..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 350, overflowY: "auto", paddingRight: 4, marginRight: -4 }}>
          {displayGames.length === 0 ? (
            <div style={{ fontSize: 11, color: C.muted, paddingBottom: 10 }}>No recent activity</div>
          ) : displayGames.map((g, i) => (
            <div key={g.appid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < displayGames.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.15s" }}>
              {g.img_icon_url && (
                <img src={g.img_icon_url} alt="" style={{ width: 32, height: 32, borderRadius: 3 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{g.playtime_forever} hrs total</div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: PC.Steam }}>
                    {sort === "total" ? `${g.playtime_forever}h` : `${g.playtime_2weeks}h`}
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>
                    {sort === "total" ? "TOTAL" : "LAST 2 WKS"}
                  </div>
                </div>
                <a href={`steam://run/${g.appid}`} style={{ background: "rgba(29, 185, 84, 0.15)", border: `1px solid ${PC.Steam}`, color: PC.Steam, fontSize: 9, fontWeight: 600, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, textDecoration: "none" }}>
                  ▶ PLAY
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
