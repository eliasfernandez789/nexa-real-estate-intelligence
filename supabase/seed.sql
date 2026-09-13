-- NEXA — datos demo (los mismos 12 pedidos que ya estaban hardcodeados en el frontend)
-- Correr en el SQL Editor de Supabase DESPUÉS de schema.sql

-- ── Oficinas ────────────────────────────────────────────────────
insert into oficinas (id, nombre) values
  ('11111111-1111-4111-8111-111111111111', 'RE/MAX Royal'),
  ('22222222-2222-4222-8222-222222222222', 'RE/MAX Élite'),
  ('33333333-3333-4333-8333-333333333333', 'RE/MAX Pro'),
  ('44444444-4444-4444-8444-444444444444', 'RE/MAX Capital')
on conflict (id) do nothing;

-- ── Agentes (sin auth_user_id todavía — se vincula cuando cada uno se registre) ──
insert into agentes (id, nombre, iniciales, oficina_id, rol) values
  ('a1000000-0000-4000-8000-000000000001', 'Carla Duarte',    'CD', '11111111-1111-4111-8111-111111111111', 'admin'),
  ('a1000000-0000-4000-8000-000000000002', 'Lucía Benítez',   'LB', '11111111-1111-4111-8111-111111111111', 'agente'),
  ('a1000000-0000-4000-8000-000000000003', 'Rodrigo Ayala',   'RA', '11111111-1111-4111-8111-111111111111', 'agente'),
  ('a1000000-0000-4000-8000-000000000004', 'Mateo Ovelar',    'MO', '11111111-1111-4111-8111-111111111111', 'agente'),
  ('a1000000-0000-4000-8000-000000000005', 'Diego Villalba',  'DV', '22222222-2222-4222-8222-222222222222', 'agente'),
  ('a1000000-0000-4000-8000-000000000006', 'Nadia Franco',    'NF', '33333333-3333-4333-8333-333333333333', 'agente'),
  ('a1000000-0000-4000-8000-000000000007', 'Sofía Ramírez',   'SR', '44444444-4444-4444-8444-444444444444', 'agente')
on conflict (id) do nothing;

