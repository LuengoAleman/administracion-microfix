export const ESTADOS = ["Ingresado", "Diagnosticando", "En reparación", "Listo", "Entregado", "Sin solución"]

export const ESTADO_COLOR = {
  Ingresado: { bg: "rgba(122,128,153,.15)", text: "#9aa0b8", border: "rgba(122,128,153,.3)" },
  Diagnosticando: { bg: "rgba(255,179,71,.12)", text: "#ffb347", border: "rgba(255,179,71,.35)" },
  "En reparación": { bg: "rgba(123,97,255,.12)", text: "#7b61ff", border: "rgba(123,97,255,.35)" },
  Listo: { bg: "rgba(0,229,180,.12)", text: "#00e5b4", border: "rgba(0,229,180,.35)" },
  Entregado: { bg: "rgba(0,200,120,.1)", text: "#00c878", border: "rgba(0,200,120,.3)" },
  "Sin solución": { bg: "rgba(255,77,109,.12)", text: "#ff4d6d", border: "rgba(255,77,109,.35)" },
}

export const TIPO_REP = ["Cambio de pantalla", "Cambio de vidrio", "Batería", "Conector de carga", "Cámara", "Auricular/Micrófono", "Placa / Componentes", "Recuperación de datos", "Software", "Otro"]
export const MARCAS = ["Apple", "Samsung", "Motorola", "Xiaomi", "LG", "Huawei", "Nokia", "OPPO", "Realme", "Otro"]
export const CATS_STOCK = ["Pantallas", "Vidrios", "Baterías", "Conectores", "Cámaras", "Herramientas", "Insumos", "Otros"]
export const CATS_GASTO = ["Repuesto", "Herramienta", "Insumo", "Alquiler", "Servicios", "Publicidad", "Otro"]

export const TABS = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "reps", icon: "🔧", label: "Reparaciones" },
  { id: "clients", icon: "👥", label: "Clientes" },
  { id: "ops", icon: "🧑‍🔧", label: "Operarios" },
  { id: "stock", icon: "📦", label: "Stock" },
  { id: "finanzas", icon: "💰", label: "Finanzas" },
]
