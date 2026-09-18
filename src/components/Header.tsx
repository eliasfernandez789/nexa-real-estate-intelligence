"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { NuevoPedidoButton } from "@/components/NuevoPedidoButton";
import { ParearPropiedadButton } from "@/components/ParearPropiedadButton";
import { CotizacionButton } from "@/components/CotizacionButton";
import { useFilters } from "@/lib/filters-context";
import type { ZonaGrupo } from "@/lib/queries/zonas";
import type { Pedido } from "@/lib/pedidos";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Header({
  zonasAgrupadas,
  pedidos,
  tc,
  tcUpdatedAt,
  esAdmin,
  nuevoOpen,
  onNuevoOpenChange,
  parearOpen,
  onParearOpenChange,
}: {
  zonasAgrupadas: ZonaGrupo[];
  pedidos: Pedido[];
  tc: number;
  tcUpdatedAt: string;
  esAdmin: boolean;
  nuevoOpen: boolean;
  onNuevoOpenChange: (open: boolean) => void;
  parearOpen: boolean;
  onParearOpenChange: (open: boolean) => void;
}) {
  const { busqueda, setBusqueda, soloOficina, setSoloOficina } = useFilters();

  return (
    <header className="scrollbar-none sticky top-0 z-30 flex h-12 flex-nowrap items-center justify-between gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap border-b border-surface-border bg-surface px-6 sm:px-8 xl:px-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <MagnifyingGlass
            weight="bold"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          />
          <input
            id="nexa-search"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por tipo, zona, agente o requerimiento…"
            className={`h-8 w-[280px] rounded-md border border-surface-border bg-background pl-8 pr-12 text-[14px] text-foreground placeholder:text-muted transition-colors duration-150 hover:border-surface-border-hover focus-visible:border-ring/70 ${focusRing}`}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-surface-border bg-surface px-1 font-mono text-[11px] text-muted shadow-xs">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-0.5 rounded-md border border-surface-border bg-background p-0.5">
          <button
            onClick={() => setSoloOficina(false)}
            className={`rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${
              !soloOficina
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:bg-chip hover:text-muted-light"
            } ${focusRing}`}
          >
            Toda la Red
          </button>
          <button
            onClick={() => setSoloOficina(true)}
            className={`rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${
              soloOficina
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:bg-chip hover:text-muted-light"
            } ${focusRing}`}
          >
            Solo Mi Oficina
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-1 hidden h-4 w-px bg-surface-border sm:block" />
        <CotizacionButton tc={tc} tcUpdatedAt={tcUpdatedAt} esAdmin={esAdmin} />
        <ParearPropiedadButton
          pedidos={pedidos}
          zonasAgrupadas={zonasAgrupadas}
          tc={tc}
          open={parearOpen}
          onOpenChange={onParearOpenChange}
        />
        <NuevoPedidoButton
          zonasAgrupadas={zonasAgrupadas}
          open={nuevoOpen}
          onOpenChange={onNuevoOpenChange}
        />
      </div>
    </header>
  );
}
