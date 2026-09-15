import { test, expect } from "@playwright/test";

test.describe("Acceso sin sesión", () => {
  test("visitar / sin sesión redirige a /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("/login");
    await expect(page.locator("h1")).toHaveText("Iniciar sesión");
  });

  test("visitar /configuracion sin sesión redirige a /login", async ({ page }) => {
    await page.goto("/configuracion");
    await page.waitForURL("/login");
  });

  test("el login muestra los campos necesarios", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("el signup muestra los campos necesarios", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("#nombre")).toBeVisible();
    await expect(page.locator("#oficina")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });
});
