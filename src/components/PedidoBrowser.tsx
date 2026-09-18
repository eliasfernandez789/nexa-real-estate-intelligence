"use client";

import { useMemo, useState } from "react";
import { Buildings } from "@phosphor-icons/react";
import { Header } from "@/components/Header";
import { SubHeader } from "@/components/SubHeader";
import { PedidoGrid } from "@/components/PedidoGrid";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFilters } from "@/lib/filters-context";
import { esUrgente, type Pedido, type Temperatura } from "@/lib/pedidos";
import type { ZonaGrupo } from "@/lib/queries/zonas";

const TITULOS = {
  red: "Toda la Red",
  mios: "Mis Pedidos",
  urgentes: "Urgentes",
} as const;

function aUSD(pedido: Pedido, tc: number): number {
  return pedido.moneda === "USD" ? pedido.precioMaxRaw : pedido.precioMaxRaw / tc;
}

const fmt = (v: number) => Math.round(v).toLocaleString("es-PY");

export function PedidoBrowser({
  pedidos,
  zonasAgrupadas,
  tc,
  tcUpdatedAt,
  esAdmin,
}: {
  pedidos: Pedido[];
  zonasAgrupadas: ZonaGrupo[];
  tc: number;
  tcUpdatedAt: string;
  esAdmin: boolean;
}) {
  const { vista, busqueda, temperaturas, tipos, zonas, estadoFiltro, soloOficina, orden } = useFilters();
  const [abierto, setAbierto] = useState<Pedido | null>(null);
  const [focoIndex, setFocoIndex] = useState<number | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [parearOpen, setParearOpen] = useState(false);

  // Base scope (vista + oficina) usado para los conteos de temperatura del
  // SubHeader — no se recalculan al tocar los demás filtros, para que los
  // números no salten mientras el agente arma su búsqueda.
  const pedidosVista = useMemo(() => {
    return pedidos.filter((p) => {
      if (vista === "mios" && !p.esMio) return false;
      if (vista === "urgentes" && !esUrgente(p)) return false;
      if (soloOficina && !p.esMiOficina) return false;
      return true;
    });
  }, [pedidos, vista, soloOficina]);

  // Además del scope de vista/oficina, los conteos también respetan el
  // estado seleccionado: si no lo hicieran, un chip podría mostrar "6" y al
  // hacer clic dejar la grilla vacía porque esos 6 no están en el estado
  // actualmente filtrado.
  const pedidosParaConteo = useMemo(() => {
    return pedidosVista.filter((p) => {
      if (estadoFiltro === "activos" && p.estado !== "Activo" && p.estado !== "En Negociación")
        return false;
      if (estadoFiltro === "cerrados" && p.estado !== "Cerrado") return false;
      if (estadoFiltro === "archivados" && p.estado !== "Archivado") return false;
      return true;
    });
  }, [pedidosVista, estadoFiltro]);

  const conteoTemperatura = useMemo(() => {
    const base: Record<Temperatura, number> = { caliente: 0, tibio: 0, frio: 0 };
    for (const p of pedidosParaConteo) base[p.temperatura]++;
    return base;
  }, [pedidosParaConteo]);

  const pedidosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    const filtrados = pedidosParaConteo.filter((p) => {
      if (temperaturas.size > 0 && !temperaturas.has(p.temperatura)) return false;
      if (tipos.size > 0 && !p.tipo.split("·").some((t) => tipos.has(t))) return false;
      if (zonas.size > 0 && !p.zonas.some((z) => zonas.has(z))) return false;

      if (q) {
        const haystack = `${p.tipo} ${p.descripcion} ${p.zonas.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const TEMP_RANK: Record<Temperatura, number> = { caliente: 3, tibio: 2, frio: 1 };
    if (orden === "temperatura") {
      filtrados.sort((a, b) => TEMP_RANK[b.temperatura] - TEMP_RANK[a.temperatura]);
    } else if (orden === "presupuesto") {
      filtrados.sort((a, b) => aUSD(b, tc) - aUSD(a, tc));
    }
    // "reciente" ya viene ordenado desde la query (created_at desc)

    return filtrados;
  }, [pedidosParaConteo, busqueda, temperaturas, tipos, zonas, orden, tc]);

  const focoIndexClamped =
    focoIndex !== null ? Math.min(focoIndex, pedidosFiltrados.length - 1) : null;
  const enfocado = focoIndexClamped !== null ? pedidosFiltrados[focoIndexClamped] : null;

  useKeyboardShortcuts({
    onFocusSearch: () => document.getElementById("nexa-search")?.focus(),
    onNext: () =>
      setFocoIndex((i) => (pedidosFiltrados.length === 0 ? null : Math.min((i ?? -1) + 1, pedidosFiltrados.length - 1))),
    onPrev: () => setFocoIndex((i) => (pedidosFiltrados.length === 0 ? null : Math.max((i ?? 0) - 1, 0))),
    onOpen: () => enfocado && setAbierto(enfocado),
    onWhatsapp: () => enfocado && window.open(enfocado.whatsapp, "_blank"),
    onNuevoPedido: () => setNuevoOpen(true),
    onParear: () => setParearOpen(true),
  });

  const totalConsultas = pedidosFiltrados.reduce((sum, p) => sum + p.consultas, 0);
  const agentesActivos = new Set(pedidosFiltrados.map((p) => p.agenteNombre)).size;
  const oficinasActivas = new Set(pedidosFiltrados.map((p) => p.agenteOficina)).size;
  const demandaUSD = pedidosFiltrados.reduce((sum, p) => sum + aUSD(p, tc), 0);
  const titulo = TITULOS[vista];

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        zonasAgrupadas={zonasAgrupadas}
        pedidos={pedidos}
        tc={tc}
        tcUpdatedAt={tcUpdatedAt}
        esAdmin={esAdmin}
        nuevoOpen={nuevoOpen}
        onNuevoOpenChange={setNuevoOpen}
        parearOpen={parearOpen}
        onParearOpenChange={setParearOpen}
      />
      <SubHeader zonasAgrupadas={zonasAgrupadas} conteoTemperatura={conteoTemperatura} total={pedidosParaConteo.length} />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-surface-border bg-surface px-6 py-1.5 text-[13px] text-muted sm:px-8 xl:px-10">
        <span className="font-mono font-semibold text-foreground">{pedidosFiltrados.length}</span>
        <span>pedido{pedidosFiltrados.length === 1 ? "" : "s"} en esta vista</span>
        <span className="text-surface-border-hover">·</span>
        <span className="font-mono font-semibold text-foreground">{totalConsultas}</span>
        <span>consultas</span>
        <span className="text-surface-border-hover">·</span>
        <span className="font-mono font-semibold text-foreground">{agentesActivos}</span>
        <span>agentes</span>
        <span className="text-surface-border-hover">·</span>
        <Buildings weight="regular" className="h-3 w-3 text-muted" />
        <span className="font-mono font-semibold text-foreground">{oficinasActivas}</span>
        <span>oficina{oficinasActivas === 1 ? "" : "s"} con pedidos publicados</span>
        <span className="text-surface-border-hover">·</span>
        <span>Demanda en vista:</span>
        <span className="font-mono font-semibold text-accent-blue">
          USD {demandaUSD >= 1_000_000 ? `${(demandaUSD / 1_000_000).toFixed(1)}M` : fmt(demandaUSD)}
        </span>
        <span className="font-mono text-muted">(≈ ₲ {fmt(demandaUSD * tc)})</span>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-12 pt-4 sm:px-8 xl:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.5px]">{titulo}</h1>
        </div>

        <PedidoGrid
          pedidos={pedidosFiltrados}
          abierto={abierto}
          onOpen={setAbierto}
          onClose={() => setAbierto(null)}
          focoIndex={focoIndexClamped ?? undefined}
        />
      </div>

      <div className="sticky bottom-0 z-20 hidden h-7 items-center justify-between border-t border-surface-border bg-surface px-6 text-[12px] text-muted sm:flex sm:px-8 xl:px-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">J</kbd>
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">K</kbd>
            <span>Navegar pedidos</span>
          </span>
          <span className="text-surface-border-hover">·</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">↵</kbd>
            <span>Abrir ficha</span>
          </span>
          <span className="text-surface-border-hover">·</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">W</kbd>
            <span>WhatsApp</span>
          </span>
          <span className="text-surface-border-hover">·</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">P</kbd>
            <span>Parear</span>
          </span>
          <span className="text-surface-border-hover">·</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-surface-border bg-chip px-1 font-mono text-foreground">N</kbd>
            <span>Nuevo pedido</span>
          </span>
        </div>
        <span className="font-mono">NEXA</span>
      </div>
    </div>
  );
}
