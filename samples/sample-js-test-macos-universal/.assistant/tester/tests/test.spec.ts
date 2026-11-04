import { expect, test, type Page } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { additiveTask, binaryTask } from "./framework/lib/grading";

// Minden részfeladat külön teszt. Csak a kiírásban bontott pontok additívak.
// Az original készlet nyilvános, a hidden-* készletek csak az értékelőre kerülnek.
// Az adatfájl (data.js / dataEN.js) dönti el az elvárt eredmények nyelvét.
// A státuszszövegek nyelvét a HTML lang attribútuma adja meg.
// Adatmódosítás után: node tools/build-expected.mjs, majd npm test a frameworkből.
const open = (page: Page, task: string) => page.goto(`/${task}/`);
const root = path.join(__dirname, "datasets");
const sets = readdirSync(root).sort((a, b) =>
  a === "original" ? -1 : b === "original" ? 1 : a.localeCompare(b),
);
async function forEachSet<T>(
  page: Page,
  task: string,
  check: (exp: T) => Promise<void>,
) {
  for (const name of sets) {
    try {
      await page.unrouteAll({ behavior: "ignoreErrors" });
      let lang: "hu" | "en" | undefined;
      for (const [file, fileLang] of [
        ["data.js", "hu"],
        ["dataEN.js", "en"],
      ] as const) {
        await page.route(`**/${task}/${file}`, (route) => {
          lang = fileLang;
          return route.fulfill({
            path: path.join(root, name, task, file),
            contentType: "application/javascript; charset=utf-8",
          });
        });
      }
      await open(page, task);
      const exp = JSON.parse(
        readFileSync(path.join(root, name, "expected.json"), "utf-8"),
      );
      if (!lang)
        throw new Error(
          "The page does not load data.js or dataEN.js / Az oldal nem tölt be adatfájlt",
        );
      await check(exp[task][lang]);
    } catch (e) {
      if (name === "original") throw e;
      throw new Error(
        "Hibás eredmény egy másik adatkészlettel / Wrong result with another dataset",
      );
    }
  }
}

type Task1 = {
  a: boolean;
  b: boolean;
  c: string[];
  d: number;
  e: string;
  f: string;
};
const task1 = (page: Page, check: (exp: Task1) => Promise<void>) =>
  forEachSet(page, "task-1", check);
const readDd = (page: Page, id: string) =>
  page.locator(`#task${id}`).textContent();
const bool = (s: string | null) => {
  const t = s?.trim().toLowerCase();
  if (["true", "igaz", "igen"].includes(t ?? "")) return true;
  if (["false", "hamis", "nem"].includes(t ?? "")) return false;
  return t;
};

