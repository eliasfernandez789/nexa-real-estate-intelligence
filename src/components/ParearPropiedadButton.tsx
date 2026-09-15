"use client";

import { useState } from "react";
import { MagnifyingGlass, X, ArrowsLeftRight } from "@phosphor-icons/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Pedido } from "@/lib/pedidos";
import { TEMPERATURA_LABEL, ESTADO_STYLE } from "@/lib/pedidos";
import type { ZonaGrupo } from "@/lib/queries/zonas";

const TIPOS = ["Casa", "Departamento", "Dúplex", "Terreno", "Local Comercial", "Oficina", "Galpón"];
const TEMP_RANK: Record<string, number> = { caliente: 3, tibio: 2, frio: 1 };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
const inputClass = `h-9 w-full rounded-lg border border-surface-border bg-background px-3 text-sm text-foreground placeholder:text-muted ${focusRing}`;

interface Match {
  pedido: Pedido;
  score: number;
}

export function aUSD(pedido: Pedido, tc: number): number {
  return pedido.moneda === "USD" ? pedido.precioMaxRaw : pedido.precioMaxRaw / tc;
}

export function compatibilidad(
  captacion: { tipo: string; zona: string; moneda: "USD" | "PYG"; precio: number },
  pedido: Pedido,
  tc: number,
): number {
  let s = 0;
  const tipos = pedido.tipo.split("·");
  if (captacion.tipo && tipos.includes(captacion.tipo)) s += 40;
  if (captacion.zona && pedido.zonas.includes(captacion.zona)) s += 35;

  const precioUSD = captacion.moneda === "USD" ? captacion.precio : captacion.precio / tc;
  const tope = aUSD(pedido, tc);
  if (precioUSD <= tope) s += 25;
  else if (precioUSD <= tope * 1.1) s += 12;

  return s;
}

export function ParearPropiedadButton({
  pedidos,
  zonasAgrupadas,
  tc,
  open: openProp,
  onOpenChange,
}: {
  pedidos: Pedido[];
  zonasAgrupadas: ZonaGrupo[];
  tc: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [zona, setZona] = useState(zonasAgrupadas[0]?.zonas[0]?.nombre ?? "");
  const [moneda, setMoneda] = useState<"USD" | "PYG">("USD");
  const [precio, setPrecio] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);

  function buscar() {
    const precioNum = Number(precio);
    if (!precioNum) return;

    const matches = pedidos
      .filter((p) => p.estado === "Activo" || p.estado === "En Negociación")
      .map((pedido) => ({
        pedido,
        score: compatibilidad({ tipo, zona, moneda, precio: precioNum }, pedido, tc),
      }))
      .filter((m) => m.score >= 40)
      .sort(
        (a, b) =>
          b.score - a.score ||
          TEMP_RANK[b.pedido.temperatura] - TEMP_RANK[a.pedido.temperatura],
      );

    setResults(matches);
  }

  function reset() {
    setResults(null);
    setPrecio("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md border border-surface-border bg-background px-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-surface-border-hover hover:bg-chip ${focusRing}`}
      >
        <ArrowsLeftRight weight="regular" className="h-3.5 w-3.5 text-accent-blue" />
        Parear propiedad
        <kbd className="rounded border border-surface-border bg-surface px-1 font-mono text-[9px] text-muted">P</kbd>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[88vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
            <div className="flex items-start justify-between border-b border-surface-border px-5 py-4">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Flujo 2 · Motor de pareo
                </div>
                <h2 className="mt-0.5 text-base font-semibold">Matchear captación</h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-muted-light transition-colors hover:bg-chip ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
              <p className="text-[12.5px] text-muted-light">
                Cargá lo que acabás de captar. La bolsa te devuelve los pedidos compatibles,
                ordenados por afinidad.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-muted-light">
                    Tipo de inmueble
                  </label>
                  <select
                    className={inputClass}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-muted-light">
                    Barrio / Ciudad
                  </label>
                  <select
                    className={inputClass}
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                  >
                    {zonasAgrupadas.map((g) => (
                      <optgroup key={g.grupo} label={g.grupo}>
                        {g.zonas.map((z) => (
                          <option key={z.id} value={z.nombre}>
                            {z.nombre}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-muted-light">Moneda</label>
                  <select
                    className={inputClass}
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as "USD" | "PYG")}
                  >
                    <option value="USD">USD</option>
                    <option value="PYG">PYG</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-muted-light">
                    Precio de la captación
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="185000"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <button
                onClick={buscar}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary-btn text-[13px] font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 ${focusRing}`}
              >
                <MagnifyingGlass weight="bold" className="h-4 w-4" />
                Buscar coincidencias
              </button>

              {results !== null && (
                <div className="flex flex-col gap-3 border-t border-surface-border pt-4">
                  <div className="text-[12.5px] font-medium text-muted-light">
                    {results.length === 0
                      ? "Sin coincidencias para esa captación."
                      : `${results.length} pedido${results.length === 1 ? "" : "s"} compatible${results.length === 1 ? "" : "s"}, ordenados por afinidad`}
                  </div>
                  <div className="flex flex-col gap-2">
                    {results.map(({ pedido, score }) => (
                      <div
                        key={pedido.id}
                        className="flex items-center gap-3 rounded-lg border border-surface-border bg-background p-3"
                      >
                        <div className="rounded-full bg-nav-active px-2 py-0.5 font-mono text-[11px] font-semibold text-primary-btn">
                          {score}%
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-semibold">
                              {pedido.tipo}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ESTADO_STYLE[pedido.estado]}`}
                            >
                              {pedido.estado}
                            </span>
                          </div>
                          <div className="truncate text-[11.5px] text-muted">
                            {TEMPERATURA_LABEL[pedido.temperatura]} · {pedido.zonas.join(", ")} ·{" "}
                            {pedido.agenteNombre}
                          </div>
                        </div>
                        <div className="font-mono text-[13px] font-semibold">
                          {pedido.precioMax}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
