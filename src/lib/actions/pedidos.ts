"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CrearPedidoResult {
  ok: boolean;
  error?: string;
}

export async function crearPedido(formData: FormData): Promise<CrearPedidoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { data: agente, error: agenteError } = await supabase
    .from("agentes")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (agenteError || !agente) {
    return { ok: false, error: "No se encontró tu perfil de agente." };
  }

  const tipos = formData.getAll("tipo") as string[];
  const zonas = formData.getAll("zona") as string[];
  const moneda = formData.get("moneda") as string;
  const precioMax = Number(formData.get("precioMax"));
  const descripcion = (formData.get("descripcion") as string) ?? "";
  const temperatura = formData.get("temperatura") as string;
  const clienteNombre = (formData.get("clienteNombre") as string)?.trim();
  const clienteContacto = (formData.get("clienteContacto") as string)?.trim();

  if (!tipos.length) return { ok: false, error: "Elegí al menos un tipo de inmueble." };
  if (!zonas.length) return { ok: false, error: "Elegí al menos una zona." };
  if (!precioMax || precioMax <= 0) return { ok: false, error: "Cargá el presupuesto máximo." };
  if (!clienteNombre || !clienteContacto)
    return { ok: false, error: "Cargá el nombre y contacto del cliente." };

  const codigo = `PED-${Date.now().toString().slice(-6)}`;

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      codigo,
      agente_id: agente.id,
      temperatura,
      tipo: tipos.join("·"),
      zonas,
      moneda,
      precio_max: precioMax,
      descripcion: descripcion || "Sin observaciones cargadas.",
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    return { ok: false, error: `No se pudo publicar el pedido: ${pedidoError?.message}` };
  }

  const { error: privadoError } = await supabase.from("pedidos_privados").insert({
    pedido_id: pedido.id,
    cliente_nombre: clienteNombre,
    cliente_contacto: clienteContacto,
  });

  if (privadoError) {
    return {
      ok: false,
      error: `El pedido se publicó pero falló guardar el cliente privado: ${privadoError.message}`,
    };
  }

  revalidatePath("/");
  return { ok: true };
}
