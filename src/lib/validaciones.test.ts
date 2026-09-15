import { describe, it, expect } from "vitest";
import { esTelefonoValido } from "./validaciones";

describe("esTelefonoValido", () => {
  it("acepta un número con código de país, solo dígitos", () => {
    expect(esTelefonoValido("595981234567")).toBe(true);
  });

  it("rechaza vacío", () => {
    expect(esTelefonoValido("")).toBe(false);
  });

  it("rechaza con espacios, guiones o '+'", () => {
    expect(esTelefonoValido("+595 981 234 567")).toBe(false);
    expect(esTelefonoValido("595-98-123-4567")).toBe(false);
  });

  it("rechaza menos de 8 dígitos", () => {
    expect(esTelefonoValido("1234567")).toBe(false);
  });

  it("rechaza más de 15 dígitos", () => {
    expect(esTelefonoValido("1234567890123456")).toBe(false);
  });

  it("ignora espacios al principio/final antes de validar", () => {
    expect(esTelefonoValido("  595981234567  ")).toBe(true);
  });
});
