import { test, expect, type Page } from "@playwright/test";

const BREAKPOINTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

async function sinOverflowHorizontal(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const bp of BREAKPOINTS) {
  test.describe(`Smoke responsive — ${bp.name} (${bp.width}px)`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    test("Toda la Red no desborda horizontalmente y las tarjetas se ven", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-pedido-card]").first()).toBeVisible();
      await sinOverflowHorizontal(page);
    });

    test("la navegación (sidebar o menú mobile) es accesible", async ({ page }) => {
      await page.goto("/");
      if (bp.width < 768) {
        // Debajo de md el sidebar fijo se reemplaza por MobileNav (hamburguesa).
        await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
      } else {
        await expect(page.getByRole("link", { name: "Toda la Red" })).toBeVisible();
      }
    });

    test("abrir una ficha (Sheet) no rompe el layout", async ({ page }) => {
      await page.goto("/");
      await page.locator("[data-pedido-card]").first().getByRole("button", { name: "Ficha" }).click();
      await expect(page.locator('[data-slot="sheet-content"]')).toBeVisible();
      await sinOverflowHorizontal(page);
      await page.keyboard.press("Escape");
    });

    test("Configuración no desborda horizontalmente", async ({ page }) => {
      await page.goto("/configuracion");
      await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();
      await sinOverflowHorizontal(page);
    });
  });
}
