// ── Colour tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg:      "#0f0f0f",
  surface: "#161616",
  border:  "#242424",
  text:    "#ddd",
  muted:   "#555",
  err:     "#f87171",
  ok:      "#4ade80",
};

export const PC = {
  GitHub:   "#3e36d3ff",
  Reddit:   "#ff4500",
  "Last.fm":"#d51007",
  Steam:    "#1db954",
};

export const LANG_COLOR = {
  JavaScript: "#f7df1e",
  Python:     "#3572A5",
  TypeScript: "#3178c6",
  "C++":      "#f34b7d",
  Go:         "#00add8",
  Rust:       "#dea584",
};

// ── Style helpers ─────────────────────────────────────────────────────────────
export const card  = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: 20 };
export const lbl   = { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 };
export const pill  = c => ({ display: "inline-block", padding: "2px 7px", borderRadius: 3, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${c}`, color: c });
export const dot   = c => ({ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block", marginRight: 6, flexShrink: 0 });
export const navS  = a => ({ padding: "10px 24px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", color: a ? C.text : C.muted, borderLeft: a ? `2px solid ${C.text}` : "2px solid transparent" });
export const tabS  = a => ({ padding: "5px 13px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", border: `1px solid ${a ? C.text : C.border}`, color: a ? C.bg : C.muted, background: a ? C.text : "transparent", borderRadius: 3, display: "flex", alignItems: "center", gap: 6 });
export const input = { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
export const btnP  = { padding: "10px 20px", background: C.text, color: C.bg, border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", width: "100%" };
export const btnS  = { ...btnP, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, width: "auto" };
