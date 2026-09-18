-- NEXA — permite que un agente elimine su propio pedido.
-- No existía ninguna política de DELETE para "pedidos" (solo select/insert/
-- update). Misma condición que ya usa "pedidos: update propio" — el dueño
-- del pedido, nadie más (sin excepción para admin, por simetría con update).
--
-- pedidos_privados y bitacora tienen "on delete cascade" hacia pedidos, así
-- que se borran solos junto con el pedido — no hace falta borrarlos a mano.
--
-- Correr en el SQL Editor de Supabase.

create policy "pedidos: delete propio" on pedidos
  for delete
  using (
    agente_id in (select id from agentes where auth_user_id = auth.uid())
  );
