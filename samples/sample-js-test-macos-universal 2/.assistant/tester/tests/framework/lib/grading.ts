import { test, expect } from "@playwright/test";

/**
 * Informatív üzenet elhelyezése a teszt lépései között.
 * A JSON kimenetben "info" típusú lépésként jelenik meg.
 *
 * @param {string} message - Az információs üzenet szövege
 */
export async function info(message: string) {
  await test.step(`[info] ${message}`, async () => {});
}

// ---- Types ----
export type StepResult = {
  id: string;
  name: string;
  success: boolean;
  points: number;
  error?: string;
};

export type TaskResult = {
  name: string;
  type: "binary" | "additive" | "scenario";
  score: number;
  maxScore: number;
  steps: StepResult[];
};

// ---- Helpers ----

// Egyre nagyobb, futásonként egyedi azonosítók a "[task:ID]" jelölésű
// test.step-ekhez, hogy a reporter párosítani tudja őket a task-info
// annotációval, akár több task fut is egyetlen Playwright teszten belül.
let taskCounter = 0;
function nextTaskId(): string {
  taskCounter += 1;
  return `task-${taskCounter}`;
}

// A színkódokat (pl. piros/zöld diff az expect üzenetekben) eltávolítjuk,
// mert a JSON riportban nincs terminál, ami értelmezné őket.
function stripAnsi(message: string): string {
  return message.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Lefuttat egy task-törzset egyetlen, "[task:ID]" jelölésű test.step-ként,
 * anélkül hogy a hibája megszakítaná a hívó Playwright tesztet.
 *
 * A sikeresség eldöntése két forrásból történik:
 * - ha a fn hard hibát dob (pl. sima `expect`), azt elkapjuk, és
 *   `expect.soft`-ként újra bejelentjük, hogy a teszt saját
 *   pass/fail állapota (és ezáltal a kilépési kód) is tükrözze;
 * - ha a fn `expect.soft`-ot használ, azt a `testInfo.errors` hosszának
 *   változásából vesszük észre.
 */
async function runTrackedStep(
  id: string,
  title: string,
  fn: () => Promise<void> | void,
): Promise<{ success: boolean; error?: string }> {
  const testInfo = test.info();
  const errorsBefore = testInfo.errors.length;
  let hardError: string | undefined;

  try {
    await test.step(`[task:${id}] ${title}`, async () => {
      await fn();
    });
  } catch (e: any) {
    hardError = stripAnsi(e?.message ?? String(e));
    // Csak a Playwright saját pass/fail állapotát (és kilépési kódját)
    // jelezzük itt - a tényleges hibaszöveget a `hardError`-ból vesszük,
    // hogy ne duplázódjon bele ennek az önmagában értelmetlen toBe-nek a diffje.
    expect.soft(false, `"${title}" nem teljesült`).toBe(true);
  }

  // A hard hiba esetén a fenti expect.soft éppen egy plusz (szintetikus)
  // bejegyzést tett a testInfo.errors-be - azt itt kihagyjuk.
  const softErrors = testInfo.errors
    .slice(errorsBefore, hardError ? -1 : undefined)
    .map((e) => stripAnsi(e.message ?? ""));

  const messages = hardError ? [...softErrors, hardError] : softErrors;
  const success = messages.length === 0;
  const error = success ? undefined : messages.join("\n---\n");

  return { success, error };
}

// ---- Binary ----
export async function binaryTask(
  name: string,
  maxPoints: number,
  fn: () => Promise<void> | void,
) {
  const id = nextTaskId();
  const { success, error } = await runTrackedStep(id, name, fn);

  test.info().annotations.push({
    type: "task-info",
    description: JSON.stringify({
      id,
      name,
      type: "binary",
      score: success ? maxPoints : 0,
      maxScore: maxPoints,
      error,
    }),
  });
}

// ---- Additive ----
export type AdditiveStep = {
  name: string;
  points: number;
  fn: () => Promise<void> | void;
  dependsOn?: number; // index of previous step
};

export async function additiveTask(
  name: string,
  initialize: (() => Promise<void> | void) | undefined,
  stepsDef: AdditiveStep[],
) {
  const id = nextTaskId();
  const steps: StepResult[] = [];
  let score = 0;
  let maxScore = 0;

  await test.step(`[task:${id}] ${name}`, async () => {
    for (let i = 0; i < stepsDef.length; i++) {
      const step = stepsDef[i];
      const stepId = `${id}-${i + 1}`;
      maxScore += step.points;

      if (initialize) {
        const initRes = await runTrackedStep(
          `${stepId}-init`,
          `${step.name} (initialize)`,
          initialize,
        );
        if (!initRes.success) {
          steps.push({
            id: stepId,
            name: step.name,
            success: false,
            points: 0,
            error: initRes.error,
          });
          continue;
        }
      }

      // dependency guard
      if (step.dependsOn !== undefined) {
        const dep = steps[step.dependsOn];
        if (!dep?.success) {
          steps.push({
            id: stepId,
            name: step.name,
            success: false,
            points: 0,
            error: "Skipped due to dependency failure",
          });
          continue;
        }
      }

      const res = await runTrackedStep(stepId, step.name, step.fn);

      steps.push({
        id: stepId,
        name: step.name,
        success: res.success,
        points: res.success ? step.points : 0,
        error: res.error,
      });

      if (res.success) score += step.points;
    }
  });

  test.info().annotations.push({
    type: "task-info",
    description: JSON.stringify({
      id,
      name,
      type: "additive",
      score,
      maxScore,
      steps,
    }),
  });
}

// ---- Scenario ----
export type Scenario = {
  name: string;
  points: number;
  fn: () => Promise<void> | void;
  initializer?: () => Promise<void> | void;
};

export async function scenarioTask(name: string, scenarios: Scenario[]) {
  const id = nextTaskId();
  const steps: StepResult[] = [];
  const maxScore = Math.max(...scenarios.map((s) => s.points));
  let score = 0;

  await test.step(`[task:${id}] ${name}`, async () => {
    for (const scenario of [...scenarios].sort((a, b) => b.points - a.points)) {
      const stepId = `${id}-${steps.length + 1}`;

      if (scenario.initializer) {
        await scenario.initializer();
      }

      const res = await runTrackedStep(stepId, scenario.name, scenario.fn);

      steps.push({
        id: stepId,
        name: scenario.name,
        success: res.success,
        points: res.success ? scenario.points : 0,
        error: res.error,
      });

      if (res.success) {
        score = scenario.points;
        break;
      }
    }
  });

  test.info().annotations.push({
    type: "task-info",
    description: JSON.stringify({
      id,
      name,
      type: "scenario",
      score,
      maxScore,
      steps,
    }),
  });
}

export default {
  info,
  test,
  expect,
  binaryTask,
  additiveTask,
  scenarioTask,
};
