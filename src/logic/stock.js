export const isLowStock = item => (item.cantidad || 0) <= (item.minimo || 2)
export const stockValue = stock => stock.reduce((sum, item) => sum + (item.cantidad || 0) * (item.costo_unitario || 0), 0)
export const filterStock = (stock, search) => {
  const q = String(search || "").toLowerCase()
  return stock.filter(s => !q || s.nombre?.toLowerCase().includes(q) || s.categoria?.toLowerCase().includes(q))
}
