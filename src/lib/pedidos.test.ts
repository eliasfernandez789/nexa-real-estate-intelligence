import { describe, it, expect } from "vitest";
import { esUrgente, ESTADO_STYLE, type Estado } from "./pedidos";

describe("esUrgente", () => {
  it("es urgente cuando está Activo y caliente", () => {
    expect(esUrgente({ temperatura: "caliente", estado: "Activo" })).toBe(true);
  });

  it("es urgente cuando está En Negociación y caliente", () => {
    expect(esUrgente({ temperatura: "caliente", estado: "En Negociación" })).toBe(true);
  });

  it("no es urgente si está Cerrado, aunque sea caliente", () => {
    expect(esUrgente({ temperatura: "caliente", estado: "Cerrado" })).toBe(false);
  });

  it("no es urgente si está Archivado, aunque sea caliente", () => {
    expect(esUrgente({ temperatura: "caliente", estado: "Archivado" })).toBe(false);
  });

  it("no es urgente si es tibio o frío, aunque esté Activo", () => {
    expect(esUrgente({ temperatura: "tibio", estado: "Activo" })).toBe(false);
    expect(esUrgente({ temperatura: "frio", estado: "Activo" })).toBe(false);
  });
});

describe("ESTADO_STYLE", () => {
  it("tiene una clase definida para cada estado del dominio", () => {
    const estados: Estado[] = ["Activo", "En Negociación", "Cerrado", "Archivado"];
    for (const estado of estados) {
      expect(ESTADO_STYLE[estado]).toBeTruthy();
    }
  });
});
