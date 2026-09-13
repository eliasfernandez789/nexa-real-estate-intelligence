"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActualizarCotizacionResult {
  ok: boolean;
  error?: string;
}

export async function actualizarCotizacion(nuevoValor: number): Promise<ActualizarCotizacionResult> {
  if (!nuevoValor || nuevoValor <= 0) {
    return { ok: false, error: "Ingresá un valor de cotización válido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { data: agente } = await supabase
    .from("agentes")
    .select("id, rol")
    .eq("auth_user_id", user.id)
    .single();

  if (!agente || agente.rol !== "admin") {
    return { ok: false, error: "Solo un administrador puede editar la cotización." };
  }

  const { error } = await supabase
    .from("cotizacion")
    .update({
      guaranies_por_usd: nuevoValor,
      updated_by: agente.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}
