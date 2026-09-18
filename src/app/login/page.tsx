"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-btn text-sm font-semibold text-primary-btn-text">
            N
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">NEXA</div>
            <div className="text-[12.5px] text-muted">Real Estate Intelligence</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold">Iniciar sesión</h1>
        <p className="mt-1 text-[15px] text-muted">
          Accedé a la bolsa de pedidos de tu red.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[15px] font-medium text-muted-light">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              placeholder="agente@inmobiliaria.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[15px] font-medium text-muted-light">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-[15px] text-danger-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-primary-btn text-sm font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-muted">
          ¿No tenés cuenta todavía?{" "}
          <Link href="/signup" className="font-medium text-primary-btn hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
