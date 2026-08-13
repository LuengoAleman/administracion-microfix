import { useEffect, useMemo, useState } from "react"
import { MARCAS, TIPO_REP } from "../config/catalogs.js"
import { loadAdminData } from "../services/adminService.js"

export function useAdminData(uid) {
  const [reps, setReps] = useState([])
  const [clients, setClients] = useState([])
  const [ops, setOps] = useState([])
  const [stock, setStock] = useState([])
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { reparaciones, clientes, operarios, stock, gastos } = await loadAdminData(uid)
      if (!active) return
      setReps(reparaciones.data || [])
      setClients(clientes.data || [])
      setOps(operarios.data || [])
      setStock(stock.data || [])
      setGastos(gastos.data || [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [uid])

  const suggestions = useMemo(() => ({
    clientNames: [...new Set(clients.map(c => c.nombre).filter(Boolean))],
    clientPhones: [...new Set(clients.map(c => c.telefono).filter(Boolean))],
    deviceModels: [...new Set(reps.map(r => r.modelo).filter(Boolean))],
    deviceBrands: [...new Set([...MARCAS, ...reps.map(r => r.marca).filter(Boolean)])],
    repTypes: [...new Set([...TIPO_REP, ...reps.map(r => r.tipo).filter(Boolean)])],
  }), [clients, reps])

  return { loading, reps, setReps, clients, setClients, ops, setOps, stock, setStock, gastos, setGastos, ...suggestions }
}
