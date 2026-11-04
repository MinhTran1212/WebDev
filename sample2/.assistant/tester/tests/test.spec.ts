import { expect, test, type Page } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { additiveTask, binaryTask } from "./framework/lib/grading";

// JS-A zárthelyi (3 feladat, 40 pont) a változatlan task-template keretrendszerrel.
//
// - Minden részfeladat (1a ... 3i) külön Playwright teszt: a template 5 s-os
//   tesztidőkorlátja így egy-egy részfeladatra vonatkozik, egy elbukó ellenőrzés
//   nem viszi el a többi idejét.
// - additiveTask csak ott, ahol a feladatleírás maga bontja alpontokra a pontszámot;
//   minden más binaryTask.
// - Adatkészletek (1. és 3. feladat): tests/datasets/<készlet>/task-{1,3}/data.js
//   és expected.json. Az oldal adatfájlját a teszt mindig a készletből szolgálja ki,
//   és egy részfeladat csak akkor ér pontot, ha minden készleten helyes.
//   - original: a kezdőcsomag adatai, a hallgatói csomagba is bekerül.
//   - hidden-*: csak az értékelőn (a kezdőcsomag .assistant/tester/tests mappájából
//     kimarad); a hibaüzenet nem árulja el az adatait.
//   Új vagy módosított készlet után: node tools/build-expected.mjs (az elvárt értékek),
//   majd npm test a megoldáson (tests/results.json).
// - A template korlátja: végtelen ciklusnál az adott részfeladat tesztje
//   időtúllépéssel leáll, és kimarad az eredményből.

const open = (page: Page, task: string) => page.goto(`/${task}/`);

// ---------------------------------------------------------------------------
// Adatkészletek
// ---------------------------------------------------------------------------

type Dataset = {
  label: string;
  hidden: boolean;
  dir: string;
  expected: Record<string, any>;
};

const DATASETS_DIR = path.join(__dirname, "datasets");

