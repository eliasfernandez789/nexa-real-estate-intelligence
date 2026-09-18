-- NEXA — archiva todos los pedidos cargados hasta ahora (seed + QA de esta
-- sesión de trabajo), para que los primeros usuarios reales de la Beta
-- empiecen con la bolsa vacía y sus pedidos no se mezclen con los de prueba.
--
-- Usa "Archivado" (ya es un estado válido del dominio) en vez de borrar:
-- reversible, y el filtro por defecto ("Activos y en negociación") ya los
-- oculta de inmediato sin perder el historial.
--
-- Correr en el SQL Editor de Supabase, DESPUÉS de confirmar que no hay
-- ningún pedido real todavía (todo lo cargado hoy es seed/demo/QA).

update pedidos set estado = 'Archivado' where estado <> 'Archivado';
