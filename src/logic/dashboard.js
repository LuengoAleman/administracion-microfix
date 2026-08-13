export function getDashboardStats(reps, clients, stock, gastos, month) {
  const activas = reps.filter(r => r.estado !== "Entregado" && r.estado !== "Sin solución")
  const listos = reps.filter(r => r.estado === "Listo")
  const ingresos = reps.filter(r => r.fecha?.startsWith(month) && r.estado === "Entregado").reduce((a, r) => a + (r.precio_total || 0), 0)
  const costoRep = reps.filter(r => r.fecha?.startsWith(month)).reduce((a, r) => a + (r.costo_pieza || 0), 0)
  const totalGas = gastos.filter(g => g.fecha?.startsWith(month)).reduce((a, g) => a + (g.monto || 0), 0)
  const stockBajo = stock.filter(s => (s.cantidad || 0) <= (s.minimo || 2))
  return { activas, listos, ingresos, costoRep, totalGas, ganancia: ingresos - costoRep - totalGas, stockBajo, clientsCount: clients.length }
}
