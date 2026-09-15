"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fire, SquaresFour, ListChecks, SlidersHorizontal, CaretUpDown } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { SignOutButton } from "@/components/SignOutButton";
import { useFilters, type Vista } from "@/lib/filters-context";
import type { NavCounts } from "@/lib/pedidos";

const NAV: { label: string; vista: Vista; icon: Icon }[] = [
  { label: "Toda la Red", vista: "red", icon: SquaresFour },
  { label: "Mis Pedidos", vista: "mios", icon: ListChecks },
  { label: "Urgentes", vista: "urgentes", icon: Fire },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function SidebarNav({ counts }: { counts: NavCounts }) {
  const { vista, setVista } = useFilters();
  const pathname = usePathname();
  const enConfiguracion = pathname === "/configuracion";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b border-surface-border px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary-btn text-[10px] font-bold text-primary-btn-text">
            N
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold tracking-tight">NEXA</span>
              <span className="rounded border border-surface-border bg-background px-1 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-muted">
                PY
              </span>
            </div>
            <span className="mt-0.5 text-[9.5px] text-muted">Real Estate Intelligence</span>
          </div>
        </div>
        <CaretUpDown className="h-3.5 w-3.5 text-muted" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        <div className="px-2 pb-1 pt-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted">
          Demand Network
        </div>
        {NAV.map(({ label, vista: v, icon: Icon }) => {
          const active = !enConfiguracion && vista === v;
          const count = v === "red" ? counts.red : v === "mios" ? counts.mios : counts.urgentes;
          return (
            <Link
              key={label}
              href="/"
              onClick={() => setVista(v)}
              className={`flex items-center justify-between rounded px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                active ? "bg-nav-active text-foreground border border-surface-border" : "text-muted-light hover:bg-chip"
              } ${focusRing}`}
            >
              <span className="flex items-center gap-2">
                <Icon
                  weight={active ? "fill" : "regular"}
                  className={`h-4 w-4 ${v === "urgentes" ? "text-dot-caliente" : active ? "text-primary-btn" : "text-muted"}`}
                />
                {label}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${
                  active ? "bg-surface border border-surface-border text-foreground" : "text-muted"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}

        <div className="px-2 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-wider text-muted">
          Sistema
        </div>
        <Link
          href="/configuracion"
          className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
            enConfiguracion ? "bg-nav-active text-foreground border border-surface-border" : "text-muted-light hover:bg-chip"
          } ${focusRing}`}
        >
          <SlidersHorizontal
            weight={enConfiguracion ? "fill" : "regular"}
            className={`h-4 w-4 ${enConfiguracion ? "text-primary-btn" : "text-muted"}`}
          />
          Configuración
        </Link>
        <SignOutButton />
      </nav>
    </div>
  );
}
