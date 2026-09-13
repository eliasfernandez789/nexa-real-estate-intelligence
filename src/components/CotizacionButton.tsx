"use client";

import { useState, useTransition } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { actualizarCotizacion } from "@/lib/actions/cotizacion";
import { transcurrido } from "@/lib/format";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CotizacionButton({
  tc,
  tcUpdatedAt,
  esAdmin,
}: {
  tc: number;
  tcUpdatedAt: string;
  esAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(String(tc));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const label = `₲ ${tc.toLocaleString("es-PY")} / USD`;

  if (!esAdmin) {
    return (
      <span
        title={`Actualizado ${transcurrido(tcUpdatedAt).toLowerCase()} · solo un admin puede editarla`}
        className="flex h-8 items-center rounded-md border border-surface-border bg-background px-2.5 font-mono text-[11.5px] font-medium text-foreground"
      >
        {label}
      </span>
    );
  }

  function guardar() {
    setError(null);
    const nuevoValor = Number(valor);
    startTransition(async () => {
      const result = await actualizarCotizacion(nuevoValor);
      if (result.ok) setOpen(false);
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValor(String(tc));
          setError(null);
        }
      }}
    >
      <PopoverTrigger
        className={`h-8 rounded-md border border-surface-border bg-background px-2.5 font-mono text-[11.5px] font-medium text-foreground transition-colors hover:border-surface-border-hover hover:bg-chip ${focusRing}`}
      >
        {label}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64">
        <div className="text-[13px] font-semibold">Editar cotización</div>
        <div className="mt-0.5 text-[11px] text-muted">
          Actualizado {transcurrido(tcUpdatedAt).toLowerCase()}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-light">₲</span>
          <input
            type="number"
            min={1}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={`h-9 w-full rounded-lg border border-surface-border bg-background px-2.5 text-sm text-foreground ${focusRing}`}
          />
          <span className="text-xs font-medium text-muted-light">/USD</span>
        </div>
        {error && <p className="mt-2 text-[11.5px] text-danger-text">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className={`h-8 rounded-lg border border-surface-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-chip ${focusRing}`}
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={isPending}
            className={`h-8 rounded-lg bg-primary-btn px-2.5 text-xs font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60 ${focusRing}`}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
