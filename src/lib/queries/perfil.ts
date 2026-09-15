import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface Perfil {
  id: string;
  nombre: string;
  iniciales: string;
  oficinaNombre: string;
  rol: "agente" | "admin";
  telefonoWa: string | null;
  email: string | null;
}

interface PerfilRow {
  id: string;
  nombre: string;
  iniciales: string;
  rol: "agente" | "admin";
  telefono_wa: string | null;
  oficinas: { nombre: string } | null;
}

export const getPerfilActual = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("agentes")
    .select("id, nombre, iniciales, rol, telefono_wa, oficinas(nombre)")
    .eq("auth_user_id", user.id)
    .single<PerfilRow>();

  if (!data) return null;

  return {
    id: data.id,
    nombre: data.nombre,
    iniciales: data.iniciales,
    oficinaNombre: data.oficinas?.nombre ?? "—",
    rol: data.rol,
    telefonoWa: data.telefono_wa,
    email: user.email ?? null,
  };
});
