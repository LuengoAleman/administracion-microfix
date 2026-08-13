import { C } from "../../styles/theme.js"
export function ToastContainer({ toasts }) {
  return <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 999 }}>
    {toasts.map(t => <div key={t.id} style={{ background: t.type === "ok" ? C.accent : t.type === "err" ? C.danger : C.warn, color: C.bg, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,.4)" }}>{t.msg}</div>)}
  </div>
}
