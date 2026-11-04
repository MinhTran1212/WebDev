import { writeFileSync } from "node:fs";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";
import type { StepResult } from "./grading";

type TaskInfo = {
  id: string;
  name: string;
  type: "binary" | "additive" | "scenario";
  score: number;
  maxScore: number;
  error?: string;
  steps?: StepResult[];
};

function stripAnsi(message: string): string {
  return message.replace(/\x1b\[[0-9;]*m/g, "");
}

// Egy "part" belső, tetszőlegesen mélyülő lépésfája - ugyanaz a formátum,
// mint a régi reporterben: minden valódi test.step/expect/info leképeződik.
type StepEntry = {
  type: "info" | "expect" | "step";
  title: string;
  status: "passed" | "failed";
  error?: string;
  steps?: StepEntry[];
};

type PartEntry = {
  id: string;
  name: string;
  success: boolean;
  points: number;
  error?: string;
  steps: StepEntry[];
};

// Egy binaryTask/additiveTask/scenarioTask hívás - ugyanaz a forma, mint
// korábban egy egész Playwright teszt eredménye volt.
type TaskEntry = {
  type: TaskInfo["type"];
  title: string;
  status: "passed" | "failed";
  score: number;
  maxScore: number;
  parts: PartEntry[];
};

type InfoEntry = {
  type: "info";
  title: string;
};

type SuiteEntry = {
  title: string;
  tests: (TaskEntry | InfoEntry)[];
  suites?: SuiteEntry[];
};

/**
 * Egyedi Playwright reporter, amely a tesztek eredményét a régi, "parts"
 * alapú JSON formátumban írja ki, de immár tetszőleges számú
 * binaryTask/additiveTask/scenarioTask hívást és test.step csoportosítást
 * enged meg egyetlen valódi Playwright teszten belül is.
 */
export default class GradingReporter implements Reporter {
  // Minden ténylegesen lefutott task (score/maxScore összesítéshez), a fa
  // szerkezettől függetlenül.
  private allTasks: TaskEntry[] = [];
  // Egy-egy valódi Playwright teszthez tartozó "suite" csomópont (a teszt
  // címe lesz a title-je), a szülő Suite szerint később besorolva.
  private testEntries: (SuiteEntry & { _parentSuite: Suite })[] = [];
  private rootSuite?: Suite;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.allTasks = [];
    this.testEntries = [];
    this.rootSuite = suite;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const taskInfoById = new Map<string, TaskInfo>(
      test.annotations
        .filter((a) => a.type === "task-info")
        .map((a) => JSON.parse(a.description ?? "{}"))
        .map((info: TaskInfo) => [info.id, info]),
    );

    const { tests, suites } = this._walkSteps(result.steps, taskInfoById);

    this.testEntries.push({
      title: test.title,
      tests,
      ...(suites.length > 0 && { suites }),
      _parentSuite: test.parent,
    });
  }

  /**
   * Egy lépéslista (akár egy teszt gyökere, akár egy test.step gyereklistája)
   * feldolgozása: a "[task:ID]" jelölésű lépésekből TaskEntry, a "[info]"
   * jelölésűekből InfoEntry lesz, minden más test.step pedig egy beágyazott
   * SuiteEntry-t hoz létre (csoportosítás).
   */
  private _walkSteps(
    steps: TestStep[],
    taskInfoById: Map<string, TaskInfo>,
  ): { tests: (TaskEntry | InfoEntry)[]; suites: SuiteEntry[] } {
    const tests: (TaskEntry | InfoEntry)[] = [];
    const suites: SuiteEntry[] = [];

    for (const step of steps ?? []) {
      if (step.category !== "test.step") continue;

      const taskMatch = step.title.match(/^\[task:([^\]]+)\]\s*(.*)$/);
      const info = taskMatch ? taskInfoById.get(taskMatch[1]) : undefined;
      if (taskMatch && info) {
        const task = this._buildTaskEntry(info, step, taskInfoById);
        this.allTasks.push(task);
        tests.push(task);
        continue;
      }

      if (step.title.startsWith("[info]")) {
        tests.push({
          type: "info",
          title: step.title.slice("[info]".length).trim(),
        });
        continue;
      }

      const child = this._walkSteps(step.steps ?? [], taskInfoById);
      suites.push({
        title: step.title,
        tests: child.tests,
        ...(child.suites.length > 0 && { suites: child.suites }),
      });
    }

    return { tests, suites };
  }

  private _buildTaskEntry(
    info: TaskInfo,
    taskStep: TestStep,
    taskInfoById: Map<string, TaskInfo>,
  ): TaskEntry {
    const parts: PartEntry[] =
      info.steps && info.steps.length > 0
        ? info.steps.map((sr) => {
            const partStep = this._findTaskStepById(
              taskStep.steps ?? [],
              sr.id,
            );
            return {
              id: sr.id,
              name: sr.name,
              success: sr.success,
              points: sr.points,
              error: sr.error,
              steps: this._buildStepEntries(
                partStep?.steps ?? [],
                taskInfoById,
              ),
            };
          })
        : [
            {
              id: "part-1",
              name: info.name,
              success: !info.error,
              points: info.score,
              error: info.error,
              steps: this._buildStepEntries(taskStep.steps ?? [], taskInfoById),
            },
          ];

    return {
      type: info.type,
      title: info.name,
      status: info.error ? "failed" : "passed",
      score: info.score,
      maxScore: info.maxScore,
      parts,
    };
  }

  private _findTaskStepById(
    steps: TestStep[],
    id: string,
  ): TestStep | undefined {
    for (const step of steps) {
      const match = step.title.match(/^\[task:([^\]]+)\]/);
      if (match && match[1] === id) return step;

      const found = this._findTaskStepById(step.steps ?? [], id);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * A valódi test.step/expect fát alakítja megjeleníthető StepEntry fává -
   * ez adja a "parts[].steps" részletes bontását (pl. a felhasználó által
   * a task fn-jébe ágyazott saját test.step/info hívások is itt jelennek meg).
   */
  private _buildStepEntries(
    steps: TestStep[],
    taskInfoById: Map<string, TaskInfo>,
  ): StepEntry[] {
    return (steps ?? [])
      .filter((s) => s.category === "test.step" || s.category === "expect")
      .map((s) => {
        // Beágyazott task ne "step"-ként jelenjen meg (elvileg csak
        // additive/scenario belső részeinél fordulhat elő, azokat a
        // _buildTaskEntry már külön kezeli, itt csak a címkét tisztítjuk).
        const taskMatch = s.title.match(/^\[task:[^\]]+\]\s*(.*)$/);
        const isInfo = s.title.startsWith("[info]");
        const rawTitle = taskMatch
          ? taskMatch[1]
          : isInfo
            ? s.title.slice("[info]".length).trim()
            : s.title;

        const entry: StepEntry = {
          type: isInfo ? "info" : s.category === "expect" ? "expect" : "step",
          title: rawTitle,
          status: s.error ? "failed" : "passed",
        };

        const childEntries = this._buildStepEntries(
          s.steps ?? [],
          taskInfoById,
        );
        if (childEntries.length > 0) entry.steps = childEntries;
        if (s.error)
          entry.error = stripAnsi(s.error.message?.split("\n")[0] ?? "");

        return entry;
      });
  }

  /**
   * Rekurzívan csoportosítja a valódi Playwright teszteket a Suite
   * (describe) hierarchia alapján - minden teszt egy önálló SuiteEntry,
   * amelynek "tests" mezőjében a benne lévő task/info hívások vannak.
   */
  private _buildSuiteTree(suite: Suite): SuiteEntry | null {
    const testsInSuite = this.testEntries.filter(
      (t) => t._parentSuite === suite,
    );

    const childSuites: SuiteEntry[] = [];
    for (const child of suite.suites) {
      const built = this._buildSuiteTree(child);
      if (built) childSuites.push(built);
    }

    const testSuites: SuiteEntry[] = testsInSuite.map(
      ({ title, tests, suites }) => ({
        title,
        tests,
        ...(suites && { suites }),
      }),
    );

    const allChildSuites = [...testSuites, ...childSuites];

    if (allChildSuites.length === 0) {
      return null;
    }

    return {
      title: suite.title || "Root",
      tests: [],
      suites: allChildSuites,
    };
  }

  onEnd(result: FullResult): void {
    const totalMax = this.allTasks.reduce((s, t) => s + t.maxScore, 0);
    const totalEarned = this.allTasks.reduce((s, t) => s + t.score, 0);
    const passed = this.allTasks.filter((t) => t.status === "passed").length;
    const failed = this.allTasks.filter((t) => t.status === "failed").length;

    let structuredSuites: SuiteEntry[] = [];
    if (this.rootSuite) {
      structuredSuites = this.rootSuite.suites
        .map((fileSuite) => this._buildSuiteTree(fileSuite))
        .filter((s): s is SuiteEntry => s !== null);
    }

    const output: any = {
      summary: {
        status: result.status,
        total: this.allTasks.length,
        passed,
        failed,
        earnedPoints: totalEarned,
        maxPoints: totalMax,
        percentage:
          totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0,
      },
      suites: structuredSuites,
    };

    const json = JSON.stringify(output, null, 2);
    const outputFile =
      process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || "results.json";
    writeFileSync(outputFile, json, "utf-8");
  }
}
