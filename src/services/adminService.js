import { supabase } from "../supabase.js"
export async function loadAdminData(uid) {
  const [reparaciones, clientes, operarios, stock, gastos] = await Promise.all([
    supabase.from("reparaciones").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("clientes").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("operarios").select("*").eq("user_id", uid),
    supabase.from("stock").select("*").eq("user_id", uid),
    supabase.from("gastos").select("*").eq("user_id", uid).order("fecha", { ascending: false }),
  ])
  return { reparaciones, clientes, operarios, stock, gastos }
}
