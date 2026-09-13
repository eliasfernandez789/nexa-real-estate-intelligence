import { PedidoBrowser } from "@/components/PedidoBrowser";
import { getPedidos } from "@/lib/queries/pedidos";
import { getZonasAgrupadas } from "@/lib/queries/zonas";

export default async function Home() {
  const [{ pedidos, tc, tcUpdatedAt, agenteActual }, zonasAgrupadas] = await Promise.all([
    getPedidos(),
    getZonasAgrupadas(),
  ]);

  return (
    <PedidoBrowser
      pedidos={pedidos}
      zonasAgrupadas={zonasAgrupadas}
      tc={tc}
      tcUpdatedAt={tcUpdatedAt}
      esAdmin={agenteActual?.rol === "admin"}
    />
  );
}
