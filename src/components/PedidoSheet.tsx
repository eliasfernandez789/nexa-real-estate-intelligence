"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Eye,
  NotePencil,
  ArrowClockwise,
  LockSimple,
  Clock,
} from "@phosphor-icons/react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { TEMPERATURA_LABEL, ESTADO_STYLE, type Pedido } from "@/lib/pedidos";

interface BitacoraEntry {
  id: string;
  tipo: "nota" | "consulta" | "renovacion" | "sistema";
  texto: string;
  created_at: string;
  agentes: { nombre: string } | null;
}

interface ClientePrivado {
  cliente_nombre: string;
  cliente_contacto: string;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

function fechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PedidoSheet({
  pedido,
  onClose,
}: {
  pedido: Pedido | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([]);
  const [privado, setPrivado] = useState<ClientePrivado | null>(null);
  const [consultas, setConsultas] = useState(0);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // Keeps showing the last pedido's content while the sheet plays its
  // close transition, instead of blanking out mid-animation. Adjusted
  // during render (React's recommended pattern) instead of in an effect,
  // to avoid an extra cascading render.
  const [display, setDisplay] = useState<Pedido | null>(null);
  const [prevPedido, setPrevPedido] = useState<Pedido | null>(null);
  if (pedido !== prevPedido) {
    setPrevPedido(pedido);
    if (pedido) {
      setDisplay(pedido);
      setConsultas(pedido.consultas);
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!pedido) return;

    const supabase = createClient();

    async function cargar() {
      await supabase.rpc("registrar_consulta", { p_pedido_id: pedido!.uuid });

      const [{ data: bitacoraData }, privadoRes] = await Promise.all([
        supabase
          .from("bitacora")
          .select("id, tipo, texto, created_at, agentes(nombre)")
          .eq("pedido_id", pedido!.uuid)
          .order("created_at", { ascending: false }),
        pedido!.puedeVerPrivado
          ? supabase
              .from("pedidos_privados")
              .select("cliente_nombre, cliente_contacto")
              .eq("pedido_id", pedido!.uuid)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setBitacora((bitacoraData as unknown as BitacoraEntry[]) ?? []);
      setPrivado(privadoRes.data as ClientePrivado | null);

      const { data: fresh } = await supabase
        .from("pedidos")
        .select("consultas")
        .eq("id", pedido!.uuid)
        .single();
      if (fresh) setConsultas(fresh.consultas);

      setLoading(false);
    }

    cargar();
  }, [pedido]);

  async function agregarNota() {
    if (!nota.trim() || !display) return;
    setIsPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: agente } = await supabase
      .from("agentes")
      .select("id")
      .eq("auth_user_id", user!.id)
      .single();

    await supabase.from("bitacora").insert({
      pedido_id: display.uuid,
      agente_id: agente!.id,
      tipo: "nota",
      texto: nota.trim(),
      visibilidad: "oficina",
    });

    setNota("");
    const { data: bitacoraData } = await supabase
      .from("bitacora")
      .select("id, tipo, texto, created_at, agentes(nombre)")
      .eq("pedido_id", display.uuid)
      .order("created_at", { ascending: false });
    setBitacora((bitacoraData as unknown as BitacoraEntry[]) ?? []);
    setIsPending(false);
  }

  async function renovar() {
    if (!display) return;
    setIsPending(true);
    const supabase = createClient();
    await supabase.rpc("renovar_pedido", { p_pedido_id: display.uuid });
    setIsPending(false);
    router.refresh();
    onClose();
  }

  const tipoIcono = { nota: NotePencil, consulta: Eye, renovacion: ArrowClockwise, sistema: Clock };

  return (
    <Sheet
      open={pedido !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        {display && (
          <>
            <div className="flex items-start justify-between border-b border-surface-border px-5 py-4">
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  {display.id} · {display.agenteOficina}
                </div>
                <h2 className="mt-0.5 truncate text-base font-semibold">
                  {display.tipo.split("·").join(" · ")} en {display.zonas[0]}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-light transition-colors hover:bg-chip ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-medium text-muted-light">
                  {TEMPERATURA_LABEL[display.temperatura]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ESTADO_STYLE[display.estado]}`}
                >
                  {display.estado}
                </span>
                <span className="text-[11px] text-muted">{display.tiempo}</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Criterios de búsqueda
                </div>
                <dl className="grid grid-cols-[100px_1fr] gap-y-1.5 text-[13px]">
                  <dt className="text-muted">Tipo</dt>
                  <dd>{display.tipo.split("·").join(", ")}</dd>
                  <dt className="text-muted">Presupuesto</dt>
                  <dd>
                    <span className="font-mono font-semibold">{display.precioMax}</span>{" "}
                    <span className="text-muted">{display.moneda} MÁX. · {display.aprox}</span>
                  </dd>
                  <dt className="text-muted">Publicado</dt>
                  <dd className="font-mono text-[12px]">{fechaHora(display.createdAt)}</dd>
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  {display.zonas.map((z) => (
                    <span
                      key={z}
                      className="rounded-md bg-chip px-2 py-0.5 text-[11px] font-medium text-muted-light"
                    >
                      {z}
                    </span>
                  ))}
                </div>
                <p className="rounded-lg bg-background px-3 py-2.5 text-[12.5px] leading-relaxed text-muted-light">
                  {display.descripcion}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Agente asignado
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-[11px] font-semibold">
                    {display.agenteIniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{display.agenteNombre}</div>
                    <div className="text-[11px] text-muted">{display.agenteOficina}</div>
                  </div>
                  <a
                    href={display.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-md border border-whatsapp/30 bg-whatsapp/10 px-2.5 py-1.5 text-xs font-semibold text-whatsapp-text transition-colors hover:bg-whatsapp/20 ${focusRing}`}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Interés recibido
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                  <Eye className="h-5 w-5 text-muted" />
                  <div>
                    <div className="font-mono text-2xl font-semibold leading-none">{consultas}</div>
                    <div className="mt-1 text-[11px] text-muted">consultas registradas</div>
                  </div>
                </div>
              </div>

              {display.puedeVerPrivado ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                    Cliente comprador <span className="normal-case text-muted">· privado</span>
                  </div>
                  {privado ? (
                    <dl className="grid grid-cols-[100px_1fr] gap-y-1.5 rounded-lg bg-background px-3 py-2.5 text-[13px]">
                      <dt className="text-muted">Nombre</dt>
                      <dd>{privado.cliente_nombre}</dd>
                      <dt className="text-muted">Contacto</dt>
                      <dd className="font-mono">{privado.cliente_contacto}</dd>
                    </dl>
                  ) : (
                    <div className="rounded-lg bg-background px-3 py-2.5 text-[12.5px] text-muted">
                      {loading ? "Cargando…" : "Sin datos de cliente cargados."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                    Cliente comprador
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-surface-border-hover bg-background px-3 py-2.5 text-[12.5px] leading-relaxed text-muted-light">
                    <LockSimple className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <span>
                      Datos reservados al agente que publicó el pedido y a los administradores.
                      Viven en una tabla aparte con su propia política RLS: esta sesión no los recibe
                      de la API.
                    </span>
                  </div>
                </div>
              )}

              {display.vigenciaDias !== null && (
                <div
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] ${
                    display.vigenciaDias >= 0
                      ? "bg-background text-muted"
                      : "bg-danger-bg text-danger-text"
                  }`}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    {display.vigenciaDias >= 0
                      ? `Vigente · ${display.vigenciaDias} día${display.vigenciaDias === 1 ? "" : "s"} restantes`
                      : `Venció hace ${-display.vigenciaDias} día${-display.vigenciaDias === 1 ? "" : "s"} · renovalo para que siga apareciendo`}
                  </span>
                  {display.esMiOficina && (
                    <button
                      onClick={renovar}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface px-2.5 py-1 text-[11.5px] font-medium transition-colors hover:bg-chip disabled:opacity-60 ${focusRing}`}
                    >
                      <ArrowClockwise className="h-3.5 w-3.5" />
                      Renovar 30 días
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                  Bitácora · {bitacora.length} registro{bitacora.length === 1 ? "" : "s"}
                </div>

                {display.esMiOficina ? (
                  <div className="flex flex-col gap-2 rounded-lg bg-background px-3 py-2.5">
                    <textarea
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Ej.: Se envió opción en Barrio Jara."
                      rows={2}
                      className={`h-auto w-full resize-y rounded-lg border border-surface-border bg-surface px-2.5 py-2 text-[13px] placeholder:text-muted ${focusRing}`}
                    />
                    <button
                      onClick={agregarNota}
                      disabled={isPending || !nota.trim()}
                      className={`self-end rounded-md bg-primary-btn px-3 py-1.5 text-[12.5px] font-medium text-primary-btn-text transition-[filter] hover:brightness-110 disabled:opacity-60 ${focusRing}`}
                    >
                      Agregar nota
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-surface-border-hover bg-background px-3 py-2.5 text-[12.5px] leading-relaxed text-muted-light">
                    <LockSimple className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    Solo la oficina propietaria escribe en la bitácora. Podés leer las notas
                    visibles a toda la red.
                  </div>
                )}

                <div className="flex flex-col">
                  {loading && bitacora.length === 0 && (
                    <p className="py-2 text-[12.5px] text-muted">Cargando…</p>
                  )}
                  {!loading && bitacora.length === 0 && (
                    <p className="py-2 text-[12.5px] text-muted">Todavía no hay notas.</p>
                  )}
                  {bitacora.map((entry) => {
                    const Icon = tipoIcono[entry.tipo];
                    return (
                      <div
                        key={entry.id}
                        className="flex gap-2.5 border-b border-surface-border py-2.5 last:border-none"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-surface-border bg-background">
                          <Icon className="h-3.5 w-3.5 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[12.5px] font-semibold">
                              {entry.agentes?.nombre ?? "—"}
                            </span>
                            <span className="font-mono text-[10.5px] text-muted">
                              {fechaHora(entry.created_at)}
                            </span>
                          </div>
                          <div className="text-[12.5px] leading-relaxed text-muted-light">
                            {entry.texto}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
