// Written by ExamAssistant next to the exam's own playwright.config.ts on every
// launch. The exam's tests and framework stay untouched: this file only adds what
// a student's PC needs (local server for the student's folder, installed browser,
// self-check). It runs from tests/framework like `npm test`; ../../solution is a
// copy of the student's folder (for the template's loadModule). BASE_URL stays
// unset: the template would take it for the sandbox.
import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

const baseURL = process.env.EXAM_BASE_URL;
const executablePath = process.env.CHROME_PATH || undefined;
const selfCheck = process.env.EXAM_SELF_CHECK === "1";

function withBrowser(use: Record<string, any> = {}) {
  if (!executablePath) return { ...use, baseURL };
  return {
    ...use,
    baseURL,
    channel: undefined,
    launchOptions: { ...use.launchOptions, executablePath },
  };
}

export default defineConfig({
  ...base,
  ...(selfCheck && {
    testDir: __dirname,
    testMatch: /exam-assistant-selfcheck\.ts$/,
    testIgnore: [],
    reporter: [["list"]],
  }),
  forbidOnly: false,
  retries: 0,
  // Below the app's watchdog ([tester] timeout_s): the tester stops itself
  // first, so the tests that did run still give feedback.
  globalTimeout: Number(process.env.EXAM_GLOBAL_TIMEOUT_MS) || 90_000,
  // [tester] workers: parallel browsers on the student's PC (the template's own
  // value otherwise). The template's tests are independent (fullyParallel).
  ...(Number(process.env.EXAM_WORKERS) > 0 && { workers: Number(process.env.EXAM_WORKERS) }),
  use: withBrowser(base.use),
  projects: selfCheck
    ? [{ name: "self-check" }]
    : (base.projects?.length ? base.projects : [{ name: "chromium" }]).map((project) => ({
        ...project,
        use: withBrowser(project.use),
      })),
  webServer: {
    // Paths go through the environment, never through command text.
    command: "node exam-assistant-server.mjs",
    cwd: __dirname,
    url: `${baseURL}/__health`,
    // Never test a foreign server that happens to use the same port.
    reuseExistingServer: false,
    timeout: 10_000,
  },
});