-- ── Pedidos ─────────────────────────────────────────────────────
insert into pedidos (id, codigo, agente_id, temperatura, estado, tipo, zonas, moneda, precio_max, descripcion, consultas, created_at) values
  ('b1000000-0000-4000-8000-000000000001', 'PED-1029', 'a1000000-0000-4000-8000-000000000001', 'caliente', 'Activo', 'Departamento·Casa',
    array['Villa Morra','Recoleta','Las Lomas','Carmelitas'], 'USD', 410000,
    'Cliente premium referido por escribanía. 4 dormitorios, dependencia de servicio, piscina, mínimo 3 cocheras. Compra al contado, sin financiación.',
    4, now() - interval '4 hours'),

  ('b1000000-0000-4000-8000-000000000002', 'PED-1042', 'a1000000-0000-4000-8000-000000000002', 'caliente', 'Activo', 'Departamento',
    array['Villa Morra','Carmelitas','Recoleta'], 'USD', 145000,
    'Pareja joven, 2 dormitorios en suite con balcón y parrilla propia. Edificio con piscina y gimnasio. Necesita 1 cochera fija. Acepta crédito AFD, ya tiene precalificación del banco.',
    14, now() - interval '1 day'),

  ('b1000000-0000-4000-8000-000000000003', 'PED-1038', 'a1000000-0000-4000-8000-000000000003', 'caliente', 'Activo', 'Departamento',
    array['Barrio Jara','Ycuá Satí','Manorá'], 'USD', 95000,
    'Primer inmueble. Monoambiente o 1 dormitorio, hasta 55 m². Prioridad: crédito AFD y cuota mensual menor a 2.900.000 Gs. No necesita cochera.',
    19, now() - interval '2 days'),

  ('b1000000-0000-4000-8000-000000000004', 'PED-1041', 'a1000000-0000-4000-8000-000000000003', 'caliente', 'En Negociación', 'Casa·Dúplex',
    array['Las Lomas','Mburucuyá','Trinidad'], 'USD', 230000,
    'Familia con dos hijos y dos perros grandes: pet friendly excluyente. Mínimo 3 dormitorios, patio con espacio verde real, quincho. Prefiere barrio cerrado con seguridad 24h.',
    23, now() - interval '3 days'),

  ('b1000000-0000-4000-8000-000000000005', 'PED-1035', 'a1000000-0000-4000-8000-000000000002', 'caliente', 'Activo', 'Departamento·Dúplex',
    array['Recoleta','Trinidad','Las Lomas'], 'USD', 275000,
    'Ejecutivo que se muda desde Ciudad del Este. Mínimo 3 dormitorios, 2 cocheras, amenities completos. Valora seguridad y proximidad a colegio bilingüe.',
    16, now() - interval '4 days'),

  ('b1000000-0000-4000-8000-000000000006', 'PED-1032', 'a1000000-0000-4000-8000-000000000004', 'caliente', 'Activo', 'Casa·Dúplex',
    array['Luque','Mariano Roque Alonso','Villa Elisa'], 'PYG', 490000000,
    'Docente con crédito AFD aprobado por 450 millones. 3 dormitorios, cochera techada. Zona con colectivo cercano. Pet friendly, tiene dos gatos.',
    12, now() - interval '5 days'),

  ('b1000000-0000-4000-8000-000000000007', 'PED-1039', 'a1000000-0000-4000-8000-000000000004', 'tibio', 'Activo', 'Local Comercial·Oficina',
    array['Villa Morra','Centro'], 'USD', 320000,
    'Clínica odontológica en expansión. Mínimo 180 m², planta baja o primer piso con ascensor, estacionamiento para 4 vehículos. Habilitación municipal para uso comercial.',
    7, now() - interval '12 days'),

  ('b1000000-0000-4000-8000-000000000008', 'PED-1030', 'a1000000-0000-4000-8000-000000000005', 'tibio', 'Activo', 'Local Comercial',
    array['Lambaré','Fernando de la Mora','Villa Elisa'], 'PYG', 1200000000,
    'Cadena de farmacias abriendo sucursal. Esquina o sobre avenida, frente mínimo 8 m, 120 m² de salón. Estacionamiento propio aunque sea para 3 autos.',
    8, now() - interval '14 days'),

  ('b1000000-0000-4000-8000-000000000009', 'PED-1037', 'a1000000-0000-4000-8000-000000000005', 'tibio', 'Activo', 'Galpón',
    array['Luque','San Lorenzo','Mariano Roque Alonso'], 'USD', 480000,
    'Distribuidora de alimentos. 1.200 m² cubiertos, altura libre mínima 8 m, acceso para camión con acoplado y patio de maniobras. Energía trifásica.',
    5, now() - interval '14 days'),

  ('b1000000-0000-4000-8000-00000000000a', 'PED-1033', 'a1000000-0000-4000-8000-000000000006', 'tibio', 'En Negociación', 'Oficina',
    array['Villa Morra','Carmelitas'], 'USD', 165000,
    'Estudio jurídico de 6 personas. Entre 90 y 120 m², sala de reuniones, 2 cocheras. Prefiere torre con recepción y generador.',
    11, now() - interval '28 days'),

  ('b1000000-0000-4000-8000-00000000000b', 'PED-1036', 'a1000000-0000-4000-8000-000000000007', 'tibio', 'Activo', 'Casa',
    array['Fernando de la Mora','Lambaré','San Lorenzo'], 'PYG', 620000000,
    'Matrimonio mayor. Casa de una sola planta, sin escaleras, 3 dormitorios, cerca de un centro médico. Patio chico está bien, no quieren mantenimiento.',
    9, now() - interval '28 days'),

  ('b1000000-0000-4000-8000-00000000000c', 'PED-1040', 'a1000000-0000-4000-8000-000000000001', 'frio', 'Activo', 'Terreno',
    array['Luque','Mariano Roque Alonso','Villa Elisa'], 'PYG', 850000000,
    'Inversor. Terreno de 800 m² o más para desarrollo futuro. No le corre el tiempo, prioriza precio por metro y título limpio. Zona con asfalto y desagüe.',
    3, now() - interval '42 days')
on conflict (id) do nothing;

-- ── Datos privados del cliente (solo visibles para la oficina que publicó) ──
insert into pedidos_privados (pedido_id, cliente_nombre, cliente_contacto) values
  ('b1000000-0000-4000-8000-000000000001', 'Ricardo Almada Cañete',              '+595 981 223 456'),
  ('b1000000-0000-4000-8000-000000000002', 'Valeria Ortigoza',                   '+595 972 810 234'),
  ('b1000000-0000-4000-8000-000000000003', 'Braulio Cabañas',                    '+595 994 102 887'),
  ('b1000000-0000-4000-8000-000000000004', 'Familia Insfrán-Guggiari',           '+595 981 675 320'),
  ('b1000000-0000-4000-8000-000000000005', 'Gustavo Riquelme',                   '+595 985 447 190'),
  ('b1000000-0000-4000-8000-000000000006', 'Norma Encina',                       '+595 973 289 651'),
  ('b1000000-0000-4000-8000-000000000007', 'Clínica Dental Bianchi (Dra. Bianchi)', '+595 982 556 004'),
  ('b1000000-0000-4000-8000-000000000008', 'Farmacias del Sol S.A. (Marcelo Gauto)', '+595 991 320 778'),
  ('b1000000-0000-4000-8000-000000000009', 'Distribuidora Ybytú',                '+595 984 667 213'),
  ('b1000000-0000-4000-8000-00000000000a', 'Estudio Jurídico Paredes & Asoc.',   '+595 981 908 344'),
  ('b1000000-0000-4000-8000-00000000000b', 'Familia Bogado',                     '+595 976 213 590'),
  ('b1000000-0000-4000-8000-00000000000c', 'Inversiones del Paraná S.A. (Hugo Servín)', '+595 983 471 026')
on conflict (pedido_id) do nothing;
