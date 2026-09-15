-- NEXA — permite que un agente edite su propio teléfono de WhatsApp desde
-- Configuración (antes solo se podía cargar a mano por SQL, ver
-- schema_telefono.sql — cualquier agente nuevo registrado por /signup queda
-- con telefono_wa NULL para siempre y su botón de WhatsApp en las tarjetas
-- nunca funciona).
--
-- Antes de esta fase NO existía ninguna política de UPDATE para "agentes"
-- (ver schema_fix_signup_rol.sql) — deliberado, para que "rol" no pudiera
-- cambiarse por API una vez creada la cuenta.
--
-- Esta policy habilita UPDATE solo sobre la fila propia
-- (auth_user_id = auth.uid()). Para que eso NO reabra el vector de escalar
-- a rol='admin' (o cambiar de oficina) mandando esos campos en el mismo
-- UPDATE vía API REST directa, se restringe ADEMÁS a nivel de columna:
-- "authenticated" pierde el UPDATE genérico sobre toda la tabla y gana
-- únicamente sobre telefono_wa. Postgres rechaza cualquier UPDATE que
-- intente tocar otra columna en el chequeo de privilegios, antes de
-- siquiera evaluar la policy — es una segunda barrera independiente de la
-- policy misma.
--
-- Correr en el SQL Editor de Supabase.

create policy "agentes: autoedicion de telefono" on agentes
  for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

revoke update on agentes from authenticated;
grant update (telefono_wa) on agentes to authenticated;
