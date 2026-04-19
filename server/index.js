// ============================================================
//  QAN Throne — Express szerver (Railway deploy)
//  Egyszerű static file server + health check
// ============================================================
const express = require("express");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "..", "dist", "public");

app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "qan-throne", ts: Date.now() });
});

// ── Contract info API (opcionális) ───────────────────────────
app.get("/api/config", (_req, res) => {
  try {
    const addr = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "client", "src", "lib", "addresses.json"),
        "utf8"
      )
    );
    res.json(addr);
  } catch {
    res.status(404).json({ error: "Contract még nincs deployyolva" });
  }
});

// ── Static frontend ───────────────────────────────────────────
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(DIST, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.send(`
      <h2>QAN Throne</h2>
      <p>Frontend még nincs buildelve. Futtasd: <code>npm run build</code></p>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`QAN Throne szerver fut: http://localhost:${PORT}`);
});
