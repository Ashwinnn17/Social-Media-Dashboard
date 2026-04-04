import { C, PC, dot, navS } from "../theme/styles";

export default function Sidebar({ user, screen, onNavigate, onSettings, onLogout }) {
  return (
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

      {[["feed", "Feed"], ["analytics", "Analytics"]].map(([id, label]) => (
        <div key={id} style={navS(screen === id)} onClick={() => onNavigate(id)}>{label}</div>
      ))}

      <div style={{ marginTop: "auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: 1 }} onClick={onSettings}>⚙ Settings</div>
        <div style={{ fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: 1 }} onClick={onLogout}>→ Sign out</div>
        <div style={{ fontSize: 9, color: C.border, letterSpacing: 1, marginTop: 4 }}>ICT 3230 · Group 13</div>
      </div>
    </div>
  );
}
