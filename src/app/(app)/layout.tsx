import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { FiltersProvider } from "@/lib/filters-context";
import { getPedidos } from "@/lib/queries/pedidos";
import { esUrgente, type NavCounts } from "@/lib/pedidos";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { pedidos } = await getPedidos();

  const counts: NavCounts = {
    red: pedidos.length,
    mios: pedidos.filter((p) => p.esMio).length,
    urgentes: pedidos.filter(esUrgente).length,
  };

  return (
    <FiltersProvider>
      <div className="flex min-h-screen">
        <Sidebar counts={counts} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav counts={counts} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </FiltersProvider>
  );
}
