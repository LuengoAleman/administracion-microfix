import { useState } from "react"
import { signIn } from "../services/authService.js"
import { C, cardStyle, inputStyle, primaryButtonStyle } from "../styles/theme.js"
import { FieldGroup } from "./common/FieldGroup.jsx"

export function Login() {
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  async function go(e) {
    e.preventDefault(); setLoading(true); setErr("")
    const { error } = await signIn(email, pass)
    if (error) setErr("Usuario o contraseña incorrectos.")
    setLoading(false)
  }
  return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ ...cardStyle, width: "100%", maxWidth: 380, borderColor: C.accent }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, background: C.accent, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: C.bg, margin: "0 auto 14px" }}>MX</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Microfix Admin</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Plataforma de gestión</div>
      </div>
      <form onSubmit={go} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldGroup label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="tu@email.com" required autoFocus /></FieldGroup>
        <FieldGroup label="Contraseña"><input type="password" value={pass} onChange={e => setPass(e.target.value)} style={inputStyle} placeholder="••••••••" required /></FieldGroup>
        {err && <div style={{ color: C.danger, fontSize: 13, textAlign: "center" }}>{err}</div>}
        <button type="submit" style={{ ...primaryButtonStyle, width: "100%", padding: "12px", marginTop: 4 }} disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      </form>
    </div>
  </div>
}
