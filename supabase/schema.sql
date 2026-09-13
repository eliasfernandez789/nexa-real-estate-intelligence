-- NEXA — schema inicial (Bolsa de Pedidos)
-- Ejecutar en Supabase SQL Editor (o via `supabase db push` con el CLI conectado al proyecto)

create extension if not exists "pgcrypto";

-- ── Oficinas (tenants de la red) ───────────────────────────────
create table if not exists oficinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

-- ── Agentes ─────────────────────────────────────────────────────
create table if not exists agentes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  nombre text not null,
  iniciales text not null,
  oficina_id uuid not null references oficinas (id) on delete restrict,
  rol text not null default 'agente' check (rol in ('agente', 'admin')),
  created_at timestamptz not null default now()
);

-- ── Cotización (USD/Gs, editable por Admin) ───────────────────
create table if not exists cotizacion (
  id int primary key default 1 check (id = 1),
  guaranies_por_usd numeric not null,
  updated_by uuid references agentes (id),
  updated_at timestamptz not null default now()
);
insert into cotizacion (id, guaranies_por_usd) values (1, 7300)
  on conflict (id) do nothing;

-- ── Pedidos (visibles en toda la red) ──────────────────────────
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique, -- ej. PED-1029
  agente_id uuid not null references agentes (id) on delete cascade,
  temperatura text not null check (temperatura in ('caliente', 'tibio', 'frio')),
  estado text not null default 'Activo' check (estado in ('Activo', 'En Negociación', 'Cerrado', 'Archivado')),
  tipo text not null,
  zonas text[] not null default '{}',
  moneda text not null check (moneda in ('USD', 'PYG')),
  precio_max numeric not null,
  descripcion text not null default '',
  consultas int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Datos privados del cliente (RLS aparte, NO expuestos a la red externa) ──
create table if not exists pedidos_privados (
  pedido_id uuid primary key references pedidos (id) on delete cascade,
  cliente_nombre text not null,
  cliente_contacto text not null
);

-- ── Helper: oficina del usuario autenticado actual ─────────────
create or replace function current_agente_oficina()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select oficina_id from agentes where auth_user_id = auth.uid()
$$;

-- ── RLS ─────────────────────────────────────────────────────────
alter table oficinas enable row level security;
alter table agentes enable row level security;
alter table cotizacion enable row level security;
alter table pedidos enable row level security;
alter table pedidos_privados enable row level security;

-- Cualquier agente autenticado ve la lista de oficinas/agentes (para mostrar nombre/oficina en tarjetas)
create policy "oficinas: lectura autenticada" on oficinas
  for select using (auth.role() = 'authenticated');

create policy "agentes: lectura autenticada" on agentes
  for select using (auth.role() = 'authenticated');

-- Cotización: lectura para todos, edición solo Admin
create policy "cotizacion: lectura autenticada" on cotizacion
  for select using (auth.role() = 'authenticated');

create policy "cotizacion: update solo admin" on cotizacion
  for update using (
    exists (select 1 from agentes where auth_user_id = auth.uid() and rol = 'admin')
  );

-- Pedidos: visibles para TODA la red (interna + externa) — es la bolsa compartida
create policy "pedidos: lectura toda la red" on pedidos
  for select using (auth.role() = 'authenticated');

create policy "pedidos: insert propio" on pedidos
  for insert with check (
    agente_id in (select id from agentes where auth_user_id = auth.uid())
  );

create policy "pedidos: update propio" on pedidos
  for update using (
    agente_id in (select id from agentes where auth_user_id = auth.uid())
  );

-- Pedidos privados: SOLO visibles para agentes de la MISMA oficina que publicó el pedido.
-- La red externa (otras oficinas) nunca ve nombre/contacto del cliente.
create policy "pedidos_privados: solo misma oficina" on pedidos_privados
  for select using (
    exists (
      select 1 from pedidos p
      join agentes a on a.id = p.agente_id
      where p.id = pedidos_privados.pedido_id
        and a.oficina_id = current_agente_oficina()
    )
  );

create policy "pedidos_privados: insert propio" on pedidos_privados
  for insert with check (
    exists (
      select 1 from pedidos p
      join agentes a on a.id = p.agente_id
      where p.id = pedidos_privados.pedido_id
        and a.auth_user_id = auth.uid()
    )
  );
