"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-[14px] font-medium text-muted-light transition-colors hover:bg-chip ${focusRing}`}
    >
      <SignOut className="h-4 w-4 text-muted" />
      Cerrar sesión
    </button>
  );
}
