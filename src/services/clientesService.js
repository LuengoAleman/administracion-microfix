import { supabase } from "../supabase.js"
export async function saveCliente(payload, id) {
  const query = id ? supabase.from("clientes").update(payload).eq("id", id) : supabase.from("clientes").insert(payload)
  return query.select().single()
}
export const createCliente = payload => supabase.from("clientes").insert(payload).select().single()
export const deleteCliente = id => supabase.from("clientes").delete().eq("id", id)
