import { supabase } from "../supabase.js"
export async function saveGasto(payload, id) {
  const query = id ? supabase.from("gastos").update(payload).eq("id", id) : supabase.from("gastos").insert(payload)
  return query.select().single()
}
export const deleteGasto = id => supabase.from("gastos").delete().eq("id", id)
