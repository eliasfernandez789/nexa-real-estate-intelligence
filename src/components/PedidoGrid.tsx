"use client";

import { PedidoCard } from "@/components/PedidoCard";
import { PedidoSheet } from "@/components/PedidoSheet";
import type { Pedido } from "@/lib/pedidos";

export function PedidoGrid({
  pedidos,
  abierto,
  onOpen,
  onClose,
  focoIndex,
}: {
  pedidos: Pedido[];
  abierto: Pedido | null;
  onOpen: (pedido: Pedido) => void;
  onClose: () => void;
  focoIndex?: number;
}) {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-16 text-center">
        <p className="text-sm font-medium text-muted-light">No hay pedidos que coincidan con los filtros.</p>
        <p className="mt-1 text-xs text-muted">Probá ajustar la búsqueda, la zona o el estado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-2 xl:grid-cols-3">
        {pedidos.map((pedido, index) => (
          <PedidoCard
            key={pedido.uuid}
            pedido={pedido}
            index={index}
            enfocado={index === focoIndex}
            onOpen={onOpen}
          />
        ))}
      </div>
      <PedidoSheet pedido={abierto} onClose={onClose} />
    </>
  );
}
