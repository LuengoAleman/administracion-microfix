import { useState } from "react"
import { inputStyle } from "../../styles/theme.js"
export function AutoInput({ value, onChange, options = [], placeholder, type = "text" }) {
  const [show, setShow] = useState(false)
  const filtered = options.filter(o => o?.toLowerCase().includes((value || "").toLowerCase()) && o.toLowerCase() !== (value || "").toLowerCase())
  return (
    <div style={{ position: "relative" }}>
      <input type={type} value={value || ""} placeholder={placeholder} style={inputStyle}
        onChange={e => onChange(e.target.value)} onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)} />
      {show && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1e2330", border: "1px solid #2a2f3e", borderRadius: 8, zIndex: 50, maxHeight: 150, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
          {filtered.slice(0, 6).map(o => (
            <div key={o} onMouseDown={() => onChange(o)} style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, color: "#e8ecf4", borderBottom: "1px solid #2a2f3e" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2a2f3e" }} onMouseLeave={e => { e.currentTarget.style.background = "" }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  )
}
