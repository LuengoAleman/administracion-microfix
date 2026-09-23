export const C = {
  bg: "#0b0e14",
  surface: "#161a22",
  surface2: "#1c2030",
  border: "#252b3b",
  accent: "#00e5b4",
  accent2: "#ff6b35",
  accent3: "#7b61ff",
  text: "#e8ecf4",
  muted: "#7a8099",
  danger: "#ff4d6d",
  warn: "#ffb347",
}

export const inputStyle = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  color: C.text,
  fontFamily: "inherit",
  fontSize: 13,
  padding: "9px 12px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
}

export const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }
export const primaryButtonStyle = { background: C.accent, color: C.bg, border: "none", borderRadius: 7, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
export const ghostButtonStyle = { background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 16px", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
export const dangerButtonStyle = { background: "transparent", border: `1px solid ${C.danger}`, borderRadius: 7, padding: "7px 13px", color: C.danger, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }
export const labelStyle = { fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: ".5px" }
export const badgeStyle = (color = {}) => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color.bg, color: color.text, border: `1px solid ${color.border}` })
