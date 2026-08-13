import { useEffect, useState } from "react"
import { Login } from "./components/Login.jsx"
import { AdminApp } from "./components/layout/AdminApp.jsx"
import { getSession, onAuthStateChange } from "./services/authService.js"
import { C } from "./styles/theme.js"
import "./styles/global.css"

export default function App() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = onAuthStateChange((_, currentSession) => setSession(currentSession))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>Cargando...</div>
  if (!session) return <Login />
  return <AdminApp session={session} />
}
