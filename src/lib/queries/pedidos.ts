import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { transcurrido } from "@/lib/format";
import type { Pedido, Temperatura, Estado, Moneda } from "@/lib/pedidos";

const fmt = (v: number) => Math.round(v).toLocaleString("es-PY");

const VIGENCIA_ESTADOS: Estado[] = ["Activo", "En Negociación"];

function calcularVigenciaDias(estado: Estado, createdAt: string, renovadoEn: string | null) {
  if (!VIGENCIA_ESTADOS.includes(estado)) return null;
  const desde = renovadoEn ?? createdAt;
  const diasTranscurridos = (Date.now() - new Date(desde).getTime()) / 8.64e7;
  return Math.ceil(30 - diasTranscurridos);
}

interface PedidoRow {
  id: string;
  codigo: string;
  agente_id: string;
  temperatura: Temperatura;
  estado: Estado;
  tipo: string;
  zonas: string[];
  moneda: Moneda;
  precio_max: number;
  descripcion: string;
  consultas: number;
  created_at: string;
  renovado_en: string | null;
  agentes: {
    nombre: string;
    iniciales: string;
    telefono_wa: string | null;
    oficina_id: string;
    oficinas: { nombre: string } | null;
  } | null;
}

export interface AgenteActual {
  id: string;
  oficinaId: string;
  rol: "agente" | "admin";
  nombre: string;
}

export interface PedidosResult {
  pedidos: Pedido[];
  tc: number;
  tcUpdatedAt: string;
  agenteActual: AgenteActual | null;
}

export const getPedidos = cache(async (): Promise<PedidosResult> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rows, error }, { data: cotizacion }, { data: miAgente }] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "id, codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, consultas, created_at, renovado_en, agentes(nombre, iniciales, telefono_wa, oficina_id, oficinas(nombre))",
      )
      .order("created_at", { ascending: false })
      .returns<PedidoRow[]>(),
    supabase.from("cotizacion").select("guaranies_por_usd, updated_at").eq("id", 1).single(),
    user
      ? supabase
          .from("agentes")
          .select("id, oficina_id, rol, nombre")
          .eq("auth_user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  if (error) throw error;

  const tc = cotizacion?.guaranies_por_usd ?? 7300;

  const pedidos = (rows ?? []).map((p) => {
    const agente = p.agentes;
    const aprox =
      p.moneda === "USD"
        ? `≈ Gs. ${fmt(p.precio_max * tc)}`
        : `≈ USD ${fmt(p.precio_max / tc)}`;

    return {
      uuid: p.id,
      id: p.codigo,
      temperatura: p.temperatura,
      estado: p.estado,
      consultas: p.consultas,
      tiempo: transcurrido(p.created_at),
      createdAt: p.created_at,
      renovadoEn: p.renovado_en,
      vigenciaDias: calcularVigenciaDias(p.estado, p.created_at, p.renovado_en),
      tipo: p.tipo,
      zonas: p.zonas,
      moneda: p.moneda,
      precioMax: fmt(p.precio_max),
      precioMaxRaw: p.precio_max,
      aprox,
      descripcion: p.descripcion,
      agenteNombre: agente?.nombre ?? "Sin agente",
      agenteIniciales: agente?.iniciales ?? "—",
      agenteOficina: agente?.oficinas?.nombre ?? "—",
      whatsapp: `https://wa.me/${agente?.telefono_wa ?? ""}`,
      esMio: miAgente?.id === p.agente_id,
      esMiOficina: miAgente?.oficina_id === agente?.oficina_id,
      puedeVerPrivado: miAgente?.id === p.agente_id || miAgente?.rol === "admin",
    };
  });

  return {
    pedidos,
    tc,
    tcUpdatedAt: cotizacion?.updated_at ?? new Date().toISOString(),
    agenteActual: miAgente
      ? { id: miAgente.id, oficinaId: miAgente.oficina_id, rol: miAgente.rol, nombre: miAgente.nombre }
      : null,
  };
});
