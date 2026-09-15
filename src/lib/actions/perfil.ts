"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { esTelefonoValido } from "@/lib/validaciones";

export interface ActualizarTelefonoResult {
  ok: boolean;
  error?: string;
}

export async function actualizarTelefono(formData: FormData): Promise<ActualizarTelefonoResult> {
  const telefono = (formData.get("telefonoWa") as string)?.trim() ?? "";

  if (!esTelefonoValido(telefono)) {
    return {
      ok: false,
      error: "Ingresá el número con código de país, solo dígitos (ej: 595981234567).",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { error } = await supabase
    .from("agentes")
    .update({ telefono_wa: telefono })
    .eq("auth_user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
