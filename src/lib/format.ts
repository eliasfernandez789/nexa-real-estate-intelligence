export function transcurrido(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3.6e6);
  if (h < 1) return "Hace minutos";
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Ayer";
  if (d < 14) return `Hace ${d} días`;
  if (d < 60) return `Hace ${Math.floor(d / 7)} semanas`;
  const m = Math.floor(d / 30);
  return m < 24 ? `Hace ${m} meses` : `Hace ${Math.floor(m / 12)} años`;
}
