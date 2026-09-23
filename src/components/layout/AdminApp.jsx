import { useState } from "react"
import { TABS } from "../../config/catalogs.js"
import { useAdminData } from "../../hooks/useAdminData.js"
import { useToast } from "../../hooks/useToast.js"
import { signOut } from "../../services/authService.js"
import { C, dangerButtonStyle, ghostButtonStyle } from "../../styles/theme.js"
import { ToastContainer } from "../common/ToastContainer.jsx"
import { Dashboard } from "../../pages/Dashboard.jsx"
import { Reparaciones } from "../../pages/Reparaciones.jsx"
import { Clientes } from "../../pages/Clientes.jsx"
import { Operarios } from "../../pages/Operarios.jsx"
import { StockPage } from "../../pages/StockPage.jsx"
import { Finanzas } from "../../pages/Finanzas.jsx"

export function AdminApp({ session }) {
  const [tab, setTab] = useState("dashboard")
  const { toasts, add: toast } = useToast()
  const uid = session.user.id
  const data = useAdminData(uid)
  const { loading, ...sharedData } = data
  const shared = { ...sharedData, toast, uid }

  if (loading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>Cargando datos...</div>

  return <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "system-ui,'Segoe UI',sans-serif", fontSize: 14 }}>
    <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 100, height: 52 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: C.bg }}>MX</div>
      </div>
      <nav style={{ display: "flex", gap: 2, overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ ...ghostButtonStyle, whiteSpace: "nowrap", padding: "6px 12px", fontSize: 12, ...(tab === t.id ? { background: C.surface2, color: C.accent, borderColor: C.accent } : {}) }}><span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}</button>)}
      </nav>
      <button onClick={signOut} style={{ ...dangerButtonStyle, fontSize: 11, padding: "5px 10px" }}>Salir</button>
    </header>
    <main style={{ padding: 20, maxWidth: 1300, margin: "0 auto" }}>
      {tab === "dashboard" && <Dashboard {...shared} setTab={setTab} />}
      {tab === "reps" && <Reparaciones {...shared} />}
      {tab === "clients" && <Clientes {...shared} />}
      {tab === "ops" && <Operarios {...shared} />}
      {tab === "stock" && <StockPage {...shared} />}
      {tab === "finanzas" && <Finanzas {...shared} />}
    </main>
    <ToastContainer toasts={toasts} />
  </div>
}
