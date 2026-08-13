import { supabase } from "../supabase.js"
export async function saveOperario(payload, id) {
  const query = id ? supabase.from("operarios").update(payload).eq("id", id) : supabase.from("operarios").insert(payload)
  return query.select().single()
}
export const deleteOperario = id => supabase.from("operarios").delete().eq("id", id)
