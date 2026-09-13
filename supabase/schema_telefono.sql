-- NEXA — agrega el teléfono de WhatsApp a agentes (faltaba, lo necesita la UI real)
alter table agentes add column if not exists telefono_wa text;

update agentes set telefono_wa = '595971604882' where id = 'a1000000-0000-4000-8000-000000000001'; -- Carla Duarte
update agentes set telefono_wa = '595985330218' where id = 'a1000000-0000-4000-8000-000000000002'; -- Lucía Benítez
update agentes set telefono_wa = '595981214470' where id = 'a1000000-0000-4000-8000-000000000003'; -- Rodrigo Ayala
update agentes set telefono_wa = '595983117025' where id = 'a1000000-0000-4000-8000-000000000004'; -- Mateo Ovelar
update agentes set telefono_wa = '595961558307' where id = 'a1000000-0000-4000-8000-000000000005'; -- Diego Villalba
update agentes set telefono_wa = '595992770164' where id = 'a1000000-0000-4000-8000-000000000006'; -- Nadia Franco
update agentes set telefono_wa = '595976442019' where id = 'a1000000-0000-4000-8000-000000000007'; -- Sofía Ramírez
