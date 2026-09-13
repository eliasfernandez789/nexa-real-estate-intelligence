export type Temperatura = "caliente" | "tibio" | "frio";
export type Estado = "Activo" | "En Negociación" | "Cerrado" | "Archivado";
export type Moneda = "USD" | "PYG";

export interface Pedido {
  uuid: string;
  id: string;
  temperatura: Temperatura;
  estado: Estado;
  consultas: number;
  tiempo: string;
  createdAt: string;
  renovadoEn: string | null;
  vigenciaDias: number | null;
  tipo: string;
  zonas: string[];
  moneda: Moneda;
  precioMax: string;
  precioMaxRaw: number;
  aprox: string;
  descripcion: string;
  agenteNombre: string;
  agenteIniciales: string;
  agenteOficina: string;
  whatsapp: string;
  esMio: boolean;
  esMiOficina: boolean;
  puedeVerPrivado: boolean;
}

export const TEMPERATURA_LABEL: Record<Temperatura, string> = {
  caliente: "Caliente",
  tibio: "Tibio",
  frio: "Frío",
};

export const ESTADO_STYLE: Record<Estado, string> = {
  Activo: "bg-estado-activo-bg text-estado-activo-text",
  "En Negociación": "bg-estado-negociacion-bg text-estado-negociacion-text",
  Cerrado: "bg-chip text-muted",
  Archivado: "bg-chip text-muted",
};

export interface NavCounts {
  red: number;
  mios: number;
  urgentes: number;
}

export function esUrgente(p: Pick<Pedido, "temperatura" | "estado">): boolean {
  return p.temperatura === "caliente" && (p.estado === "Activo" || p.estado === "En Negociación");
}

export const TIPOS_INMUEBLE = [
  "Casa",
  "Departamento",
  "Dúplex",
  "Terreno",
  "Local Comercial",
  "Oficina",
  "Galpón",
] as const;
