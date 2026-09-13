-- NEXA — fix CRÍTICO: la política "agentes: self-signup" solo validaba
-- auth_user_id = auth.uid(), pero no restringía el valor de "rol" que el
-- cliente podía mandar en el insert. Cualquiera que llamara a la API REST
-- directamente (sin pasar por la UI) podía mandar rol:"admin" en el insert
-- y quedar admin de verdad, con acceso a los datos privados de TODAS las
-- oficinas y permiso para editar la cotización.
--
-- Verificado en vivo (2026-09-13) contra la base real: una cuenta de prueba
-- mandó rol:"admin" en el insert y quedó guardada como admin. Confirmado
-- también que NO existe política de UPDATE para "agentes", así que una vez
-- creado el registro el rol no se puede cambiar por API — el único vector
-- era este insert inicial.

drop policy if exists "agentes: self-signup" on agentes;

create policy "agentes: self-signup" on agentes
  for insert with check (
    auth_user_id = auth.uid() and rol = 'agente'
  );