// Az "original" mindig az első.
const DATASETS: Dataset[] = readdirSync(DATASETS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort((a, b) => (a === "original" ? -1 : b === "original" ? 1 : a.localeCompare(b)))
  .map((name, i) => {
    const hidden = name !== "original";
    return {
      label: hidden ? `rejtett-${i} / hidden-${i}` : "alap / visible",
      hidden,
      dir: path.join(DATASETS_DIR, name),
      expected: JSON.parse(readFileSync(path.join(DATASETS_DIR, name, "expected.json"), "utf-8")),
    };
  });

// Megnyitja a feladat oldalát a készlet data.js fájljával, és a készlet elvárt
// értékeit adja vissza.
async function openSet<T>(page: Page, task: string, set: Dataset): Promise<T> {
  await page.unrouteAll({ behavior: "ignoreErrors" });
  let loaded = false;
  await page.route(`**/${task}/data.js`, (route) => {
    loaded = true;
    return route.fulfill({
      path: path.join(set.dir, task, "data.js"),
      contentType: "application/javascript; charset=utf-8",
    });
  });
  await open(page, task);
  if (!loaded) {
    throw new Error("Az oldal nem tölti be a data.js fájlt / The page does not load data.js");
  }
  return set.expected[task];
}

// Minden készleten lefuttatja az ellenőrzést. Rejtett készletnél a hibaüzenet csak
// a készlet nevét tartalmazza (az elvárt értékeket és a bolygóneveket nem).
async function forEachSet<T>(page: Page, task: string, check: (exp: T) => Promise<void>) {
  for (const set of DATASETS) {
    try {
      await check(await openSet<T>(page, task, set));
    } catch (e) {
      if (!set.hidden) throw e;
      throw new Error(
        `Hibás eredmény egy másik adatkészlettel (${set.label}) / Wrong result with another dataset (${set.label})`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 1. feladat - Űrmissziók
// ---------------------------------------------------------------------------

// Elvárt értékek (expected.json "task-1"), adatkészletenként.
type Task1 = { a: number; b: boolean; c: boolean; d: string[]; e: string[]; f: string };

const task1 = (page: Page, check: (exp: Task1) => Promise<void>) =>
  forEachSet(page, "task-1", check);

type Dd = { text: string | null; items: string[] | null };

// Egy dd elem tartalma: a szövege, illetve ha több gyerekeleme van (pl. li),
// azok szövegei külön.
const readDd = (page: Page, id: string): Promise<Dd> =>
  page.evaluate((id) => {
    const el = document.querySelector(`#${id}`);
    if (!el) return { text: null, items: null };
    const children = [...el.children];
    return {
      text: el.textContent,
      items:
        children.length > 1
          ? children.map((c) => (c.textContent ?? "").trim()).filter((s) => s)
          : null,
    };
  }, id);

// Elnéző összehasonlítás: szóközök levágva; logikai érték true/false vagy igaz/hamis;
// listák vesszővel (vagy pontosvesszővel / sortöréssel) elválasztva, vagy külön
// gyerekelemekben, az adatok sorrendjében.
const text = (dd: Dd) => (dd.text === null ? null : dd.text.trim());

function bool(dd: Dd) {
  const t = text(dd)?.toLowerCase();
  if (t === "true" || t === "igaz") return true;
  if (t === "false" || t === "hamis") return false;
  return t;
}

function list(dd: Dd) {
  if (dd.items) return dd.items;
  const t = text(dd);
  if (t === null) return null;
  return t
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

test.describe("1. feladat - Űrmissziók / Task 1 - Space Missions", () => {
  test("1a", async ({ page }) => {
    await binaryTask("a. Küldetések száma / a. Number of missions", 1, () =>
      task1(page, async (exp) => {
        expect(text(await readDd(page, "taskA")), "#taskA").toBe(String(exp.a));
      }),
    );
  });

  test("1b", async ({ page }) => {
    await binaryTask("b. Volt-e sikertelen küldetés / b. Any unsuccessful mission", 2, () =>
      task1(page, async (exp) => {
        expect(bool(await readDd(page, "taskB")), "#taskB").toBe(exp.b);
      }),
    );
  });

  test("1c", async ({ page }) => {
    await binaryTask("c. Minden küldetésen volt eszköz / c. Every mission used an instrument", 2, () =>
      task1(page, async (exp) => {
        expect(bool(await readDd(page, "taskC")), "#taskC").toBe(exp.c);
      }),
    );
  });

  test("1d", async ({ page }) => {
    await binaryTask("d. Sikeres NASA-küldetések / d. Successful NASA missions", 2, () =>
      task1(page, async (exp) => {
        expect(list(await readDd(page, "taskD")), "#taskD").toEqual(exp.d);
      }),
    );
  });

  test("1e", async ({ page }) => {
    await binaryTask("e. Kamerát használó küldetések / e. Missions that used a camera", 2, () =>
      task1(page, async (exp) => {
        expect(list(await readDd(page, "taskE")), "#taskE").toEqual(exp.e);
      }),
    );
  });

  test("1f", async ({ page }) => {
    await binaryTask("f. Legdrágább sikeres küldetés / f. Most expensive successful mission", 3, () =>
      task1(page, async (exp) => {
        expect(text(await readDd(page, "taskF")), "#taskF").toBe(exp.f);
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// 2. feladat - Felderítő útvonaltervező
// ---------------------------------------------------------------------------

// Nincs adatfájl: a beégetett koordináták ellen a térképet betöltés után
// módosítjuk (máshol aszteroida / bolygó).

// A térkép elvárt állapota oldalanként (a probe osztály nélkül). A kiszolgált
// index.html-ből olvassuk, így a betöltéskor lefutó hallgatói kód sem ronthatja el;
// a clearAsteroids / setCell módosításait itt is átvezetjük.
type MapCell = { cls: string[]; name: string | null };
const expectedMaps = new WeakMap<Page, MapCell[][]>();

const openMap = async (page: Page) => {
  await open(page, "task-2");
  expectedMaps.set(
    page,
    await page.evaluate(async () => {
      const html = await (await fetch(location.href)).text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      return [...(doc.querySelector("#sector") as HTMLTableElement).rows].map((row) =>
        [...row.cells].map((cell) => ({
          cls: [...cell.classList].filter((c) => c !== "probe"),
          name: cell.getAttribute("data-name"),
        })),
      );
    }),
  );
};

const add = async (page: Page, value: string) => {
  await page.locator("#target-input").fill(value);
  await page.locator("#add-target").click();
};

const move = async (page: Page, ...dirs: ("up" | "down" | "left" | "right")[]) => {
  for (const dir of dirs) await page.locator(`#move-${dir}`).click();
};

const clearAsteroids = async (page: Page) => {
  await page.evaluate(() =>
    document
      .querySelectorAll("#sector .asteroid")
      .forEach((c) => c.classList.remove("asteroid")),
  );
  for (const row of expectedMaps.get(page) ?? [])
    for (const cell of row) cell.cls = cell.cls.filter((c) => c !== "asteroid");
};

const setCell = async (
  page: Page,
  r: number,
  c: number,
  kind: { asteroid?: true; planet?: string },
) => {
  await page.evaluate(
    ({ r, c, kind }) => {
      const cell = (document.querySelector("#sector") as HTMLTableElement).rows[r]
        .cells[c];
      if (kind.asteroid) cell.classList.add("asteroid");
      if (kind.planet) {
        cell.classList.add("planet");
        cell.dataset.name = kind.planet;
        cell.textContent = kind.planet;
      }
    },
    { r, c, kind },
  );
  const cell = expectedMaps.get(page)?.[r]?.[c];
  if (cell) {
    if (kind.asteroid) cell.cls.push("asteroid");
    if (kind.planet) {
      cell.cls.push("planet");
      cell.name = kind.planet;
    }
  }
};

// A szonda pontosan egy cellán, az adott sorban és oszlopban áll, és a cellák többi
// stílusosztálya (asteroid, planet) és data-name attribútuma megmaradt
// (pl. className felülírása itt bukik).
const probeAt = async (page: Page, where: string, r: number, c: number) => {
  await expect(page.locator("#sector .probe"), `probe count ${where}`).toHaveCount(1);
  await expect(
    page.locator("#sector tr").nth(r).locator("td").nth(c),
    `probe position ${where}`,
  ).toHaveClass(/(^|\s)probe(\s|$)/);
  const expectedMap = expectedMaps.get(page);
  if (!expectedMap) return;
  const actual = await page.evaluate(() =>
    [...(document.querySelector("#sector") as HTMLTableElement).rows].map((row) =>
      [...row.cells].map((cell) => ({
        cls: [...cell.classList],
        name: cell.getAttribute("data-name"),
      })),
    ),
  );
  const broken = expectedMap.flatMap((row, i) =>
    row.flatMap((cell, j) => {
      const now = actual[i]?.[j];
      const ok = now && cell.cls.every((cls) => now.cls.includes(cls)) && now.name === cell.name;
      return ok ? [] : [`(${i},${j})`];
    }),
  );
  expect(broken, `map cells keep asteroid / planet / data-name (${where})`).toEqual([]);
};

const route = (page: Page) => page.locator("#route li");
const visited = /(^|\s)visited(\s|$)/;
// Magyarul és angolul is elfogadjuk.
const DONE = /^\s*(Küldetés teljesítve!|Mission complete!)\s*$/;

// Futásonként más bolygónév, hogy a teszt nevei ne legyenek beégethetők.
const randomPlanet = () => `Vesta-${Math.random().toString(36).slice(2, 6)}`;

test.describe("2. feladat - Felderítő útvonaltervező / Task 2 - Exploration Route Planner", () => {
  test.beforeEach(async ({ page }) => {
    await openMap(page);
  });

  test("2a", async ({ page }) => {
    await binaryTask("a. Úti cél felvétele / a. Add target to the route", 1, async () => {
      await add(page, "Mars");
      await expect(route(page)).toHaveText(["Mars"]);
    });
  });

  test("2b", async ({ page }) => {
    await binaryTask("b. trim, üres kihagyása, mező ürítése / b. Trim, skip empty, clear input", 1, async () => {
      await add(page, "  Jupiter  ");
      await expect(route(page), "#route li after '  Jupiter  '").toHaveText(["Jupiter"]);
      await expect(page.locator("#target-input"), "#target-input cleared").toHaveValue("");
      await add(page, "   ");
      await add(page, "");
      await expect(route(page), "no item for empty / whitespace input").toHaveCount(1);
    });
  });

  test("2c", async ({ page }) => {
    await additiveTask("c. A szonda kapacitása / c. Probe capacity", undefined, [
      {
        name: "Célok száma / Number of targets",
        points: 1,
        fn: async () => {
          await openMap(page);
          await add(page, "Mars");
          await expect(page.locator("#route-count"), "after 1 target").toHaveText("1");
          await add(page, "Ceres");
          await add(page, "Eris");
          await expect(page.locator("#route-count"), "after 3 targets").toHaveText("3");
        },
      },
      {
        name: "Gomb letiltása 5 célnál / Button disabled at 5 targets",
        points: 1,
        fn: async () => {
          await openMap(page);
          for (const name of ["Mars", "Ceres", "Eris", "Sedna"]) await add(page, name);
          await expect(page.locator("#add-target"), "with 4 targets").toBeEnabled();
          await add(page, "Jupiter");
          await expect(page.locator("#add-target"), "with 5 targets").toBeDisabled();
        },
      },
    ]);
  });

  test("2d", async ({ page }) => {
    await binaryTask("d. Szonda képe / d. Probe image", 1, async () => {
      for (const value of ["pioneer", "new-horizons", "voyager"]) {
        await page.locator("#probe-select").selectOption(value);
        await expect(page.locator("#probe-image"), `src for ${value}`).toHaveAttribute(
          "src",
          new RegExp(`img/${value}\\.svg$`),
        );
      }
    });
  });

  test("2e", async ({ page }) => {
    await binaryTask("e. Szonda a kezdőcellán / e. Probe at start position", 1, async () => {
      // A probe osztályt az index.js tegye fel, ne a kiszolgált index.html.
      const inSource = await page.evaluate(async () => {
        const html = await (await fetch(location.href)).text();
        return new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("#sector .probe").length;
      });
      expect(inSource, "probe class must be added by index.js, not in index.html").toBe(0);
      await probeAt(page, "after load", 0, 0);
    });
  });

  test("2f", async ({ page }) => {
    await additiveTask("f. A szonda mozgatása / f. Moving the probe", undefined, [
      {
        name: "Lépés jobbra / Move right",
        points: 1,
        fn: async () => {
          await openMap(page);
          await move(page, "right");
          await probeAt(page, "after →", 0, 1);
        },
      },
      {
        name: "Mind a négy irány / All four directions",
        points: 1,
        fn: async () => {
          await openMap(page);
          await clearAsteroids(page);
          // Bolygó az útvonalon: rálépés és továbblépés után is maradjon planet.
          await setCell(page, 1, 1, { planet: randomPlanet() });
          await move(page, "down");
          await probeAt(page, "after ↓", 1, 0);
          await move(page, "right");
          await probeAt(page, "after ↓→", 1, 1);
          await move(page, "up");
          await probeAt(page, "after ↓→↑", 0, 1);
          await move(page, "left");
          await probeAt(page, "after ↓→↑←", 0, 0);
        },
      },
    ]);
  });

  test("2g", async ({ page }) => {
    await additiveTask("g. Nem lehetséges lépés / g. Blocked moves", undefined, [
      {
        name: "Szonda nem hagyja el a térképet / Probe stays on the map",
        points: 1,
        fn: async () => {
          await openMap(page);
          await clearAsteroids(page);
          await move(page, "up", "left");
          await probeAt(page, "after ↑← at the top-left corner", 0, 0);
          await move(page, ...Array<"right">(7).fill("right"));
          await probeAt(page, "after 7× → (right edge)", 0, 6);
          await move(page, ...Array<"down">(7).fill("down"));
          await probeAt(page, "after 7× ↓ (bottom edge)", 6, 6);
        },
      },
      {
        name: "Aszteroidára nem lép / Asteroids block the probe",
        points: 1,
        fn: async () => {
          // Eredeti térkép: (0,3) és (1,3) aszteroida.
          await openMap(page);
          await move(page, "right", "right", "right");
          await probeAt(page, "after →→→ (asteroid at row 0, col 3)", 0, 2);
          await move(page, "down", "right");
          await probeAt(page, "after ↓→ (asteroid at row 1, col 3)", 1, 2);
          // Módosított térkép: új aszteroida a (1,0) cellán.
          await openMap(page);
          await setCell(page, 1, 0, { asteroid: true });
          await move(page, "down");
          await probeAt(page, "after ↓ onto a newly placed asteroid", 0, 0);
        },
      },
    ]);
  });

  test("2h", async ({ page }) => {
    await additiveTask("h. A küldetés befejezése / h. Completing the mission", undefined, [
      {
        name: "Meglátogatott célok / Visited targets",
        points: 2,
        fn: async () => {
          await openMap(page);
          for (const name of ["Mars", "mars", "Pluto"]) await add(page, name);
          await move(page, "down", "down", "right"); // (2,1) = Mars
          await expect(route(page).nth(0), "Mars visited").toHaveClass(visited);
          await expect(route(page).nth(1), "mars not visited").not.toHaveClass(visited);
          await expect(route(page).nth(2), "Pluto not visited").not.toHaveClass(visited);
          // Módosított térkép: új bolygó a (1,0) cellán.
          const extra = randomPlanet();
          await openMap(page);
          await setCell(page, 1, 0, { planet: extra });
          await add(page, extra);
          await move(page, "down");
          await expect(route(page).nth(0), `${extra} (new planet) visited`).toHaveClass(visited);
        },
      },
      {
        name: "Küldetés teljesítve üzenet / Mission complete message",
        points: 2,
        fn: async () => {
          const status = page.locator("#status");

          // Új bolygó (1,0) először, a Mars utoljára.
          const first = randomPlanet();
          await openMap(page);
          await setCell(page, 1, 0, { planet: first });
          await add(page, "Mars");
          await add(page, first);
          await expect(status, "#status before any visit").toHaveText("");
          await move(page, "down"); // új bolygó / new planet
          await expect(status, `#status after visiting only ${first}`).toHaveText("");
          await move(page, "down", "right"); // Mars
          await expect(status, "#status after visiting every target").toHaveText(DONE);

          // Fordított sorrend (felvétel és bejárás is): Mars először, új bolygó (3,2) utoljára.
          const last = randomPlanet();
          await openMap(page);
          await setCell(page, 3, 2, { planet: last });
          await add(page, last);
          await add(page, "Mars");
          await move(page, "down", "down", "right"); // Mars
          await expect(status, "#status after visiting only Mars").toHaveText("");
          await move(page, "right", "down"); // új bolygó / new planet
          await expect(status, "#status after visiting every target (reverse order)").toHaveText(DONE);

          // A térképen nem szereplő cél mellett soha nem teljesül.
          const other = randomPlanet();
          await openMap(page);
          await setCell(page, 1, 0, { planet: other });
          for (const name of ["Mars", other, "Pluto"]) await add(page, name);
          await move(page, "down", "down", "right"); // új bolygó, majd Mars / new planet, then Mars
          await expect(status, "#status while Pluto (not on the map) is not visited").toHaveText("");
        },
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// 3. feladat - Naprendszer-vezérlő
// ---------------------------------------------------------------------------

type Planet = {
  name: string;
  typeIndex: number;
  orbit: number;
  slider: number;
  size: number;
  hasRings: boolean;
};
type Task3 = { types: string[]; planets: Planet[] };

// Elvárt értékek (expected.json "task-3"), adatkészletenként.
const task3 = (page: Page, check: (exp: Task3) => Promise<void>) =>
  forEachSet(page, "task-3", check);

const controls = (page: Page) => page.locator("#input-fields div.planet-control");
const planetSpan = (page: Page, i: number) =>
  page.locator(`#planets span.planet[data-index="${i}"]`);

// Egy span stílusosztályai.
const classesOf = async (page: Page, i: number) =>
  (await planetSpan(page, i).getAttribute("class"))?.split(/\s+/).filter((c) => c) ?? [];
const typeClasses = (classes: string[]) => classes.filter((c) => /^type-/.test(c));

// Vezérlőnként futtatja az ellenőrzést, a darabszám egyezése után.
async function perControl(
  page: Page,
  exp: Task3,
  fn: (control: ReturnType<typeof controls>, p: Planet, i: number) => Promise<void>,
) {
  await expect(controls(page), "number of .planet-control elements").toHaveCount(
    exp.planets.length,
  );
  for (const [i, p] of exp.planets.entries()) await fn(controls(page).nth(i), p, i);
}

// Bolygónként (span[data-index]) futtatja az ellenőrzést, a darabszám egyezése után.
async function perSpan(page: Page, exp: Task3, fn: (p: Planet, i: number) => Promise<void>) {
  await expect(
    page.locator("#planets span.planet"),
    "number of span.planet elements in #planets",
  ).toHaveCount(exp.planets.length);
  for (const [i, p] of exp.planets.entries()) await fn(p, i);
}

// Az eseménykezelő-részfeladatok (f-i) előfeltétele: a vezérlők és a bolygók száma
// a készlet adataiból jön (beégetett adatokra ezek se érjenek pontot).
async function expectGenerated(page: Page, exp: Task3) {
  await expect(controls(page), "number of .planet-control elements").toHaveCount(
    exp.planets.length,
  );
  await expect(
    page.locator("#planets span.planet"),
    "number of span.planet elements in #planets",
  ).toHaveCount(exp.planets.length);
}

// Delegálás ellenőrzése viselkedés alapján: a vezérlőt a helyén lecseréljük a
// klónjára. A klónon nincs addEventListener-rel vagy el.oninput = ... módon
// felrakott kezelő, az on* attribútumokat (inline kezelők) pedig levesszük róla,
// így csak egy ősre (#input-fields, body, document, ...) regisztrált kezelő
// reagálhat rá. A helye és a data-index értéke változatlan.
const replaceWithClone = (page: Page, selector: string, index: number) =>
  page.evaluate(
    ({ selector, index }) => {
      const original = document.querySelector(
        `#input-fields ${selector}[data-index="${index}"]`,
      );
      if (!original) return false;
      const clone = original.cloneNode(true) as HTMLElement;
      for (const el of [clone, ...clone.querySelectorAll("*")]) {
        for (const attr of [...el.attributes]) {
          if (attr.name.toLowerCase().startsWith("on")) el.removeAttribute(attr.name);
        }
      }
      clone.setAttribute("data-exam-clone", "");
      original.replaceWith(clone);
      return true;
    },
    { selector, index },
  );

const cloned = (page: Page) => page.locator("#input-fields [data-exam-clone]");

test.describe("3. feladat - Naprendszer-vezérlő / Task 3 - Solar System Control", () => {
  test("3a", async ({ page }) => {
    await binaryTask("a. Vezérlők a bolygónevekkel / a. Planet controls with names", 1, () =>
      task3(page, (exp) =>
        perControl(page, exp, async (control, p) => {
          await expect(control.locator("h3"), `h3 of ${p.name}`).toHaveText(p.name);
        }),
      ),
    );
  });

  test("3b", async ({ page }) => {
    await additiveTask("b. Típus legördülő lista / b. Type dropdown", undefined, [
      {
        name: "Típus opciók / Type options",
        points: 1,
        fn: () =>
          task3(page, (exp) =>
            perControl(page, exp, async (control, p, i) => {
              const select = control.locator("select.planet-color");
              await expect(select, `select data-index (${p.name})`).toHaveAttribute(
                "data-index",
                String(i),
              );
              await expect(select.locator("option"), `option texts of ${p.name}`).toHaveText(
                exp.types,
              );
              expect(
                await select.locator("option").evaluateAll((os) =>
                  os.map((o) => (o as HTMLOptionElement).value),
                ),
                `option values of ${p.name}`,
              ).toEqual(exp.types.map((_, j) => String(j)));
            }),
          ),
      },
      {
        name: "Saját típus kiválasztva / Own type selected",
        points: 1,
        fn: () =>
          task3(page, (exp) =>
            perControl(page, exp, async (control, p) => {
              await expect(
                control.locator("select.planet-color"),
                `selected type of ${p.name}`,
              ).toHaveValue(String(p.typeIndex));
            }),
          ),
      },
    ]);
  });

  test("3c", async ({ page }) => {
    await binaryTask("c. Pálya csúszka / c. Orbit slider", 1, () =>
      task3(page, (exp) =>
        perControl(page, exp, async (control, p, i) => {
          const slider = control.locator("input.planet-orbit");
          await expect(slider, `input.planet-orbit of ${p.name}`).toHaveCount(1);
          expect(
            await slider.evaluate((el: HTMLInputElement) => ({
              type: el.type,
              index: el.dataset.index,
              min: el.min,
              max: el.max,
              value: el.value,
            })),
            `slider of ${p.name}`,
          ).toEqual({ type: "range", index: String(i), min: "0", max: "500", value: String(p.slider) });
        }),
      ),
    );
  });

  test("3d", async ({ page }) => {
    await binaryTask("d. Gyűrűk jelölőnégyzet / d. Rings checkbox", 1, () =>
      task3(page, (exp) =>
        perControl(page, exp, async (control, p, i) => {
          const checkbox = control.locator("input.planet-rings");
          await expect(checkbox, `input.planet-rings of ${p.name}`).toHaveCount(1);
          expect(
            await checkbox.evaluate((el: HTMLInputElement) => ({
              type: el.type,
              index: el.dataset.index,
              checked: el.checked,
            })),
            `checkbox of ${p.name}`,
          ).toEqual({ type: "checkbox", index: String(i), checked: p.hasRings });
        }),
      ),
    );
  });

  test("3e", async ({ page }) => {
    await additiveTask("e. Bolygó span / e. Planet span", undefined, [
      {
        name: "Stílusosztályok / Classes",
        points: 1,
        fn: () =>
          task3(page, (exp) =>
            perSpan(page, exp, async (p, i) => {
              await expect(planetSpan(page, i), `title of planet ${p.name}`).toHaveAttribute(
                "title",
                p.name,
              );
              const classes = await classesOf(page, i);
              expect(typeClasses(classes), `type-* class of ${p.name}`).toEqual([
                `type-${p.typeIndex}`,
              ]);
              expect(classes.includes("rings"), `rings class of ${p.name}`).toBe(p.hasRings);
            }),
          ),
      },
      {
        name: "Pozíció és méret / Position and size",
        points: 1,
        fn: () =>
          task3(page, (exp) =>
            perSpan(page, exp, async (p, i) => {
              expect(
                await planetSpan(page, i).evaluate((el: HTMLElement) => ({
                  left: el.style.left,
                  width: el.style.width,
                  height: el.style.height,
                })),
                `style of ${p.name}`,
              ).toEqual({ left: `${p.orbit}px`, width: `${p.size}px`, height: `${p.size}px` });
            }),
          ),
      },
    ]);
  });

  // Minden csúszka más értéket kap; a végén minden bolygó a saját csúszkája
  // értékén álljon (rossz index, vagy az összes bolygó mozgatása itt bukik).
  test("3f", async ({ page }) => {
    await binaryTask("f. Csúszka mozgatja a bolygót / f. Slider moves the planet", 2, () =>
      task3(page, async (exp) => {
        await expectGenerated(page, exp);
        const values = exp.planets.map((_, i) => 10 + ((i * 37) % 480));
        for (const [i, value] of values.entries()) {
          await page
            .locator(`#input-fields .planet-orbit[data-index="${i}"]`)
            .fill(String(value));
        }
        for (const [i, value] of values.entries()) {
          expect(
            await planetSpan(page, i).evaluate((el: HTMLElement) => el.style.left),
            `left of planet #${i} after moving every slider`,
          ).toBe(`${value}px`);
        }
      }),
    );
  });

  test("3g", async ({ page }) => {
    await binaryTask("g. Lista módosítja a típust / g. Dropdown changes the type", 1, () =>
      task3(page, async (exp) => {
        await expectGenerated(page, exp);
        // Két váltás: másik típusra, majd egy harmadikra.
        for (const step of [1, 2]) {
          const value = (exp.planets[0].typeIndex + step) % exp.types.length;
          await page
            .locator(`#input-fields .planet-color[data-index="0"]`)
            .selectOption(String(value));
          expect(
            typeClasses(await classesOf(page, 0)),
            `type-* class of planet #0 after selecting ${value}`,
          ).toEqual([`type-${value}`]);
        }
      }),
    );
  });

  test("3h", async ({ page }) => {
    await binaryTask("h. Jelölőnégyzet kapcsolja a gyűrűt / h. Checkbox toggles rings", 1, () =>
      task3(page, async (exp) => {
        await expectGenerated(page, exp);
        const checkbox = page.locator(`#input-fields .planet-rings[data-index="0"]`);
        for (const round of [1, 2]) {
          await checkbox.click();
          const checked = await checkbox.isChecked();
          expect(
            (await classesOf(page, 0)).includes("rings"),
            `rings class of planet #0 after click ${round} (checked=${checked})`,
          ).toBe(checked);
        }
      }),
    );
  });

  // Delegálás: a helyén klónra cserélt vezérlőre is reagál (lásd replaceWithClone).
  test("3i", async ({ page }) => {
    await additiveTask("i. Delegálás / i. Delegation", undefined, [
      {
        name: "Csúszka / Slider",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expectGenerated(page, exp);
            const last = exp.planets.length - 1;
            const value = exp.planets[last].orbit === 77 ? 78 : 77;
            expect(await replaceWithClone(page, ".planet-orbit", last), "slider to clone").toBe(true);
            await cloned(page).fill(String(value));
            expect(
              await planetSpan(page, last).evaluate((el: HTMLElement) => el.style.left),
              "left after moving a replaced slider (only a delegated handler can react)",
            ).toBe(`${value}px`);
          }),
      },
      {
        name: "Legördülő lista / Dropdown",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expectGenerated(page, exp);
            const last = exp.planets.length - 1;
            const value = (exp.planets[last].typeIndex + 1) % exp.types.length;
            expect(await replaceWithClone(page, ".planet-color", last), "dropdown to clone").toBe(true);
            await cloned(page).selectOption(String(value));
            expect(
              typeClasses(await classesOf(page, last)),
              "type-* after a replaced dropdown (only a delegated handler can react)",
            ).toEqual([`type-${value}`]);
          }),
      },
      {
        name: "Jelölőnégyzet / Checkbox",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expectGenerated(page, exp);
            const last = exp.planets.length - 1;
            expect(await replaceWithClone(page, ".planet-rings", last), "checkbox to clone").toBe(true);
            await cloned(page).click();
            const checked = await cloned(page).isChecked();
            expect(
              (await classesOf(page, last)).includes("rings"),
              `rings after clicking a replaced checkbox (checked=${checked}, only a delegated handler can react)`,
            ).toBe(checked);
          }),
      },
    ]);
  });
});
