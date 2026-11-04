import { type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export async function loadModule(filename: string) {
  const isSandbox = process.env.BASE_URL !== undefined;
  const dir = isSandbox ? "/work/submission" : "../../solution";
  const filePath = path.resolve(path.join(dir, filename));

  // Node's ambiguous ".js" module-type detection (CommonJS vs ESM) differs
  // between Node versions when there is no "type" field in the nearest
  // package.json - this caused ESM syntax to fail parsing in the sandbox
  // Docker image while working locally. Loading through a sibling ".mjs"
  // copy makes the module type unambiguous everywhere.
  const tmpFilePath = `${filePath}.__loader__.mjs`;
  fs.copyFileSync(filePath, tmpFilePath);
  try {
    return await import(`file://${tmpFilePath}`);
  } finally {
    fs.unlinkSync(tmpFilePath);
  }
}

/**
 * Betölt egy szerver által kiszolgált JS fájlt a böngészőbe úgy, hogy közben
 * nem támaszkodik sem a helyi fájlrendszerre, sem a szerver saját (pl. `serve`
 * könyvtárlistázó) oldalára.
 *
 * `about:blank`-ról induló `addScriptTag` a Chrome Private Network Access
 * szabálya miatt elbukna (a `null` origin nem "secure context", a script
 * célja pedig `loopback` címtér), ezért ehelyett egy üres HTML-t fulfillálunk
 * ugyanazon origin alatt, mielőtt a scriptet beinjektálnánk.
 *
 * @param {Page}   page      - Playwright page
 * @param {string} scriptUrl - A tesztelendő JS fájl teljes URL-je (pl. http://localhost:3000/index.js)
 */
export async function loadScript(page: Page, scriptUrl: string) {
  // const origin = new URL(scriptUrl).origin;
  const origin = "";
  const harnessUrl = `${origin}/__test-harness__`;

  await page.route(harnessUrl, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!DOCTYPE html><html><head></head><body></body></html>",
    }),
  );

  await page.goto(harnessUrl);
  await page.addScriptTag({ url: scriptUrl });
}

/**
 * Gather all console logs from a Playwright page.
 *
 * @param page The Playwright page to collect logs from.
 * @returns A promise resolving to an array of the captured console log messages.
 */
export async function collectAllConsoleLogs(page: any) {
  await page.addInitScript(() => {
    (window as any).__capturedConsoleLogs = [];
    const originalLog = console.log.bind(console);

    console.log = (...args: any[]) => {
      (window as any).__capturedConsoleLogs.push(args);
      originalLog(...args);
    };
  });

  await page.goto("/index.html");
  await page.waitForLoadState("load");

  const logs = await page.evaluate(() => {
    return (window as any).__capturedConsoleLogs ?? [];
  });

  return logs.map((entry: any[]) => entry[0]);
}
