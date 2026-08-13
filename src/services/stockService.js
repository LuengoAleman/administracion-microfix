import { supabase } from "../supabase.js"
export async function saveStockItem(payload, id) {
  const query = id ? supabase.from("stock").update(payload).eq("id", id) : supabase.from("stock").insert(payload)
  return query.select().single()
}
export const updateStockQuantity = (id, cantidad) => supabase.from("stock").update({ cantidad }).eq("id", id).select().single()
export const deleteStockItem = id => supabase.from("stock").delete().eq("id", id)
