export const EMPTY_REPARACION = {
  nro_orden: "", cliente_nombre: "", cliente_tel: "", cliente_email: "", cliente_id: "",
  marca: "", modelo: "", tipo: "", descripcion: "", estado: "Ingresado", operario_id: "",
  costo_pieza: 0, precio_mo: 0, precio_total: 0, fecha: "", notas: "",
}

export const nextOrderNumber = count => `ORD-${String(count + 1).padStart(4, "0")}`

export function updateRepairForm(current, key, value, clients = []) {
  const next = { ...current, [key]: value }
  if (key === "cliente_nombre") {
    const found = clients.find(c => c.nombre?.toLowerCase() === String(value).toLowerCase())
    if (found) {
      next.cliente_tel = found.telefono || ""
      next.cliente_email = found.email || ""
      next.cliente_id = found.id
    }
  }
  if (key === "costo_pieza" || key === "precio_mo") {
    const cp = key === "costo_pieza" ? Number(value) : Number(next.costo_pieza)
    const mo = key === "precio_mo" ? Number(value) : Number(next.precio_mo)
    next.precio_total = cp + mo
  }
  return next
}

export function filterRepairs(reps, status, search) {
  const query = String(search || "").toLowerCase()
  return reps.filter(r => {
    const statusMatch = status === "Todos" || r.estado === status
    const queryMatch = !query || [r.cliente_nombre, r.modelo, r.marca, r.nro_orden, r.tipo].some(x => x?.toLowerCase().includes(query))
    return statusMatch && queryMatch
  })
}
