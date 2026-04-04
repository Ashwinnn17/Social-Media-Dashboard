import { useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { C, card, lbl, input, btnP } from "../theme/styles";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("token", data.token);
      onAuth(data.user, data.token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'SF Mono','Fira Code','Courier New',monospace" }}>
      <div style={{ width: 360 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.text, marginBottom: 32, textAlign: "center" }}>Dashboard</div>

        <div style={{ ...card, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.text, marginBottom: 24 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Name</div>
              <input style={input} placeholder="Your name" value={form.name} onChange={set("name")} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={lbl}>Email</div>
            <input style={input} placeholder="you@example.com" value={form.email} onChange={set("email")}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={lbl}>Password</div>
            <input style={input} type="password" placeholder="••••••" value={form.password} onChange={set("password")}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          {err && <div style={{ fontSize: 11, color: C.err, marginBottom: 14 }}>{err}</div>}

          <button style={btnP} onClick={submit} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Register"}
          </button>

          <div style={{ marginTop: 16, fontSize: 11, color: C.muted, textAlign: "center" }}>
            {mode === "login" ? "No account? " : "Have an account? "}
            <span style={{ color: C.text, cursor: "pointer" }}
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
              {mode === "login" ? "Register" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
