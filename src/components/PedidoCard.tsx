import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { Pedido, TEMPERATURA_LABEL, ESTADO_STYLE } from "@/lib/pedidos";

const DOT_CLASS: Record<Pedido["temperatura"], string> = {
  caliente: "bg-dot-caliente",
  tibio: "bg-dot-tibio",
  frio: "bg-dot-frio",
};

const TEXT_CLASS: Record<Pedido["temperatura"], string> = {
  caliente: "text-dot-caliente",
  tibio: "text-dot-tibio",
  frio: "text-dot-frio",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function PedidoCard({
  pedido,
  index = 0,
  enfocado = false,
  onOpen,
}: {
  pedido: Pedido;
  index?: number;
  enfocado?: boolean;
  onOpen?: (pedido: Pedido) => void;
}) {
  return (
    <article
      data-pedido-card
      className={`group flex h-full flex-col justify-between rounded-lg border bg-surface p-3.5 opacity-0 shadow-[0_1px_3px_rgba(11,13,18,0.08),0_1px_2px_rgba(11,13,18,0.04)] transition-[transform,box-shadow,border-color] duration-200 [animation-fill-mode:forwards] [animation:card-in_280ms_cubic-bezier(0.16,1,0.3,1)] hover:border-surface-border-hover hover:shadow-md ${
        enfocado ? "border-ring ring-2 ring-ring/40" : "border-surface-border"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <button
        onClick={() => onOpen?.(pedido)}
        className={`flex flex-1 flex-col gap-2.5 text-left rounded-md ${focusRing}`}
      >
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 font-medium ${TEXT_CLASS[pedido.temperatura]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[pedido.temperatura]}`} />
              {TEMPERATURA_LABEL[pedido.temperatura]}
            </span>
            <span className="text-muted">·</span>
            <span className={`rounded px-1.5 py-0.5 font-medium ${ESTADO_STYLE[pedido.estado]}`}>
              {pedido.estado}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-muted">
            <span>{pedido.tiempo}</span>
            <span className="font-semibold text-foreground">{pedido.id}</span>
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold leading-tight tracking-[-0.1px] text-foreground group-hover:text-primary-btn transition-colors">
            {pedido.tipo.split("·").join(" · ")}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-light">{pedido.zonas.join(", ")}</p>
        </div>

        <div className="flex items-baseline justify-between rounded-md border border-surface-border bg-background px-2.5 py-2">
          <div>
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">
              Presupuesto máx.
            </span>
            <span className="font-mono text-[15px] font-bold tracking-tight text-foreground">
              {pedido.precioMax}
            </span>
            <span className="ml-1 text-[10px] font-medium text-muted">{pedido.moneda}</span>
          </div>
          <span className="font-mono text-[11px] font-medium text-accent-blue">{pedido.aprox}</span>
        </div>

        <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-light">
          {pedido.descripcion}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <ChatCircle weight="regular" className="h-3.5 w-3.5 shrink-0 text-muted" />
          <span className="font-mono text-[11px] font-medium text-muted-light">{pedido.consultas}</span>
          <span className="truncate text-[11px]">
            <span className="font-medium text-foreground">{pedido.agenteNombre}</span>
            <span className="text-muted"> · {pedido.agenteOficina}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onOpen?.(pedido)}
            className={`h-6 rounded-md border border-surface-border bg-background px-2 text-[11px] font-medium text-foreground transition-colors hover:bg-chip ${focusRing}`}
          >
            Ficha
          </button>
          <a
            href={`${pedido.whatsapp}?text=${encodeURIComponent(
              `Hola ${pedido.agenteNombre.split(" ")[0]}, te escribo por el pedido ${pedido.id} de la Bolsa: ${pedido.tipo}${
                pedido.zonas.length > 0 ? ` en ${pedido.zonas.join(", ")}` : ""
              }.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className={`h-6 rounded-md border border-whatsapp/30 bg-whatsapp/10 px-2 text-[11px] font-medium text-whatsapp-text transition-colors hover:bg-whatsapp/20 ${focusRing}`}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
