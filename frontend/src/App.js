import { useState, useEffect } from "react";
import { apiFetch } from "./api/apiFetch";
import { C, PC, card, btnS, dot } from "./theme/styles";

import AuthScreen      from "./components/AuthScreen";
import SettingsScreen  from "./components/SettingsScreen";
import Sidebar         from "./components/Sidebar";
import FeedView        from "./components/FeedView";
import AnalyticsPanel  from "./components/AnalyticsPanel";

export default function App() {
  const [token,     setToken]     = useState(() => localStorage.getItem("token"));
  const [user,      setUser]      = useState(null);
  const [screen,    setScreen]    = useState("feed"); // feed | analytics | settings
  const [platform,  setPlatform]  = useState("GitHub");
  const [authReady, setAuthReady] = useState(false);

  // Verify stored token on mount
  useEffect(() => {
    if (!token) { setAuthReady(true); return; }
    apiFetch("/user/me", {}, token)
      .then(u  => { setUser(u); setAuthReady(true); })
      .catch(() => { localStorage.removeItem("token"); setToken(null); setAuthReady(true); });
  }, []);

  const onAuth         = (u, t) => { setUser(u); setToken(t); };
  const logout         = ()     => { localStorage.removeItem("token"); setToken(null); setUser(null); };
  const onSaveAccounts = (u)    => { setUser(u); setScreen("feed"); };

  if (!authReady) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: C.muted, fontSize: 11 }}>
      loading...
    </div>
  );

  if (!token || !user) return <AuthScreen onAuth={onAuth} />;
  if (screen === "settings") return <SettingsScreen user={user} token={token} onSave={onSaveAccounts} onBack={() => setScreen("feed")} />;

  const hasAccounts = user.accounts?.github || user.accounts?.reddit || user.accounts?.lastfm || user.accounts?.steam;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>

      <Sidebar
        user={user}
        screen={screen}
        onNavigate={setScreen}
        onSettings={() => setScreen("settings")}
        onLogout={logout}
      />

      <div style={{ marginLeft: 200, flex: 1, padding: "36px 44px" }}>

        {/* No accounts warning */}
        {!hasAccounts && (
          <div style={{ ...card, marginBottom: 20, borderColor: C.muted, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>No accounts connected yet.</span>
            <button style={{ ...btnS, fontSize: 11 }} onClick={() => setScreen("settings")}>Connect accounts →</button>
          </div>
        )}

        {screen === "feed" && (
          <FeedView token={token} platform={platform} onPlatformChange={setPlatform} />
        )}

        {screen === "analytics" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Analytics</div>
              <div style={{ fontSize: 11, color: C.muted }}>Combined overview across all platforms</div>
            </div>
            <AnalyticsPanel token={token} />
          </>
        )}
      </div>
    </div>
  );
}