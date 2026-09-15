import { describe, it, expect } from "vitest";
import { compatibilidad, aUSD } from "./ParearPropiedadButton";
import type { Pedido } from "@/lib/pedidos";

function pedidoMock(overrides: Partial<Pedido> = {}): Pedido {
  return {
    uuid: "u1",
    id: "PED-0001",
    temperatura: "tibio",
    estado: "Activo",
    consultas: 0,
    tiempo: "Hace 1 día",
    createdAt: new Date().toISOString(),
    renovadoEn: null,
    vigenciaDias: 30,
    tipo: "Casa",
    zonas: ["Villa Morra"],
    moneda: "USD",
    precioMax: "100.000",
    precioMaxRaw: 100_000,
    aprox: "≈ Gs. 730.000.000",
    descripcion: "",
    agenteNombre: "Test Agente",
    agenteIniciales: "TA",
    agenteOficina: "RE/MAX Test",
    whatsapp: "https://wa.me/",
    esMio: false,
    esMiOficina: false,
    puedeVerPrivado: false,
    ...overrides,
  };
}

const TC = 7300;

describe("aUSD", () => {
  it("devuelve el mismo valor cuando el pedido ya está en USD", () => {
    expect(aUSD(pedidoMock({ moneda: "USD", precioMaxRaw: 100_000 }), TC)).toBe(100_000);
  });

  it("convierte de PYG a USD usando la cotización", () => {
    expect(aUSD(pedidoMock({ moneda: "PYG", precioMaxRaw: 73_000 }), TC)).toBe(10);
  });
});

describe("compatibilidad", () => {
  it("suma 40 + 35 + 25 = 100 cuando tipo, zona y precio calzan totalmente", () => {
    const pedido = pedidoMock({ tipo: "Casa", zonas: ["Villa Morra"], moneda: "USD", precioMaxRaw: 100_000 });
    const score = compatibilidad(
      { tipo: "Casa", zona: "Villa Morra", moneda: "USD", precio: 90_000 },
      pedido,
      TC,
    );
    expect(score).toBe(100);
  });

  it("da 12 puntos de precio (no 25) cuando se pasa hasta un 10% del tope", () => {
    const pedido = pedidoMock({ tipo: "Casa", zonas: ["Villa Morra"], moneda: "USD", precioMaxRaw: 100_000 });
    const score = compatibilidad(
      { tipo: "Casa", zona: "Villa Morra", moneda: "USD", precio: 105_000 },
      pedido,
      TC,
    );
    expect(score).toBe(40 + 35 + 12);
  });

  it("no suma puntos de precio si se pasa más de un 10% del tope", () => {
    const pedido = pedidoMock({ tipo: "Casa", zonas: ["Villa Morra"], moneda: "USD", precioMaxRaw: 100_000 });
    const score = compatibilidad(
      { tipo: "Casa", zona: "Villa Morra", moneda: "USD", precio: 150_000 },
      pedido,
      TC,
    );
    expect(score).toBe(40 + 35);
  });

  it("da 0 si no coincide tipo, zona ni precio", () => {
    const pedido = pedidoMock({ tipo: "Terreno", zonas: ["Lambaré"], moneda: "USD", precioMaxRaw: 10_000 });
    const score = compatibilidad(
      { tipo: "Casa", zona: "Villa Morra", moneda: "USD", precio: 100_000 },
      pedido,
      TC,
    );
    expect(score).toBe(0);
  });

  it("reconoce el tipo dentro de un pedido con tipos combinados ('Casa·Dúplex')", () => {
    const pedido = pedidoMock({ tipo: "Casa·Dúplex", zonas: ["Villa Morra"], moneda: "USD", precioMaxRaw: 100_000 });
    const score = compatibilidad(
      { tipo: "Dúplex", zona: "Villa Morra", moneda: "USD", precio: 90_000 },
      pedido,
      TC,
    );
    expect(score).toBe(100);
  });
});
