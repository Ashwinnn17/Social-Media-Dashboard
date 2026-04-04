import { C, PC, dot, tabS } from "../theme/styles";
import GitHubPanel from "./panels/GitHubPanel";
import RedditPanel from "./panels/RedditPanel";
import LastfmPanel from "./panels/LastfmPanel";
import SteamPanel  from "./panels/SteamPanel";

const PLATFORMS = ["GitHub", "Reddit", "Last.fm", "Steam"];

export default function FeedView({ token, platform, onPlatformChange }) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Feed</div>
        <div style={{ fontSize: 11, color: C.muted }}>Live data from your connected accounts</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {PLATFORMS.map(p => (
          <button key={p} style={tabS(platform === p)} onClick={() => onPlatformChange(p)}>
            <span style={dot(PC[p])} />{p}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        {platform === "GitHub"  && <GitHubPanel token={token} />}
        {platform === "Reddit"  && <RedditPanel token={token} />}
        {platform === "Last.fm" && <LastfmPanel token={token} />}
        {platform === "Steam"   && <SteamPanel  token={token} />}
      </div>
    </>
  );
}
