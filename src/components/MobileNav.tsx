"use client";

import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { SidebarNav } from "@/components/SidebarNav";
import type { NavCounts } from "@/lib/pedidos";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function MobileNav({ counts }: { counts: NavCounts }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-surface-border bg-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-btn text-sm font-semibold text-primary-btn-text">
            N
          </div>
          <div className="text-sm font-semibold tracking-tight">NEXA</div>
        </div>
        <button
          aria-label="Abrir navegación"
          onClick={() => setOpen(true)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-foreground transition-colors hover:bg-chip ${focusRing}`}
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Cerrar navegación"
            className="absolute inset-0 bg-black/30 opacity-100 transition-opacity duration-200"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[260px] translate-x-0 bg-surface shadow-xl transition-transform duration-200">
            <div className="flex justify-end p-3">
              <button
                aria-label="Cerrar navegación"
                onClick={() => setOpen(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted-light transition-colors hover:bg-chip ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav counts={counts} />
          </div>
        </div>
      )}
    </div>
  );
}
