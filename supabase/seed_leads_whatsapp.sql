-- NEXA — primera tanda de pedidos reales del grupo de WhatsApp (15 leads)
-- Correr en el SQL Editor de Supabase. Es seguro re-ejecutar: usa guards "not exists".

-- ── 1. Zonas que faltaban en el catálogo ───────────────────────────
insert into zonas (slug, nombre, grupo, orden) values
  ('los-laureles',   'Los Laureles',   'asuncion', 13),
  ('tembetary',      'Tembetary',      'asuncion', 14),
  ('hipodromo',      'Hipódromo',      'asuncion', 15),
  ('san-pablo',      'San Pablo',      'asuncion', 16),
  ('pinoza',         'Pinozá',         'asuncion', 17),
  ('herrera',        'Herrera',        'asuncion', 18),
  ('villa-aurelia',  'Villa Aurelia',  'asuncion', 19),
  ('limpio',         'Limpio',         'gran_asuncion', 7),
  ('san-bernardino', 'San Bernardino', 'interior', 1),
  ('ciudad-del-este','Ciudad del Este','interior', 2)
on conflict (slug) do nothing;

-- ── 2. Agentes nuevos (firmantes del grupo, sin cuenta todavía) ────
-- Todos asignados a RE/MAX Royal por defecto (solo Milene la menciona explícitamente).
-- Reasignalos de oficina más adelante si corresponde.
insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Milene Duarte', 'MD', '11111111-1111-4111-8111-111111111111', 'agente', '595995661086'
where not exists (select 1 from agentes where nombre = 'Milene Duarte');

insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Maribel', 'M', '11111111-1111-4111-8111-111111111111', 'agente', '595983420757'
where not exists (select 1 from agentes where nombre = 'Maribel');

insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Dara Rolón', 'DR', '11111111-1111-4111-8111-111111111111', 'agente', '595991518419'
where not exists (select 1 from agentes where nombre = 'Dara Rolón');

insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Alanis Mendoza', 'AM', '11111111-1111-4111-8111-111111111111', 'agente', '595987428055'
where not exists (select 1 from agentes where nombre = 'Alanis Mendoza');

insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Barbara Jiménez', 'BJ', '11111111-1111-4111-8111-111111111111', 'agente', '595981428277'
where not exists (select 1 from agentes where nombre = 'Barbara Jiménez');

insert into agentes (nombre, iniciales, oficina_id, rol, telefono_wa)
select 'Dina Giménez', 'DG', '11111111-1111-4111-8111-111111111111', 'agente', '595981427857'
where not exists (select 1 from agentes where nombre = 'Dina Giménez');

-- ── 3. Pedidos ──────────────────────────────────────────────────────
-- Sin temperatura/observaciones provistas por el grupo -> se carga 'tibio' como neutro,
-- para que los agentes la vayan recalificando desde la app.
-- Los 2 sin presupuesto explícito quedan con precio_max = 1 y "presupuesto abierto" en la descripción.
-- Los 5 sin firma de agente quedan bajo 'Elias Test Fernandez' para reasignar después.

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2001', (select id from agentes where nombre = 'Dina Giménez'), 'tibio', 'Activo', 'Terreno',
  array['Ciudad del Este'], 'USD', 250000,
  'Terreno comercial en CDE, zona Boquerón / Área 1 / Pablo Rojas / Km 4. Entre 1.000 y 1.500 m², frente mínimo 25 m, fondo mínimo 35 m. Para proyecto de edificio de 11 pisos. Requiere ESSAP, ANDE, calle asfaltada y título al día. Presupuesto puede subir si el inmueble lo justifica.',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2001');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2002', (select id from agentes where nombre = 'Alanis Mendoza'), 'tibio', 'Activo', 'Departamento',
  array['Villa Morra'], 'USD', 45000,
  'Compra de departamento monoambiente en pozo (entrega 2029), zona shopping de Asunción.',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2002');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2003', (select id from agentes where nombre = 'Alanis Mendoza'), 'tibio', 'Activo', 'Departamento',
  array[]::text[], 'PYG', 5000000,
  'Alquiler de departamento, mínimo 90 m², 2 habitaciones. Zona dentro de Asunción sin especificar.',
  timestamptz '2026-09-08 11:44'
where not exists (select 1 from pedidos where codigo = 'PED-2003');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2004', (select id from agentes where nombre = 'Dara Rolón'), 'tibio', 'Activo', 'Casa·Dúplex·Departamento',
  array['Los Laureles'], 'PYG', 6000000,
  'Alquiler, 4 habitaciones, Los Laureles o alrededores.',
  timestamptz '2026-09-08 11:44'
