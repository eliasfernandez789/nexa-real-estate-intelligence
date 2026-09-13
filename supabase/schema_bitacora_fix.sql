-- NEXA — fix: renovar_pedido debía permitir a cualquier agente de la MISMA OFICINA
-- (no solo al agente exacto que publicó el pedido), igual que ya hace la policy de bitácora.
create or replace function public.renovar_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_agente_id uuid;
  v_mi_oficina uuid;
begin
  select id, oficina_id into v_agente_id, v_mi_oficina
  from agentes where auth_user_id = auth.uid();

  update pedidos p set renovado_en = now()
  where p.id = p_pedido_id
    and exists (
      select 1 from agentes a
      where a.id = p.agente_id and a.oficina_id = v_mi_oficina
    );

  if not found then
    raise exception 'No tenés permiso para renovar este pedido.';
  end if;

  insert into bitacora (pedido_id, agente_id, tipo, texto, visibilidad)
  values (p_pedido_id, v_agente_id, 'renovacion', 'Pedido renovado por 30 días.', 'red');
end;
$$;