test.describe("1. feladat - Könyvtári körkép / Task 1 - Library Overview", () => {
  for (const [id, points, name] of [
    ["a", 1, "Legalább két régi könyv"],
    ["b", 2, "Minden szerzőnek van regénye"],
    ["c", 2, "Hosszú regények szerzői"],
    ["d", 2, "Összes oldalszám"],
    ["e", 2, "Legtöbb oldal szerzője"],
    ["f", 3, "Régi regények átlaga"],
  ] as const) {
    test(`1${id}`, async ({ page }) => {
      await binaryTask(`${id}. ${name}`, points, () =>
        task1(page, async (exp) => {
          const value = await readDd(page, id.toUpperCase());
          if (id === "a" || id === "b") expect(bool(value)).toBe(exp[id]);
          else if (id === "c") {
            const items = await page.locator("#taskC").evaluate((el) => {
              const children = [...el.children];
              return children.length > 1
                ? children.map((c) => c.textContent?.trim()).filter(Boolean)
                : el.textContent
                    ?.split(/[,;\n]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            });
            expect(items).toEqual(exp.c);
          } else expect(value?.trim()).toBe(String(exp[id]));
        }),
      );
    });
  }
});

// A státuszszöveg nyelve a HTML lang attribútumát követi.
async function message(page: Page, hu: string) {
  if ((await page.locator("html").getAttribute("lang")) !== "en") return hu;
  return hu
    .replace(
      "Előbb adj meg legalább egy címet!",
      "Add at least one title first!",
    )
    .replace("A program belefér!", "The program fits!")
    .replace("Rövid az időkeret!", "Not enough time!")
    .replace(" perc)", " minutes)")
    .replace("Minden könyv a helyén!", "All books are in place!");
}

const add = async (page: Page, title: string) => {
  await page.locator("#work-input").fill(title);
  await page.locator("#add-work").click();
};
const items = (page: Page) => page.locator("#reading-list li");
const ready = /(^|\s)ready(\s|$)/;
const fast = /(^|\s)fast(\s|$)/;
const controlIds = [
  "minutes",
  "pace",
  "edition",
  "work-input",
  "add-work",
  "check",
];
const editable = async (page: Page) => {
  for (const id of controlIds)
    await expect(page.locator(`#${id}`)).toBeEnabled();
};
async function configure(
  page: Page,
  count: number,
  pages: number,
  pace: number,
  minutes: number,
) {
  await open(page, "task-2");
  for (let i = 0; i < count; i++) await add(page, `Cím ${i}`);
  await page
    .locator("#edition option")
    .first()
    .evaluate((el, n) => {
      (el as HTMLElement).dataset.pages = String(n);
    }, pages);
  await page.locator("#pace").fill(String(pace));
  await page.locator("#minutes").fill(String(minutes));
  await page.locator("#check").click();
}

test.describe("2. feladat - Olvasóest-tervező / Task 2 - Reading Evening Planner", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "task-2");
  });
  test("2a", async ({ page }) => {
    await binaryTask("a. Cím felvétele", 1, async () => {
      await add(page, "Emma");
      await add(page, "Hamlet");
      await expect(items(page)).toHaveText(["Emma", "Hamlet"]);
    });
  });
  test("2b", async ({ page }) => {
    await additiveTask(
      "b. Címek ellenőrzése",
      () => open(page, "task-2").then(() => {}),
      [
        {
          name: "Trim és üres cím",
          points: 1,
          fn: async () => {
            await add(page, "  Emma  ");
            await add(page, "   ");
            await add(page, "");
            await expect(items(page)).toHaveText(["Emma"]);
          },
        },
        {
          name: "Duplikáció és mező ürítése",
          points: 1,
          fn: async () => {
            await add(page, "Emma");
            await expect(page.locator("#work-input")).toHaveValue("");
            await add(page, "  eMMA  ");
            await expect(items(page)).toHaveText(["Emma"]);
            await expect(page.locator("#work-input")).toHaveValue("  eMMA  ");
            await add(page, "A  per");
            await add(page, "A per");
            await expect(items(page)).toHaveText(["Emma", "A  per", "A per"]);
          },
        },
      ],
    );
  });
  test("2c", async ({ page }) => {
    await binaryTask("c. Darabszám és kapacitás", 1, async () => {
      await expect(page.locator("#work-count")).toHaveText("0");
      for (let i = 1; i <= 4; i++) {
        await expect(page.locator("#add-work")).toBeEnabled();
        await add(page, `Cím ${i}`);
        await expect(page.locator("#work-count")).toHaveText(String(i));
      }
      await expect(page.locator("#add-work")).toBeDisabled();
      await page.locator("#work-input").fill("Ötödik");
      await page.locator("#add-work").evaluate((el) => {
        (el as HTMLButtonElement).disabled = false;
      });
      await page.locator("#add-work").click();
      await expect(items(page)).toHaveCount(4);
      await expect(page.locator("#work-count")).toHaveText("4");
    });
  });
  test("2d", async ({ page }) => {
    await binaryTask("d. Kiadás borítója", 1, async () => {
      const options = await page
        .locator("#edition option")
        .evaluateAll((os) =>
          os.map((o) => ({
            value: (o as HTMLOptionElement).value,
            text: o.textContent ?? "",
          })),
        );
      for (const o of [...options.slice(1), options[0]]) {
        await page.locator("#edition").selectOption(o.value);
        await expect(page.locator("#cover")).toHaveAttribute("src", o.value);
        expect((await page.locator("#cover").getAttribute("alt"))?.trim()).toBe(
          o.text.trim(),
        );
      }
    });
  });
  test("2e", async ({ page }) => {
    await additiveTask("e. Időkeret", undefined, [
      {
        name: "Kijelző",
        points: 1,
        fn: async () => {
          for (const n of [130, 35]) {
            await page.locator("#minutes").fill(String(n));
            await expect(page.locator("#minutes-value")).toHaveText(String(n));
          }
        },
      },
      {
        name: "Oszlop magassága",
        points: 1,
        fn: async () => {
          for (const n of [210, 45]) {
            await page.locator("#minutes").fill(String(n));
            expect(
              await page
                .locator("#time-bar")
                .evaluate((el: HTMLElement) => el.style.height),
            ).toBe(`${n}px`);
          }
        },
      },
    ]);
  });
  test("2f", async ({ page }) => {
    await additiveTask("f. Olvasási sebesség", undefined, [
      {
        name: "Kijelző és szélesség",
        points: 1,
        fn: async () => {
          for (const n of [5, 1]) {
            await page.locator("#pace").fill(String(n));
            await expect(page.locator("#pace-value")).toHaveText(String(n));
            expect(
              await page
                .locator("span.page")
                .evaluateAll((es) =>
                  es.map((el) => (el as HTMLElement).style.width),
                ),
            ).toEqual([`${n * 20}px`, `${n * 20}px`]);
          }
        },
      },
      {
        name: "Fast osztály",
        points: 1,
        fn: async () => {
          for (const n of [4, 3, 6, 1]) {
            await page.locator("#pace").fill(String(n));
            await expect(page.locator("span.page")).toHaveCount(2);
            for (const el of await page.locator("span.page").all()) {
              if (n >= 4) await expect(el).toHaveClass(fast);
              else await expect(el).not.toHaveClass(fast);
            }
          }
        },
      },
    ]);
  });
  test("2g", async ({ page }) => {
    await additiveTask("g. Program ellenőrzése", undefined, [
      {
        name: "Üres lista",
        points: 1,
        fn: async () => {
          await page.locator("#check").click();
          await expect(page.locator("#status")).toHaveText(
            await message(page, "Előbb adj meg legalább egy címet!"),
          );
          await expect(page.locator("#planner")).not.toHaveClass(ready);
          await editable(page);
        },
      },
      {
        name: "Idő számítása",
        points: 1,
        fn: async () => {
          for (const [count, pages, pace] of [
            [1, 173, 3],
            [3, 127, 2],
          ]) {
            await configure(page, count, pages, pace, 30);
            await expect(page.locator("#status")).toContainText(
              (pages / pace + count * 5).toFixed(2),
            );
          }
          // A másik kiadás oldalszámát használja, ne mindig az elsőét.
          await open(page, "task-2");
          await add(page, "Másik kötet");
          await page.locator("#edition").selectOption("img/metamorphosis.svg");
          await page.locator("#check").click();
          await expect(page.locator("#status")).toHaveText(
            await message(page, "A program belefér! (53.00 perc)"),
          );
        },
      },
      {
        name: "Döntés és ready osztály",
        points: 1,
        fn: async () => {
          for (const [minutes, success] of [
            [84, false],
            [85, true],
          ] as const) {
            await configure(page, 1, 160, 2, minutes);
            await expect(page.locator("#status")).toHaveText(
              await message(
                page,
                `${success ? "A program belefér!" : "Rövid az időkeret!"} (85.00 perc)`,
              ),
            );
            if (success)
              await expect(page.locator("#planner")).toHaveClass(ready);
            else await expect(page.locator("#planner")).not.toHaveClass(ready);
          }
        },
      },
      {
        name: "Kerekítés és pontos összehasonlítás",
        points: 1,
        fn: async () => {
          await configure(page, 1, 150.008, 2, 80);
          await expect(page.locator("#status")).toHaveText(
            await message(page, "Rövid az időkeret! (80.00 perc)"),
          );
          await expect(page.locator("#planner")).not.toHaveClass(ready);
          await configure(page, 2, 101, 3, 60);
          await expect(page.locator("#status")).toHaveText(
            await message(page, "A program belefér! (43.67 perc)"),
          );
        },
      },
    ]);
  });
  test("2h", async ({ page }) => {
    await binaryTask("h. Vezérlők letiltása", 1, async () => {
      await configure(page, 1, 160, 2, 30);
      await editable(page);
      await page.locator("#minutes").fill("85");
      await page.locator("#check").click();
      for (const id of controlIds)
        await expect(page.locator(`#${id}`)).toBeDisabled();
    });
  });
});

