-- NEXA — Bitácora, vigencia (30 días) y conteo de consultas
-- Correr en el SQL Editor de Supabase, en orden, todo junto está bien.

-- ── Vigencia: fecha de la última renovación (si es null, se usa created_at) ──
alter table pedidos add column if not exists renovado_en timestamptz;

-- ── Bitácora ────────────────────────────────────────────────────
create table if not exists bitacora (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete cascade,
  agente_id uuid not null references agentes (id),
  tipo text not null default 'nota' check (tipo in ('nota', 'consulta', 'renovacion', 'sistema')),
  texto text not null,
  visibilidad text not null default 'red' check (visibilidad in ('oficina', 'red')),
  created_at timestamptz not null default now()
);

create index if not exists bitacora_pedido_id_idx on bitacora (pedido_id, created_at desc);

alter table bitacora enable row level security;

-- Notas internas (visibilidad='oficina'): solo la oficina que publicó el pedido las lee.
-- Consultas/renovaciones/sistema (visibilidad='red'): las lee toda la red autenticada.
create policy "bitacora: lectura red" on bitacora
  for select using (visibilidad = 'red' and auth.role() = 'authenticated');

create policy "bitacora: lectura oficina propia" on bitacora
  for select using (
    visibilidad = 'oficina'
    and exists (
      select 1 from pedidos p
      join agentes a on a.id = p.agente_id
      where p.id = bitacora.pedido_id
        and a.oficina_id = current_agente_oficina()
    )
  );

-- Insert directo (notas manuales): un agente solo puede escribir como sí mismo,
-- y una nota privada ('nota') solo si es de la oficina dueña del pedido.
create policy "bitacora: insert propio" on bitacora
  for insert
  with check (
    agente_id in (select id from agentes where auth_user_id = auth.uid())
    and (
      tipo <> 'nota'
      or exists (
        select 1 from pedidos p
        join agentes a on a.id = p.agente_id
        where p.id = bitacora.pedido_id
          and a.oficina_id = current_agente_oficina()
      )
    )
  );

-- ── RPC: registrar_consulta ─────────────────────────────────────
-- Suma 1 a pedidos.consultas y deja rastro en bitácora, máximo una vez
-- por agente y por día (evita que abrir la ficha repetidas veces infle el número).
-- security definer: puede tocar el pedido de OTRO agente (cualquiera de la red
-- puede "consultar" un pedido ajeno), por eso no depende de la policy de update.
create or replace function public.registrar_consulta(p_pedido_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_agente_id uuid;
  v_ya_registrada boolean;
  v_consultas int;
begin
  select id into v_agente_id from agentes where auth_user_id = auth.uid();
  if v_agente_id is null then
    raise exception 'No se encontró tu perfil de agente.';
  end if;

  select exists (
    select 1 from bitacora
    where pedido_id = p_pedido_id
      and agente_id = v_agente_id
      and tipo = 'consulta'
      and created_at >= date_trunc('day', now())
  ) into v_ya_registrada;

  if not v_ya_registrada then
    update pedidos set consultas = consultas + 1
    where id = p_pedido_id
    returning consultas into v_consultas;

    insert into bitacora (pedido_id, agente_id, tipo, texto, visibilidad)
    values (p_pedido_id, v_agente_id, 'consulta', 'Abrió la ficha del pedido.', 'red');
  else
    select consultas into v_consultas from pedidos where id = p_pedido_id;
  end if;

  return json_build_object('consultas', v_consultas, 'nueva', not v_ya_registrada);
end;
$$;

grant execute on function public.registrar_consulta(uuid) to authenticated;

-- ── RPC: renovar_pedido ─────────────────────────────────────────
-- Solo el dueño del pedido puede renovarlo (resetea la vigencia de 30 días).
create or replace function public.renovar_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_agente_id uuid;
begin
  select id into v_agente_id from agentes where auth_user_id = auth.uid();

  update pedidos set renovado_en = now()
  where id = p_pedido_id and agente_id = v_agente_id;

  if not found then
    raise exception 'No tenés permiso para renovar este pedido.';
  end if;

  insert into bitacora (pedido_id, agente_id, tipo, texto, visibilidad)
  values (p_pedido_id, v_agente_id, 'renovacion', 'Pedido renovado por 30 días.', 'red');
end;
$$;

grant execute on function public.renovar_pedido(uuid) to authenticated;
