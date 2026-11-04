// Written by ExamAssistant. Setup's browser check for template-based tests:
// launches the browser the app chose and loads the local server's health page.
// A failure is reported in the results file instead of failing the run.
import { chromium, test } from "@playwright/test";
import { writeFileSync } from "node:fs";

test("self-check", async () => {
  const started = Date.now();
  let selfCheck: Record<string, unknown>;
  try {
    const browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH || undefined,
      headless: true,
    });
    try {
      const page = await browser.newPage();
      const response = await page.goto(`${process.env.EXAM_BASE_URL}/__health`);
      if (!response?.ok()) {
        throw new Error(`Local server unreachable (HTTP ${response?.status()})`);
      }
      selfCheck = { ok: true, browserVersion: browser.version() };
    } finally {
      await browser.close();
    }
  } catch (e: any) {
    selfCheck = { ok: false, error: String(e?.message ?? e).split("\n")[0] };
  }
  writeFileSync(
    process.env.RESULTS_FILE!,
    JSON.stringify({
      schemaVersion: 1,
      exam: { id: process.env.EXAM_ID, title: { en: "", hu: "" } },
      selfCheck: { ...selfCheck, durationMs: Date.now() - started },
    }),
  );
});
