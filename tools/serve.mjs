import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "site");
const port = Number(process.argv[3] ?? 4321);

const policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Maps a request path to a file inside the site root, refusing anything that escapes it.
 *
 * @param url - Raw request URL.
 * @returns Absolute file path, or `null` when the path leaves the root.
 */
function toFile(url) {
  const path = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const target = normalize(join(root, path === "/" || path === "/site" ? "index.html" : path));
  return target.startsWith(root) ? target : null;
}

createServer(async (request, response) => {
  const file = toFile(request.url);
  try {
    if (!file || !(await stat(file)).isFile()) throw new Error("not found");
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": "no-store", "content-security-policy": policy });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("404");
  }
}).listen(port, () => console.log(`IZMED preview on http://localhost:${port}`));
