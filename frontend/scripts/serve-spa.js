const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".json": "application/json",
  ".map": "application/json",
  ".woff2": "font/woff2",
};

if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
  console.error("Build output not found. Run `npm run build` first.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  let filePath = path.join(BUILD_DIR, urlPath === "/" ? "index.html" : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(BUILD_DIR, "index.html");
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Portfolio preview running at http://${HOST}:${PORT}`);
});
