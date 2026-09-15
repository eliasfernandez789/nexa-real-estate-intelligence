import { existsSync } from "fs";
import { test as setup } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

/**
 * Paso manual, una sola vez: abre un navegador real y espera a que la
 * persona loguee a mano en /login. Playwright nunca ve ni escribe la
 * contraseña — solo guarda la sesión ya autenticada (cookies) para que el
 * resto de los tests la reutilicen sin volver a pedir credenciales.
 *
 * El proyecto "e2e" depende de "setup", así que este archivo corre en cada
 * `--project=e2e`. Si ya existe una sesión guardada, la reusa en vez de
 * pedir un login manual de nuevo — solo hace falta loguear una vez, o
 * cuando la sesión guardada expire.
 *
 * Para forzar un nuevo login manual: borrar playwright/.auth/user.json y
 * correr `npx playwright test --project=setup`.
 */
setup("login manual y guardar sesión", async ({ page }) => {
  if (existsSync(AUTH_FILE)) {
    console.log(`\n>>> Ya existe ${AUTH_FILE} — se reusa sin pedir login.\n`);
    return;
  }

  setup.setTimeout(150_000);
  await page.goto("/login");

  console.log("\n>>> Iniciá sesión manualmente en la ventana del navegador (2 minutos)...\n");

  await page.waitForURL("/", { timeout: 120_000 });

  await page.context().storageState({ path: AUTH_FILE });
  console.log(`\n>>> Sesión guardada en ${AUTH_FILE}\n`);
});
