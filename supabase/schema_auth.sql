-- NEXA — habilita que un usuario recién registrado cree su propia fila de agente
-- Correr en el SQL Editor de Supabase (agrega una policy, no toca datos existentes)

create policy "agentes: self-signup" on agentes
  for insert
  with check (auth_user_id = auth.uid());

-- El listado de oficinas debe verse en el formulario de registro, ANTES de
-- que el usuario tenga sesión — por eso necesita ser legible públicamente
-- (son solo nombres de oficina, no datos sensibles).
create policy "oficinas: lectura publica" on oficinas
  for select using (true);
