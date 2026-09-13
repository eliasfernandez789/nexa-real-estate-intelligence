-- NEXA — zonas tenía RLS activado sin ninguna policy de lectura (por eso devolvía vacío)
create policy "zonas: lectura autenticada" on zonas
  for select using (auth.role() = 'authenticated');
