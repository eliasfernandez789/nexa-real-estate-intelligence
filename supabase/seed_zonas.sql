-- NEXA — zonas (coincide con el filtro de zonas del diseño original)
-- Correr en el SQL Editor de Supabase, en cualquier momento (no depende de seed.sql)

insert into zonas (slug, nombre, grupo, orden) values
  -- Asunción
  ('barrio-jara',    'Barrio Jara',    'asuncion', 1),
  ('villa-morra',    'Villa Morra',    'asuncion', 2),
  ('recoleta',       'Recoleta',       'asuncion', 3),
  ('las-lomas',      'Las Lomas',      'asuncion', 4),
  ('carmelitas',     'Carmelitas',     'asuncion', 5),
  ('ycua-sati',      'Ycuá Satí',      'asuncion', 6),
  ('mburucuya',      'Mburucuyá',      'asuncion', 7),
  ('manora',         'Manorá',         'asuncion', 8),
  ('centro',         'Centro',         'asuncion', 9),
  ('san-cristobal',  'San Cristóbal',  'asuncion', 10),
  ('trinidad',       'Trinidad',       'asuncion', 11),
  ('sajonia',        'Sajonia',        'asuncion', 12),
  -- Gran Asunción
  ('luque',                'Luque',                'gran_asuncion', 1),
  ('san-lorenzo',          'San Lorenzo',          'gran_asuncion', 2),
  ('lambare',              'Lambaré',              'gran_asuncion', 3),
  ('fernando-de-la-mora',  'Fernando de la Mora',  'gran_asuncion', 4),
  ('mariano-roque-alonso', 'Mariano Roque Alonso', 'gran_asuncion', 5),
  ('villa-elisa',          'Villa Elisa',          'gran_asuncion', 6)
on conflict (slug) do nothing;
