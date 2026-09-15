import { describe, it, expect } from "vitest";
import { transcurrido } from "./format";

function hace(horasAtras: number): string {
  return new Date(Date.now() - horasAtras * 3.6e6).toISOString();
}

describe("transcurrido", () => {
  it("dice 'Hace minutos' para menos de 1 hora", () => {
    expect(transcurrido(hace(0.5))).toBe("Hace minutos");
  });

  it("dice horas para menos de un día", () => {
    expect(transcurrido(hace(5))).toBe("Hace 5 h");
  });

  it("dice 'Ayer' para exactamente 1 día", () => {
    expect(transcurrido(hace(24))).toBe("Ayer");
  });

  it("dice días para menos de 14 días", () => {
    expect(transcurrido(hace(24 * 5))).toBe("Hace 5 días");
  });

  it("dice semanas para menos de 60 días", () => {
    expect(transcurrido(hace(24 * 21))).toBe("Hace 3 semanas");
  });

  it("dice meses para menos de 2 años", () => {
    expect(transcurrido(hace(24 * 90))).toBe("Hace 3 meses");
  });
});
