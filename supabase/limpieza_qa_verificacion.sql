-- NEXA — limpieza de las cuentas de prueba usadas para verificar la RLS
-- el 2026-09-13 (ver schema_fix_signup_rol.sql). Una de ellas quedó con
-- rol='admin' de verdad por el exploit ya corregido — conviene borrarla,
-- no solo bajarle el rol.

delete from agentes where nombre in (
  'QA No Admin', 'QA Intento Admin', 'QA2 Agente', 'QA2 Admin',
  'QA Check Final', 'QA Reintento Exploit', 'QA Refix Normal'
);

-- Opcional pero recomendado: los usuarios de auth (auth.users) con emails
-- @nexa-test.local que quedaron huérfanos no se pueden borrar con la anon key
-- ni con estas policies. Borralos desde el Dashboard de Supabase:
-- Authentication -> Users -> buscar "nexa-test.local" -> eliminar cada uno.