type Shelf = { author: string; row: number; col: number };
type Book = Shelf & { title: string };
type Library = { rows: number; cols: number; shelves: Shelf[]; books: Book[] };
const task3 = (page: Page, check: (exp: Library) => Promise<void>) =>
  forEachSet(page, "task-3", check);
const cell = (page: Page, p: { row: number; col: number }) =>
  page.locator("#map tr").nth(p.row).locator("td").nth(p.col);
const book = (page: Page, b: Book) =>
  page.locator("#map button.book").filter({ hasText: b.title });
const selected = /(^|\s)selected(\s|$)/;
const shelfOf = (exp: Library, b: Book) =>
  exp.shelves.find((s) => s.author === b.author)!;
function emptyCell(exp: Library) {
  for (let row = 0; row < exp.rows; row++)
    for (let col = 0; col < exp.cols; col++) {
      if (
        ![...exp.books, ...exp.shelves].some(
          (p) => p.row === row && p.col === col,
        )
      )
        return { row, col };
    }
  throw new Error("No empty cell in fixture");
}
const stored = async (
  page: Page,
  b: Book,
  s: Shelf | { row: number; col: number },
) => {
  await expect(
    cell(page, s).locator("button.book").filter({ hasText: b.title }),
  ).toHaveCount(1);
  await expect(book(page, b)).toHaveCount(1);
};
function recordListeners() {
  const rec: { id: string | null; type: string }[] = [];
  (window as any).__examListeners = rec;
  const original = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (
    this: any,
    type: string,
    listener: any,
    options?: any,
  ) {
    rec.push({ id: this?.id ?? null, type });
    return original.call(this, type, listener, options);
  };
}
const expectDelegation = async (page: Page) => {
  expect(
    await page.evaluate(() => {
      const rec = (window as any).__examListeners ?? [];
      return (
        rec.some((l: any) => l.id === "map" && l.type === "click") ||
        typeof (document.querySelector("#map") as any)?.onclick === "function"
      );
    }),
  ).toBe(true);
};

