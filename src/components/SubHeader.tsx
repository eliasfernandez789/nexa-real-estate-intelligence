"use client";

import { CaretDown } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFilters, type EstadoFiltro } from "@/lib/filters-context";
import { TIPOS_INMUEBLE, type Temperatura } from "@/lib/pedidos";
import type { ZonaGrupo } from "@/lib/queries/zonas";

const TEMPERATURAS: { value: Temperatura; label: string; dot: string; text: string }[] = [
  { value: "caliente", label: "Caliente", dot: "bg-dot-caliente", text: "text-dot-caliente" },
  { value: "tibio", label: "Tibio", dot: "bg-dot-tibio", text: "text-dot-tibio" },
  { value: "frio", label: "Frío", dot: "bg-dot-frio", text: "text-dot-frio" },
];

const ESTADOS: { value: EstadoFiltro; label: string }[] = [
  { value: "activos", label: "Activos y en negociación" },
  { value: "todos", label: "Todos los estados" },
  { value: "cerrados", label: "Cerrados" },
  { value: "archivados", label: "Archivados" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SubHeader({
  zonasAgrupadas,
  conteoTemperatura,
  total,
}: {
  zonasAgrupadas: ZonaGrupo[];
  conteoTemperatura: Record<Temperatura, number>;
  total: number;
}) {
  const {
    temperaturas,
    toggleTemperatura,
    tipos,
    toggleTipo,
    zonas,
    toggleZona,
    estadoFiltro,
    setEstadoFiltro,
    limpiar,
  } = useFilters();

  return (
    <div className="sticky top-12 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-chip/40 px-6 py-2 sm:px-8 xl:px-10">
      <div className="flex flex-wrap items-center gap-1">
        <button
          onClick={() => temperaturas.forEach(toggleTemperatura)}
          className={`h-6 rounded px-2 text-[11px] font-semibold transition-colors ${
            temperaturas.size === 0
              ? "bg-surface border border-surface-border text-foreground shadow-xs"
              : "text-muted hover:bg-surface"
          } ${focusRing}`}
        >
          Todas <span className="font-mono text-muted">{total}</span>
        </button>
        {TEMPERATURAS.map(({ value, label, dot, text }) => {
          const active = temperaturas.has(value);
          return (
            <button
              key={value}
              onClick={() => toggleTemperatura(value)}
              className={`inline-flex h-6 items-center gap-1.5 rounded px-2 text-[11px] transition-colors ${
                active ? "bg-surface border border-surface-border text-foreground shadow-xs" : "text-muted hover:bg-surface"
              } ${focusRing}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {label}
              <span className={`font-mono text-[10px] font-medium ${active ? text : "text-muted"}`}>
                {conteoTemperatura[value]}
              </span>
            </button>
          );
        })}

        <div className="mx-1 h-3.5 w-px bg-surface-border" />

        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => tipos.forEach(toggleTipo)}
            className={`h-6 rounded px-2 font-medium transition-colors ${
              tipos.size === 0 ? "bg-foreground text-background" : "text-muted hover:bg-surface"
            } ${focusRing}`}
          >
            Todos
          </button>
          {TIPOS_INMUEBLE.map((t) => (
            <button
              key={t}
              onClick={() => toggleTipo(t)}
              className={`h-6 rounded px-2 transition-colors ${
                tipos.has(t) ? "bg-surface border border-surface-border text-foreground shadow-xs" : "text-muted hover:bg-surface"
              } ${focusRing}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            className={`inline-flex h-6 items-center gap-1 rounded border px-2 text-[11px] transition-colors ${
              zonas.size > 0
                ? "border-primary-btn bg-nav-active text-primary-btn"
                : "border-surface-border bg-surface text-muted-light hover:border-surface-border-hover"
            } ${focusRing}`}
          >
            <span className="text-muted">Zonas:</span>
            <span className="font-medium">{zonas.size === 0 ? "Todas" : `${zonas.size} seleccionadas`}</span>
            <CaretDown className="h-3 w-3 text-muted" />
          </PopoverTrigger>
          <PopoverContent align="start" className="max-h-72 w-64 overflow-y-auto p-2">
            {zonasAgrupadas.map((g) => (
              <div key={g.grupo}>
                <div className="px-1.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  {g.grupo}
                </div>
                {g.zonas.map((z) => (
                  <label
                    key={z.id}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-muted-light hover:bg-chip"
                  >
                    <input
                      type="checkbox"
                      checked={zonas.has(z.nombre)}
                      onChange={() => toggleZona(z.nombre)}
                      className="h-3.5 w-3.5 accent-[color:var(--ring)]"
                    />
                    {z.nombre}
                  </label>
                ))}
              </div>
            ))}
          </PopoverContent>
        </Popover>

        <div className="relative">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as EstadoFiltro)}
            className={`h-6 appearance-none rounded border border-surface-border bg-surface pl-2 pr-6 text-[11px] font-medium text-foreground transition-colors hover:border-surface-border-hover ${focusRing}`}
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" />
        </div>

        <button
          onClick={limpiar}
          className={`h-6 rounded px-1.5 text-[11px] font-medium text-muted transition-colors hover:text-danger-text ${focusRing}`}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
