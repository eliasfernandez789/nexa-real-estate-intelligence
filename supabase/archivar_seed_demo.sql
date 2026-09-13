-- NEXA — archiva los 12 pedidos demo originales (datos inventados) ahora que
-- ya hay pedidos reales del grupo de WhatsApp. No se borran: quedan en la base
-- con estado 'Archivado', visibles solo si alguien filtra explícitamente por
-- "Archivados".
update pedidos set estado = 'Archivado'
where codigo in (
  'PED-1029', 'PED-1042', 'PED-1038', 'PED-1041', 'PED-1035', 'PED-1032',
  'PED-1039', 'PED-1030', 'PED-1037', 'PED-1033', 'PED-1036', 'PED-1040'
);