test.describe("3. feladat - Könyvek visszapakolása / Task 3 - Putting the Books Back", () => {
  test("3a", async ({ page }) => {
    await binaryTask("a. Táblázat generálása", 1, () =>
      task3(page, async (exp) => {
        await expect(page.locator("#map tr")).toHaveCount(exp.rows);
        for (const tr of await page.locator("#map tr").all())
          await expect(tr.locator("td")).toHaveCount(exp.cols);
      }),
    );
  });
  test("3b", async ({ page }) => {
    await additiveTask("b. Polcok", undefined, [
      {
        name: "Shelf osztály",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expect(page.locator("#map td.shelf")).toHaveCount(
              exp.shelves.length,
            );
            for (const s of exp.shelves)
              await expect(cell(page, s)).toHaveClass(/(^|\s)shelf(\s|$)/);
          }),
      },
      {
        name: "Szerző",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            for (const s of exp.shelves)
              await expect(cell(page, s)).toHaveAttribute(
                "data-author",
                s.author,
              );
          }),
      },
    ]);
  });
  test("3c", async ({ page }) => {
    await additiveTask("c. Könyvek", undefined, [
      {
        name: "Gomb, cím és title",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expect(page.locator("#map button.book")).toHaveCount(
              exp.books.length,
            );
            for (const b of exp.books) {
              await expect(book(page, b)).toHaveText(b.title);
              await expect(book(page, b)).toHaveAttribute("type", "button");
              await expect(book(page, b)).toHaveAttribute(
                "title",
                `${b.author}: ${b.title}`,
              );
            }
          }),
      },
      {
        name: "Pozíció és szerző",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            for (const b of exp.books) {
              await stored(page, b, b);
              await expect(book(page, b)).toHaveAttribute(
                "data-author",
                b.author,
              );
            }
          }),
      },
    ]);
  });
  test("3d", async ({ page }) => {
    await additiveTask("d. Kijelölés", undefined, [
      {
        name: "Ki-be kapcsolás",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            const b = book(page, exp.books[0]);
            await b.click();
            await expect(b).toHaveClass(selected);
            await b.click();
            await expect(b).not.toHaveClass(selected);
          }),
      },
      {
        name: "Egyetlen kijelölés",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await book(page, exp.books[0]).click();
            await book(page, exp.books[1]).click();
            await expect(book(page, exp.books[0])).not.toHaveClass(selected);
            await expect(book(page, exp.books[1])).toHaveClass(selected);
            await expect(page.locator("#map .book.selected")).toHaveCount(1);
          }),
      },
    ]);
  });
  test("3e", async ({ page }) => {
    await additiveTask("e. Asztalon mozgatás", undefined, [
      {
        name: "Áthelyezés üres cellába",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            const b = exp.books[0],
              dest = emptyCell(exp);
            await book(page, b).click();
            await cell(page, dest).click();
            await stored(page, b, dest);
            await expect(book(page, b)).not.toHaveClass(selected);
            await expect(cell(page, b).locator(".book")).toHaveCount(0);
            await book(page, b).click();
            await cell(page, b).click();
            await stored(page, b, b);
          }),
      },
      {
        name: "Üres kijelölés és foglalt cella",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            const [a, b] = exp.books;
            await cell(page, emptyCell(exp)).click();
            for (const b of exp.books) await stored(page, b, b);
            await book(page, a).click();
            await cell(page, b).click({ position: { x: 2, y: 2 } });
            await stored(page, a, a);
            await expect(book(page, a)).toHaveClass(selected);
            await book(page, b).click();
            await stored(page, a, a);
            await stored(page, b, b);
            await expect(book(page, b)).toHaveClass(selected);
          }),
      },
    ]);
  });
  test("3f", async ({ page }) => {
    await additiveTask("f. Polcra helyezés", undefined, [
      {
        name: "Megfelelő szerző és több könyv",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            for (const b of exp.books) {
              await book(page, b).dispatchEvent("click");
              await cell(
                page,
                exp.shelves.find((s) => s.author !== b.author)!,
              ).dispatchEvent("click");
              await stored(page, b, b);
              await expect(book(page, b)).toHaveClass(selected);
              await cell(page, shelfOf(exp, b)).dispatchEvent("click");
              await stored(page, b, shelfOf(exp, b));
              await expect(book(page, b)).not.toHaveClass(selected);
            }
            for (const b of exp.books) await stored(page, b, shelfOf(exp, b));
          }),
      },
      {
        name: "Polcon lévő könyv rögzített",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            const [a, b] = exp.books;
            await book(page, a).dispatchEvent("click");
            await cell(page, shelfOf(exp, a)).dispatchEvent("click");
            await book(page, a).dispatchEvent("click");
            await expect(book(page, a)).not.toHaveClass(selected);
            await cell(page, emptyCell(exp)).dispatchEvent("click");
            await stored(page, a, shelfOf(exp, a));
            await book(page, b).dispatchEvent("click");
            await book(page, a).dispatchEvent("click");
            await stored(page, b, b);
            await expect(book(page, b)).toHaveClass(selected);
            await stored(page, a, shelfOf(exp, a));
          }),
      },
      {
        name: "Befejezés üzenete",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expect(page.locator("#status")).toHaveText("");
            for (const [i, b] of [...exp.books].reverse().entries()) {
              await book(page, b).dispatchEvent("click");
              await cell(page, shelfOf(exp, b)).dispatchEvent("click");
              await expect(page.locator("#status")).toHaveText(
                await message(
                  page,
                  i === exp.books.length - 1 ? "Minden könyv a helyén!" : "",
                ),
              );
            }
          }),
      },
    ]);
  });
  test("3g", async ({ page }) => {
    await page.addInitScript(recordListeners);
    await additiveTask("g. Delegálás", undefined, [
      {
        name: "Könyvkattintás",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expectDelegation(page);
            await book(page, exp.books[0]).evaluate((el) =>
              el.replaceWith(el.cloneNode(true)),
            );
            await book(page, exp.books[0]).click();
            await expect(book(page, exp.books[0])).toHaveClass(selected);
            await book(page, exp.books[0]).click();
            await expect(book(page, exp.books[0])).not.toHaveClass(selected);
          }),
      },
      {
        name: "Cellakattintás",
        points: 1,
        fn: () =>
          task3(page, async (exp) => {
            await expectDelegation(page);
            const b = exp.books[0],
              dest = emptyCell(exp),
              shelf = shelfOf(exp, b);
            for (const p of [dest, shelf])
              await cell(page, p).evaluate((el) =>
                el.replaceWith(el.cloneNode(true)),
              );
            await book(page, b).click();
            await cell(page, dest).click();
            await stored(page, b, dest);
            await book(page, b).click();
            await cell(page, shelf).click();
            await stored(page, b, shelf);
          }),
      },
    ]);
  });
});
