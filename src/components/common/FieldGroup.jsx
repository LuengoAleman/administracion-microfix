import { labelStyle } from "../../styles/theme.js"
export function FieldGroup({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={labelStyle}>{label}</span>{children}</div>
}
