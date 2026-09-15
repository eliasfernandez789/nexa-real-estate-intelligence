const TELEFONO_RE = /^[0-9]{8,15}$/;

export function esTelefonoValido(valor: string): boolean {
  return TELEFONO_RE.test(valor.trim());
}
