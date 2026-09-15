import { getPerfilActual } from "@/lib/queries/perfil";
import { ConfiguracionView } from "@/components/ConfiguracionView";

export default async function ConfiguracionPage() {
  const perfil = await getPerfilActual();

  if (!perfil) {
    return (
      <div className="mx-auto max-w-xl px-6 pt-10 text-center text-[13px] text-muted">
        No se encontró tu perfil de agente. Contactá a un administrador.
      </div>
    );
  }

  return <ConfiguracionView perfil={perfil} />;
}
