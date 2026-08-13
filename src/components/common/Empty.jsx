import { C } from "../../styles/theme.js"
export function Empty({ icon, text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div><div style={{ fontSize: 13 }}>{text}</div></div>
}
