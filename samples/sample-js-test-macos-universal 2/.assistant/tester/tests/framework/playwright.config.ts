import { defineConfig, devices } from "@playwright/test";

// Ha van megadva BASE_URL környezeti változó (sandboxban), azt használjuk,
// különben lokálisan indíthatunk egy saját szervert vagy rámutathatunk a lokálisra.
const PORT = process.env.PORT || 3333;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const isSandbox = process.env.BASE_URL !== undefined;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "..",
  // A demo/ mappa csak bemutató spec-eket tartalmaz az összehasonlításhoz,
  // ne fusson le az éles értékeléskor.
  testIgnore: ["demo/**"],
  timeout: 5000,
  expect: {
    timeout: 1000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
    },
  },
  outputDir: "../test-results",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0, // process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    // [
    //   "json",
    //   {
    //     outputFile:
    //       process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || "../results.json",
    //   },
    // ],
    [
      "./lib/grading-reporter.ts",
      {
        outputFile:
          process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || "../results.json",
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: BASE_URL,
    // trace: "on-first-retry",
    headless: true,
    // Turn off every extra visual or debug data collection
    trace: "off",
    screenshot: "off",
    video: "off",

    actionTimeout: 1000,
  },
  // Lokálisan automatikusan elindítja a webszervert a solution/ mappára!
  webServer: isSandbox
    ? undefined
    : {
        // Több külön HTML-oldalt szolgálunk ki: a -s SPA-visszaesése a
        // hiányzó gyökér index.html-t keresné a task-*/index.html helyett.
        command: `npx serve ../../solution -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
      },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
