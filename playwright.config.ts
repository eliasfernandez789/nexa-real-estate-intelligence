import { defineConfig, devices } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], headless: false },
    },
    {
      // Tests que deliberadamente corren SIN sesión (ej: verificar el
      // redirect a /login) — nunca dependen de "setup" ni usan storageState.
      name: "public",
      testMatch: /.*\.public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.public\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILE },
    },
  ],
});
