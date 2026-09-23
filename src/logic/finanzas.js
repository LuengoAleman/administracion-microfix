export function getFinanceStats(reps, gastos, month) {
  const mesReps = reps.filter(r => r.fecha?.startsWith(month))
  const ingresos = mesReps.filter(r => r.estado === "Entregado").reduce((a, r) => a + (r.precio_total || 0), 0)
  const costoRep = mesReps.reduce((a, r) => a + (r.costo_pieza || 0), 0)
  const mesGas = gastos.filter(g => g.fecha?.startsWith(month))
  const totalGas = mesGas.reduce((a, g) => a + (g.monto || 0), 0)
  return { mesReps, mesGas, ingresos, costoRep, totalGas, gananciaBruta: ingresos - costoRep, gananciaNeta: ingresos - costoRep - totalGas }
}
