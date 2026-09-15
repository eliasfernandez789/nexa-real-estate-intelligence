"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/client";
import { actualizarTelefono } from "@/lib/actions/perfil";
import type { Perfil } from "@/lib/queries/perfil";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sectionLabel = "text-[10.5px] font-semibold uppercase tracking-wide text-muted";
const inputClass = `h-9 w-full rounded-lg border border-surface-border bg-background px-3 text-sm text-foreground placeholder:text-muted ${focusRing}`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={sectionLabel}>{title}</div>
      <div className="flex flex-col gap-3 rounded-lg bg-surface px-4 py-4">{children}</div>
    </div>
  );
}

export function ConfiguracionView({ perfil }: { perfil: Perfil }) {
  const router = useRouter();

  const [telefono, setTelefono] = useState(perfil.telefonoWa ?? "");
  const [telefonoPending, setTelefonoPending] = useState(false);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);
  const [telefonoOk, setTelefonoOk] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordOk, setPasswordOk] = useState(false);

  async function guardarTelefono(formData: FormData) {
    setTelefonoError(null);
    setTelefonoOk(false);
    setTelefonoPending(true);
    const result = await actualizarTelefono(formData);
    setTelefonoPending(false);
    if (result.ok) {
      setTelefonoOk(true);
      router.refresh();
    } else {
      setTelefonoError(result.error ?? "Ocurrió un error.");
    }
  }

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordOk(false);

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordPending(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordOk(true);
      setPassword("");
      setPasswordConfirm("");
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 pb-12 pt-6 sm:px-8 xl:px-10">
      <h1 className="text-2xl font-semibold tracking-[-0.5px]">Configuración</h1>

      <Section title="Perfil">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-border bg-background text-[13px] font-semibold">
            {perfil.iniciales}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium">{perfil.nombre}</div>
            <div className="text-[12px] text-muted">{perfil.oficinaNombre}</div>
          </div>
          <Badge variant={perfil.rol === "admin" ? "default" : "secondary"}>
            {perfil.rol === "admin" ? "Admin" : "Agente"}
          </Badge>
        </div>
        <div className="border-t border-surface-border pt-3 text-[13px]">
          <span className="text-muted">Email · </span>
          <span className="font-mono">{perfil.email ?? "—"}</span>
        </div>
      </Section>

      <Section title="Contacto de WhatsApp">
        <p className="text-[12.5px] leading-relaxed text-muted-light">
          Este número es el que reciben los demás agentes al tocar &quot;WhatsApp&quot; en tus
          pedidos publicados.
        </p>
        <form action={guardarTelefono} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefonoWa" className="text-[13px] font-medium text-muted-light">
              Número con código de país
            </label>
            <Input
              id="telefonoWa"
              name="telefonoWa"
              value={telefono}
              onChange={(e) => {
                setTelefono(e.target.value);
                setTelefonoOk(false);
              }}
              placeholder="595981234567"
              className="h-9"
            />
          </div>
          {telefonoError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-[13px] text-danger-text">
              {telefonoError}
            </p>
          )}
          {telefonoOk && (
            <p className="flex items-center gap-1.5 text-[12.5px] text-success-text">
              <CheckCircle weight="fill" className="h-4 w-4" />
              Número actualizado.
            </p>
          )}
          <button
            type="submit"
            disabled={telefonoPending}
            className={`self-start rounded-md bg-primary-btn px-3.5 py-1.5 text-[12.5px] font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60 ${focusRing}`}
          >
            {telefonoPending ? "Guardando…" : "Guardar número"}
          </button>
        </form>
      </Section>

      <Section title="Seguridad">
        <form onSubmit={cambiarPassword} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-muted-light">Nueva contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordOk(false);
                }}
                placeholder="Mínimo 6 caracteres"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-muted-light">Confirmar</label>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  setPasswordOk(false);
                }}
                placeholder="Repetí la contraseña"
                className={inputClass}
              />
            </div>
          </div>
          {passwordError && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-[13px] text-danger-text">
              {passwordError}
            </p>
          )}
          {passwordOk && (
            <p className="flex items-center gap-1.5 text-[12.5px] text-success-text">
              <CheckCircle weight="fill" className="h-4 w-4" />
              Contraseña actualizada.
            </p>
          )}
          <button
            type="submit"
            disabled={passwordPending || !password}
            className={`self-start rounded-md bg-primary-btn px-3.5 py-1.5 text-[12.5px] font-medium text-primary-btn-text transition-[filter] duration-150 hover:brightness-110 disabled:opacity-60 ${focusRing}`}
          >
            {passwordPending ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>

        <div className="border-t border-surface-border pt-3">
          <SignOutButton />
        </div>
      </Section>
    </div>
  );
}
