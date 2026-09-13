import { createClient } from "@/lib/supabase/server";

export interface ZonaGrupo {
  grupo: string;
  zonas: { id: string; nombre: string }[];
}

const GRUPO_LABEL: Record<string, string> = {
  asuncion: "Asunción",
  gran_asuncion: "Gran Asunción",
  interior: "Interior",
};

export async function getZonasAgrupadas(): Promise<ZonaGrupo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas")
    .select("id, nombre, grupo")
    .eq("activa", true)
    .order("grupo")
    .order("orden");

  if (error) throw error;

  const byGrupo = new Map<string, { id: string; nombre: string }[]>();
  for (const z of data ?? []) {
    const list = byGrupo.get(z.grupo) ?? [];
    list.push({ id: z.id, nombre: z.nombre });
    byGrupo.set(z.grupo, list);
  }

  return [...byGrupo.entries()].map(([grupo, zonas]) => ({
    grupo: GRUPO_LABEL[grupo] ?? grupo,
    zonas,
  }));
}
