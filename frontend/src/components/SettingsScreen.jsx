import { useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { C, PC, card, lbl, input, btnP, btnS } from "../theme/styles";

const FIELDS = [
  { key: "github",  label: "GitHub Username",   placeholder: "e.g. torvalds",          color: PC.GitHub       },
  { key: "reddit",  label: "Reddit Username",   placeholder: "e.g. spez",              color: PC.Reddit       },
  { key: "lastfm",  label: "Last.fm Username",  placeholder: "e.g. rj",                color: PC["Last.fm"]   },
  { key: "steam",   label: "Steam ID64",        placeholder: "e.g. 76561198842043717", color: PC.Steam        },
];

export default function SettingsScreen({ user, token, onSave, onBack }) {
  const [form, setForm]       = useState({
    github: user.accounts?.github || "",
    reddit: user.accounts?.reddit || "",
    lastfm: user.accounts?.lastfm || "",
    steam:  user.accounts?.steam  || "",
  });
  const [msg, setMsg]         = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setMsg(""); setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/user/accounts", { method: "PUT", body: JSON.stringify(form) }, token);
      setMsg("Saved.");
      onSave(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>
      <div style={{ width: 400 }}>
        <div style={{ ...card, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.text }}>Connected Accounts</div>
            <button style={btnS} onClick={onBack}>Back</button>
          </div>

          {FIELDS.map(({ key, label, placeholder, color }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ ...lbl, color }}>{label}</div>
              <input style={input} placeholder={placeholder} value={form[key]} onChange={set(key)} />
            </div>
          ))}

          {msg && <div style={{ fontSize: 11, color: C.ok, marginBottom: 12 }}>{msg}</div>}
          {err && <div style={{ fontSize: 11, color: C.err, marginBottom: 12 }}>{err}</div>}

          <button style={btnP} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