where not exists (select 1 from pedidos where codigo = 'PED-2004');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2005', (select id from agentes where nombre = 'Dara Rolón'), 'tibio', 'Activo', 'Tinglado',
  array['Fernando de la Mora'], 'PYG', 7000000,
  'Alquiler de tinglado con depósito, Fernando de la Mora o alrededores.',
  timestamptz '2026-09-08 11:44'
where not exists (select 1 from pedidos where codigo = 'PED-2005');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2006', (select id from agentes where nombre = 'Milene Duarte'), 'tibio', 'Activo', 'Casa',
  array['San Bernardino'], 'USD', 25000,
  'Alquiler anual en Aqua Village, San Bernardino (zona excluyente). Amoblada, 3 a 4 dormitorios aproximadamente. Presupuesto: USD 25.000 por año.',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2006');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2007', (select id from agentes where nombre = 'Maribel'), 'tibio', 'Activo', 'Casa',
  array['Los Laureles','Tembetary','Villa Morra'], 'USD', 250000,
  'Compra de casa en Los Laureles, Tembetary o Villa Morra.',
  timestamptz '2026-09-07 18:01'
where not exists (select 1 from pedidos where codigo = 'PED-2007');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2008', (select id from agentes where nombre = 'Maribel'), 'tibio', 'Activo', 'Casa',
  array['Villa Morra','Tembetary','Los Laureles','Hipódromo','Pinozá','Herrera','Villa Aurelia'], 'PYG', 1,
  'Presupuesto abierto — puede pagar adelantado. 3 dormitorios con área de servicio, aire acondicionado. Zonas: Villa Morra, Mcal. Estigarribia, Tembetary, Los Laureles, Hipódromo, Pinozá, Herrera, Villa Aurelia.',
  timestamptz '2026-09-07 18:02'
where not exists (select 1 from pedidos where codigo = 'PED-2008');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2009', (select id from agentes where nombre = 'Milene Duarte'), 'tibio', 'Activo', 'Casa·Dúplex',
  array['Los Laureles','Villa Morra','San Pablo'], 'PYG', 6000000,
  'Alquiler, 3 habitaciones, aire acondicionado, placares y muebles de cocina.',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2009');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2010', (select id from agentes where nombre = 'Barbara Jiménez'), 'tibio', 'Activo', 'Dúplex',
  array['Villa Morra','Carmelitas','Las Lomas'], 'USD', 350000,
  'Dúplex moderno, ideal a estrenar, 3 dormitorios, ideal con piscina. Zona top de Asunción (no especifica barrio exacto).',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2010');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2011', (select id from agentes where nombre = 'Elias Test Fernandez'), 'tibio', 'Activo', 'Casa',
  array['Hipódromo','Fernando de la Mora','San Pablo'], 'USD', 450000,
  'Compra con fondos propios. Casa moderna, 4 habitaciones. Zonas: Hipódromo, Fernando de la Mora, San Pablo o alrededores. (Lead sin agente identificado en el grupo de WhatsApp — reasignar si corresponde.)',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2011');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2012', (select id from agentes where nombre = 'Elias Test Fernandez'), 'tibio', 'Activo', 'Departamento',
  array['Fernando de la Mora'], 'USD', 1,
  'Presupuesto abierto (acorde al mercado). Departamento de 1 dormitorio terminado, para uso Airbnb. Fernando de la Mora zona norte o sur, cerca de Av. Eusebio Ayala. (Lead sin agente identificado — reasignar si corresponde.)',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2012');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2013', (select id from agentes where nombre = 'Elias Test Fernandez'), 'tibio', 'Activo', 'Casa·Departamento',
  array['Fernando de la Mora','San Lorenzo','Luque'], 'USD', 1300,
  'Alquiler, 2 o 3 dormitorios, totalmente amoblado. Ingreso previsto a fines de septiembre. Zonas: Asunción, Fernando de la Mora, San Lorenzo o Luque. (Lead sin agente identificado — reasignar si corresponde.)',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2013');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2014', (select id from agentes where nombre = 'Elias Test Fernandez'), 'tibio', 'Activo', 'Terreno',
  array['Limpio'], 'PYG', 700000000,
  'Venta de terreno para construir dúplex, 6 lotes juntos, cerca de ruta o empedrado, Limpio. Presupuesto entre Gs. 600.000.000 y Gs. 700.000.000 (cargado con el tope superior). (Lead sin agente identificado — reasignar si corresponde.)',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2014');

insert into pedidos (codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, created_at)
select 'PED-2015', (select id from agentes where nombre = 'Elias Test Fernandez'), 'tibio', 'Activo', 'Casa',
  array['Lambaré','Villa Elisa'], 'PYG', 420000000,
  'Compra de casa, 3 dormitorios. Lambaré o Villa Elisa. Crédito preaprobado en Banco Atlas. (Lead sin agente identificado — reasignar si corresponde.)',
  now()
where not exists (select 1 from pedidos where codigo = 'PED-2015');
