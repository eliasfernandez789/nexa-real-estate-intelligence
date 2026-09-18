"use client";

import { useState, useTransition } from "react";
import { X } from "@phosphor-icons/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { crearPedido } from "@/lib/actions/pedidos";
import type { ZonaGrupo } from "@/lib/queries/zonas";

const TIPOS = ["Casa", "Departamento", "Dúplex", "Terreno", "Local Comercial", "Oficina", "Galpón"];

const TEMPERATURAS: { value: string; label: string; hint: string }[] = [
  { value: "caliente", label: "Caliente", hint: "0 – 30 días" },
  { value: "tibio", label: "Tibio", hint: "1 – 3 meses" },
  { value: "frio", label: "Frío", hint: "+3 meses / inversor" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
const inputClass = `h-9 w-full rounded-lg border border-surface-border bg-background px-3 text-sm text-foreground placeholder:text-muted ${focusRing}`;

export function NuevoPedidoButton({
  zonasAgrupadas,
  open: openProp,
  onOpenChange,
}: {
  zonasAgrupadas: ZonaGrupo[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const [tipos, setTipos] = useState<string[]>([]);
  const [zonas, setZonas] = useState<string[]>([]);
  const [temperatura, setTemperatura] = useState("caliente");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function reset() {
    setTipos([]);
    setZonas([]);
    setTemperatura("caliente");
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    tipos.forEach((t) => formData.append("tipo", t));
    zonas.forEach((z) => formData.append("zona", z));
    formData.set("temperatura", temperatura);

    startTransition(async () => {
      const result = await crearPedido(formData);
      if (result.ok) {
        setOpen(false);
        reset();
      } else {
        setError(result.error ?? "Ocurrió un error.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md bg-primary-btn px-3 text-[14px] font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 ${focusRing}`}
      >
        + Nuevo pedido
        <kbd className="rounded border border-white/25 bg-black/20 px-1 font-mono text-[11px] text-white/80">N</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[88vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
            <div className="flex items-start justify-between border-b border-surface-border px-5 py-4">
              <div>
                <div className="text-[12.5px] font-semibold uppercase tracking-wide text-muted">
                  Flujo 1 · Cargar pedido
                </div>
                <h2 className="mt-0.5 text-base font-semibold">Nuevo pedido de comprador</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-muted-light transition-colors hover:bg-chip ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-muted-light">
                  Tipo de inmueble <span className="text-danger-text">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TIPOS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggle(tipos, setTipos, t)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        tipos.includes(t)
                          ? "border-primary-btn bg-nav-active text-primary-btn"
                          : "border-surface-border bg-background text-muted-light hover:bg-chip"
                      } ${focusRing}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-muted-light">
                  Zonas / Barrios <span className="text-danger-text">*</span>
                </label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-surface-border bg-background p-2">
                  {zonasAgrupadas.map((g) => (
                    <div key={g.grupo}>
                      <div className="px-1.5 pb-1 pt-2 text-[12.5px] font-semibold uppercase tracking-wide text-muted">
                        {g.grupo}
                      </div>
                      {g.zonas.map((z) => (
                        <label
                          key={z.id}
                          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[15px] text-muted-light hover:bg-chip"
                        >
                          <input
                            type="checkbox"
                            checked={zonas.includes(z.nombre)}
                            onChange={() => toggle(zonas, setZonas, z.nombre)}
                            className="h-3.5 w-3.5 accent-[color:var(--ring)]"
                          />
                          {z.nombre}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-muted-light">Moneda</label>
                  <select name="moneda" className={inputClass} defaultValue="USD">
                    <option value="USD">USD — Dólares</option>
                    <option value="PYG">PYG — Guaraníes</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-muted-light">
                    Presupuesto máximo <span className="text-danger-text">*</span>
                  </label>
                  <Input name="precioMax" type="number" min={0} placeholder="180000" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-muted-light">Observaciones</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  placeholder="Ej.: 2 dorms, balcón y parrilla. Acepta crédito AFD. Pet friendly."
                  className={`${inputClass} h-auto resize-y py-2`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-medium text-muted-light">
                  Temperatura del lead <span className="text-danger-text">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPERATURAS.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setTemperatura(t.value)}
                      className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-left transition-colors ${
                        temperatura === t.value
                          ? "border-primary-btn bg-nav-active"
                          : "border-surface-border bg-background hover:bg-chip"
                      } ${focusRing}`}
                    >
                      <div className="text-[14.5px] font-semibold">{t.label}</div>
                      <div className="text-[12.5px] text-muted">{t.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-ring/25 bg-nav-active/40 px-3.5 py-3 text-[14.5px] leading-relaxed text-muted-light">
                Estos dos campos viven en una tabla aparte con su propia política RLS. La red
                externa ve el pedido, nunca al cliente.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-muted-light">
                    Nombre del cliente <span className="text-[12px] text-muted">privado</span>
                  </label>
                  <Input name="clienteNombre" placeholder="Nombre y apellido" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-medium text-muted-light">
                    Contacto del cliente <span className="text-[12px] text-muted">privado</span>
                  </label>
                  <Input name="clienteContacto" placeholder="+595 9xx xxx xxx" />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-danger-bg px-3 py-2 text-[15px] text-danger-text">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`h-9 rounded-lg border border-surface-border bg-background px-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-chip ${focusRing}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`h-9 rounded-lg bg-primary-btn px-3.5 text-[15px] font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60 ${focusRing}`}
                >
                  {isPending ? "Publicando…" : "Publicar en la bolsa"}
                </button>
              </div>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
