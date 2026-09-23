import { supabase } from "../supabase.js"
export async function saveReparacion(payload, id) {
  const query = id ? supabase.from("reparaciones").update(payload).eq("id", id) : supabase.from("reparaciones").insert(payload)
  return query.select().single()
}
export const updateEstado = (id, estado) => supabase.from("reparaciones").update({ estado }).eq("id", id).select().single()
export const deleteReparacion = id => supabase.from("reparaciones").delete().eq("id", id)
