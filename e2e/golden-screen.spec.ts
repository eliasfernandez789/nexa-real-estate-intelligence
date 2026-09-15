import { test, expect } from "@playwright/test";

test.describe("Toda la Red — regresión básica (Golden Screen)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("carga con sidebar, header y al menos una tarjeta", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Toda la Red" })).toBeVisible();
    await expect(page.locator("#nexa-search")).toBeVisible();
    await expect(page.locator("[data-pedido-card]").first()).toBeVisible();
  });

  test("el buscador filtra la lista de tarjetas", async ({ page }) => {
    const totalInicial = await page.locator("[data-pedido-card]").count();
    expect(totalInicial).toBeGreaterThan(0);

    await page.locator("#nexa-search").fill("zzz-texto-que-no-matchea-nada-zzz");
    await expect(page.getByText("No hay pedidos que coincidan con los filtros.")).toBeVisible();

    await page.locator("#nexa-search").fill("");
    await expect(page.locator("[data-pedido-card]").first()).toBeVisible();
  });

  test("el filtro de temperatura no deja el contador desincronizado del resultado", async ({ page }) => {
    // Regresión del bug corregido en la fase anterior: un chip con conteo > 0
    // no debe dejar la grilla vacía.
    const chips = ["Caliente", "Tibio", "Frío"];
    for (const label of chips) {
      const chip = page.getByRole("button", { name: new RegExp(`^${label} \\d+$`) });
      const text = await chip.textContent();
      const count = Number(text?.match(/\d+/)?.[0] ?? "0");
      if (count > 0) {
        await chip.click();
        await expect(page.locator("[data-pedido-card]").first()).toBeVisible();
        await chip.click(); // deseleccionar
      }
    }
  });

  test("abrir una ficha (Sheet) con el botón Ficha y cerrarla con Escape", async ({ page }) => {
    await page.locator("[data-pedido-card]").first().getByRole("button", { name: "Ficha" }).click();
    await expect(page.locator('[data-slot="sheet-content"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-slot="sheet-content"]')).toBeHidden();
  });

  test("el link de WhatsApp de una tarjeta apunta a wa.me", async ({ page }) => {
    const link = page.locator("[data-pedido-card]").first().getByRole("link", { name: "WhatsApp" });
    await expect(link).toHaveAttribute("href", /wa\.me/);
  });

  test("atajo N abre el dialog de Nuevo Pedido y se puede cancelar", async ({ page }) => {
    await page.keyboard.press("n");
    await expect(page.getByText("Nuevo pedido de comprador")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByText("Nuevo pedido de comprador")).toBeHidden();
  });

  test("atajo P abre el dialog de Parear propiedad y se puede cerrar", async ({ page }) => {
    await page.keyboard.press("p");
    await expect(page.getByText("Matchear captación")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Matchear captación")).toBeHidden();
  });

  test("⌘K enfoca el buscador", async ({ page }) => {
    await page.keyboard.press("Meta+k");
    await expect(page.locator("#nexa-search")).toBeFocused();
  });

  test("navegación por sidebar entre las 3 vistas y Configuración", async ({ page }) => {
    await page.getByRole("link", { name: "Mis Pedidos" }).click();
    await expect(page.getByRole("heading", { name: "Mis Pedidos" })).toBeVisible();

    await page.getByRole("link", { name: "Urgentes" }).click();
    await expect(page.getByRole("heading", { name: "Urgentes" })).toBeVisible();

    await page.getByRole("link", { name: "Configuración" }).click();
    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();

    await page.getByRole("link", { name: "Toda la Red" }).click();
    await expect(page.getByRole("heading", { name: "Toda la Red" })).toBeVisible();
  });
});

test.describe("Configuración", () => {
  test("carga el perfil y permite reguardar el mismo teléfono sin error", async ({ page }) => {
    await page.goto("/configuracion");
    await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();

    const telefonoInput = page.locator("#telefonoWa");
    await expect(telefonoInput).toBeVisible();
    const valorActual = await telefonoInput.inputValue();

    if (valorActual) {
      await page.getByRole("button", { name: "Guardar número" }).click();
      await expect(page.getByText("Número actualizado.")).toBeVisible();
    }
  });
});
