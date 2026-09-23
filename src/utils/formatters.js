export const fmtMoney = n => `$${Number(n || 0).toLocaleString("es-AR")}`
export const fmtDate = d => d ? new Date(`${d}T12:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"
export const today = () => new Date().toISOString().slice(0, 10)
export const waLink = (phone, message) => `https://wa.me/549${String(phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
export const mailLink = (email, subject, body) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
