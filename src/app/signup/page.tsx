"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

const inputClass =
  "h-10 w-full rounded-lg border border-surface-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function SignupPage() {
  const router = useRouter();
  const [oficinas, setOficinas] = useState<{ id: string; nombre: string }[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oficinaId, setOficinaId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("oficinas")
      .select("id, nombre")
      .eq("activa", true)
      .order("nombre")
      .then(({ data }) => {
        if (data) {
          setOficinas(data);
          if (data[0]) setOficinaId(data[0].id);
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError(
        "Revisá tu email para confirmar la cuenta antes de iniciar sesión.",
      );
      setLoading(false);
      return;
    }

    const { error: agenteError } = await supabase.from("agentes").insert({
      auth_user_id: userId,
      nombre,
      iniciales: iniciales(nombre) || "??",
      oficina_id: oficinaId,
    });

    if (agenteError) {
      setError(`Cuenta creada, pero falló el perfil de agente: ${agenteError.message}`);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
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

        <h1 className="text-lg font-semibold">Crear cuenta</h1>
        <p className="mt-1 text-[15px] text-muted">
          Sumate a la bolsa de pedidos de tu oficina.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="text-[15px] font-medium text-muted-light">
              Nombre y apellido
            </label>
            <Input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="h-10"
              placeholder="Ej: Carla Duarte"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="oficina" className="text-[15px] font-medium text-muted-light">
              Oficina
            </label>
            <select
              id="oficina"
              required
              value={oficinaId}
              onChange={(e) => setOficinaId(e.target.value)}
              className={inputClass}
            >
              {oficinas.length === 0 && <option value="">Cargando…</option>}
              {oficinas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>

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
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-[15px] text-danger-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !oficinaId}
            className="h-10 rounded-lg bg-primary-btn text-sm font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-primary-btn hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
