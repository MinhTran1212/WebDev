// Written by ExamAssistant. Serves the student's folder for template-based tests,
// with no dependencies (works offline) and no "clean URL" redirects
// (/task-1/ -> /task-1/index.html, never a directory listing).
// Like the grading sandbox, /data/* comes from the exam's tests/data if it exists.
//
// Environment: SUBMISSION_DIR, PORT, EXAM_DATA_DIR (optional).

import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";

const root = resolve(process.env.SUBMISSION_DIR ?? ".");
const port = Number(process.env.PORT ?? 4173);
const dataDir = process.env.EXAM_DATA_DIR ? resolve(process.env.EXAM_DATA_DIR) : undefined;

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}
if (!isDir(root)) {
  console.error(`Submission folder not found: ${root}`);
  process.exit(1);
}
const data = dataDir && isDir(dataDir) ? dataDir : undefined;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end(body);
}

// Path inside `base`, or undefined for ../ tricks.
function inside(base, pathname) {
  const file = resolve(join(base, pathname));
  return file === base || file.startsWith(base + sep) ? file : undefined;
}

createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad request");
  }
  if (pathname === "/__health") return send(res, 200, "ok");

  const fromData = data && (pathname === "/data" || pathname.startsWith("/data/"));
  let file = fromData ? inside(data, pathname.slice("/data".length)) : inside(root, pathname);
  if (!file) return send(res, 403, "Forbidden");

  try {
    let stat = statSync(file);
    if (stat.isDirectory()) {
      file = join(file, "index.html");
      stat = statSync(file);
    }
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(res);
  } catch {
    send(res, 404, "Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} on http://127.0.0.1:${port}`);
});
