import { SidebarNav } from "@/components/SidebarNav";
import type { NavCounts } from "@/lib/pedidos";

export function Sidebar({ counts }: { counts: NavCounts }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-surface-border bg-surface md:block">
      <SidebarNav counts={counts} />
    </aside>
  );
}
