-- NEXA — los datos privados del cliente (nombre/contacto) dejan de ser visibles
-- a "toda mi oficina" y pasan a ser visibles SOLO para: (a) el agente dueño del
-- pedido, y (b) cualquier agente con rol = 'admin'. La oficina queda como un
-- dato puramente descriptivo, sin ningún privilegio de acceso asociado.

drop policy if exists "pedidos_privados: solo misma oficina" on pedidos_privados;

create policy "pedidos_privados: dueño o admin" on pedidos_privados
  for select using (
    exists (
      select 1 from pedidos p
      where p.id = pedidos_privados.pedido_id
        and p.agente_id in (select id from agentes where auth_user_id = auth.uid())
    )
    or exists (
      select 1 from agentes where auth_user_id = auth.uid() and rol = 'admin'
    )
  );
