import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "../src/App";
import { PageKey, pageKeys, initialContent } from "../src/content";
import { db, dataDir, getContent, checkPassword, tokenHash } from "./store";
import { enquirySchema, contentSchema, enquiryUpdate } from "./validation";
import { brand } from "../src/brand";
import { approvedContent } from "./approved-content";
import { enquiryMailer } from "./enquiry-mail";
const mailer = enquiryMailer(db);
const mailTimer = setInterval(() => void mailer.flush(), 30000);
mailTimer.unref();
const app = express();
const production = process.env.NODE_ENV === "production";
const built = production || process.env.LOCAL_PREVIEW === "1";
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", ...(production ? [] : ["'unsafe-inline'"])],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", ...(production ? [] : ["ws:"])],
        upgradeInsecureRequests: production ? [] : null,
      },
    },
    strictTransportSecurity: production ? undefined : false,
  }),
);
app.use(express.json({ limit: "600kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
const limited = (max: number, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });
app.use("/api", limited(300));
const cookies = (req: Request) =>
  Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((c) => {
        const at = c.indexOf("=");
        return [c.slice(0, at).trim(), c.slice(at + 1)];
      }),
  );
function session(req: Request) {
  const token = cookies(req).f360_session;
  if (!token) return null;
  return db
    .prepare(
      "SELECT sessions.*,users.email,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?",
    )
    .get(tokenHash(token), Date.now()) as any;
}
function auth(req: Request, res: Response, next: NextFunction) {
  const user = session(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  res.locals.user = user;
  next();
}
function owner(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.user.role !== "owner") {
    res.status(403).json({ error: "Only an owner can perform this action." });
    return;
  }
  next();
}
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    const expected =
      process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`;
    if (!origin || origin !== expected) {
      res.status(403).json({ error: "Request origin could not be verified." });
      return;
    }
    if (req.path.startsWith("/admin") && req.path !== "/admin/login") {
      const user = session(req);
      if (!user || req.get("x-csrf-token") !== user.csrf) {
        res
          .status(403)
          .json({ error: "Session verification failed. Sign in again." });
        return;
      }
    }
  }
  next();
});
app.get("/api/admin/session", auth, (_req, res) =>
  res.json({
    email: res.locals.user.email,
    role: res.locals.user.role,
    csrf: res.locals.user.csrf,
  }),
);
app.post("/api/admin/login", limited(8), (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  if (password.length > 256 || email.length > 254) {
    res.status(400).json({ error: "Invalid sign-in details." });
    return;
  }
  const user = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email) as any;
  const fallback = "00000000000000000000000000000000:" + "00".repeat(64);
  const valid = checkPassword(password, user?.password || fallback);
  if (!user || !valid) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  const csrf = randomBytes(32).toString("hex");
  db.prepare(
    "INSERT INTO sessions(token,user_id,csrf,expires) VALUES(?,?,?,?)",
  ).run(tokenHash(token), user.id, csrf, Date.now() + 8 * 60 * 60 * 1000);
  res.cookie("f360_session", token, {
    httpOnly: true,
    secure: production,
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json({ email: user.email, role: user.role, csrf });
});
app.post("/api/admin/logout", auth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token=?").run(res.locals.user.token);
  res.clearCookie("f360_session", {
    path: "/",
    secure: production,
    sameSite: "strict",
  });
  res.json({ ok: true });
});
app.post("/api/enquiries", limited(8), (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);
  const json = req.get("accept")?.includes("application/json");
  if (!parsed.success) {
    const error =
      "Please provide a name, valid email, company/farm, location and requirements of at least 15 characters.";
    if (json) {
      res.status(400).json({ error });
      return;
    }
    res.redirect(303, "/contact?error=validation");
    return;
  }
  const d = parsed.data;
  try {
    db.exec("BEGIN IMMEDIATE");
    const result = db
      .prepare(
        "INSERT INTO enquiries(name,email,company,location,requirements) VALUES(?,?,?,?,?)",
      )
      .run(d.name, d.email, d.company, d.location, d.requirements);
    mailer.enqueue(Number(result.lastInsertRowid));
    db.exec("COMMIT");
    void mailer.flush();
    if (json) res.status(201).json({ id: Number(result.lastInsertRowid) });
    else res.redirect(303, "/contact?saved=" + result.lastInsertRowid);
  } catch {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* No active transaction after a completed save. */
    }
    if (json)
      res
        .status(500)
        .json({ error: "Your enquiry could not be saved. Please try again." });
    else res.redirect(303, "/contact?error=storage");
  }
});
app.get("/api/admin/content", auth, (_req, res) => res.json(getContent(true)));
function saveRevision(body: string, action: string, actor: string) {
  db.prepare("INSERT INTO revisions(body,action,actor) VALUES(?,?,?)").run(
    body,
    action,
    actor,
  );
}
app.put("/api/admin/content", auth, (req, res) => {
  const parsed = contentSchema.safeParse(req.body.content);
  if (!parsed.success) {
    res.status(400).json({
      error:
        "Content validation failed. Check text lengths, image alt text and links.",
      details: parsed.error.issues,
    });
    return;
  }
  for (const key of pageKeys) {
    const ids = parsed.data.pages[key].sections.map((s) => s.id);
    const expected = initialContent.pages[key].sections.map((s) => s.id);
    if (JSON.stringify(ids) !== JSON.stringify(expected)) {
      res.status(400).json({
        error: "Page section identities and order must be preserved.",
      });
      return;
    }
  }
  parsed.data = approvedContent(parsed.data);
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = getContent(true);
    if (req.body.version !== current.version) {
      db.exec("ROLLBACK");
      res.status(409).json({
        error: "This draft changed in another session. Reload before editing.",
      });
      return;
    }
    saveRevision(
      JSON.stringify(current.content),
      "Before draft save",
      res.locals.user.email,
    );
    db.prepare("UPDATE content SET draft=?,version=version+1 WHERE id=1").run(
      JSON.stringify(parsed.data),
    );
    db.exec("COMMIT");
    res.json(getContent(true));
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
});
app.post("/api/admin/publish", auth, owner, (req, res) => {
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = getContent(true);
    if (req.body.version !== current.version) {
      db.exec("ROLLBACK");
      res
        .status(409)
        .json({ error: "Draft changed. Reload before publishing." });
      return;
    }
    saveRevision(
      JSON.stringify(getContent().content),
      "Before publish",
      res.locals.user.email,
    );
    db.prepare(
      "UPDATE content SET published=draft,version=version+1 WHERE id=1",
    ).run();
    db.exec("COMMIT");
    res.json(getContent(true));
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
});
app.get("/api/admin/revisions", auth, (_req, res) =>
  res.json(
    db
      .prepare(
        "SELECT id,action,actor,created FROM revisions ORDER BY id DESC LIMIT 100",
      )
      .all(),
  ),
);
app.post("/api/admin/revisions/:id/restore", auth, owner, (req, res) => {
  const revision = db
    .prepare("SELECT body FROM revisions WHERE id=?")
    .get(Number(req.params.id)) as any;
  if (!revision) {
    res.status(404).json({ error: "Revision not found." });
    return;
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    if (req.body.version !== getContent(true).version) {
      db.exec("ROLLBACK");
      res
        .status(409)
        .json({ error: "Draft changed. Reload before restoring." });
      return;
    }
    saveRevision(
      JSON.stringify(getContent(true).content),
      "Before restore",
      res.locals.user.email,
    );
    db.prepare("UPDATE content SET draft=?,version=version+1 WHERE id=1").run(
      JSON.stringify(approvedContent(JSON.parse(revision.body))),
    );
    db.exec("COMMIT");
    res.json(getContent(true));
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
});
app.get("/api/admin/enquiries", auth, (_req, res) =>
  res.json(
    db
      .prepare(
        "SELECT e.*,m.status AS mail_status,m.last_error AS mail_error FROM enquiries e LEFT JOIN enquiry_mail m ON m.enquiry_id=e.id ORDER BY e.created DESC,e.id DESC",
      )
      .all()
      .map((row: any) => ({ ...row, mail_configured: mailer.configured })),
  ),
);
app.patch("/api/admin/enquiries/:id", auth, (req, res) => {
  const d = enquiryUpdate.safeParse(req.body);
  if (!d.success) {
    res.status(400).json({ error: "Invalid enquiry update." });
    return;
  }
  const result = db
    .prepare(
      "UPDATE enquiries SET status=?,notes=?,follow_up=?,updated=CURRENT_TIMESTAMP WHERE id=?",
    )
    .run(d.data.status, d.data.notes, d.data.follow_up, Number(req.params.id));
  if (!result.changes) {
    res.status(404).json({ error: "Enquiry not found." });
    return;
  }
  res.json({ ok: true });
});
app.delete("/api/admin/enquiries/:id", auth, owner, (req, res) => {
  const result = db
    .prepare("DELETE FROM enquiries WHERE id=?")
    .run(Number(req.params.id));
  if (!result.changes) {
    res.status(404).json({ error: "Enquiry not found." });
    return;
  }
  res.json({ ok: true });
});
app.get("/api/admin/media", auth, (_req, res) =>
  res.json(
    db.prepare("SELECT * FROM media ORDER BY created DESC, rowid DESC").all(),
  ),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});
app.post("/api/admin/media", auth, upload.single("file"), async (req, res) => {
  const alt = String(req.body.alt || "").trim();
  const usage = String(req.body.usage || "").trim();
  if (
    !req.file ||
    alt.length < 3 ||
    alt.length > 300 ||
    usage.length < 5 ||
    usage.length > 1000
  ) {
    res.status(400).json({
      error:
        "Choose an image, descriptive alt text and rights/source information.",
    });
    return;
  }
  const id = randomUUID();
  try {
    const input = sharp(req.file.buffer, { limitInputPixels: 40_000_000 });
    const meta = await input.metadata();
    if (!["jpeg", "png", "webp", "avif"].includes(meta.format || ""))
      throw new Error();
    await input
      .rotate()
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(dataDir, "uploads", id + ".webp"));
  } catch {
    res.status(400).json({
      error:
        "Use a valid JPEG, PNG, WebP or AVIF image, up to 8 MB and 40 megapixels.",
    });
    return;
  }
  const url = `/uploads/${id}.webp`;
  db.prepare("INSERT INTO media(id,url,alt,usage) VALUES(?,?,?,?)").run(
    id,
    url,
    alt,
    usage,
  );
  res.status(201).json({ id, url, alt, usage });
});
app.get("/api/health", (_req, res) => {
  db.prepare("SELECT 1").get();
  res.json({ ok: true });
});
app.use(
  "/uploads",
  express.static(path.join(dataDir, "uploads"), {
    maxAge: "1y",
    immutable: true,
    dotfiles: "deny",
  }),
);
app.use(express.static("public", { maxAge: production ? "1d" : 0 }));
let vite: any;
let assets = { js: "", css: [] as string[] };
if (!built) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
} else {
  app.use(
    "/assets",
    express.static("dist/assets", { immutable: true, maxAge: "1y" }),
  );
  const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
  assets = {
    js: "/" + manifest["src/client.tsx"].file,
    css: manifest["src/client.tsx"].css.map((p: string) => "/" + p),
  };
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
app.get("/robots.txt", (_req, res) =>
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n${process.env.SITE_URL ? "Sitemap: " + process.env.SITE_URL.replace(/\/$/, "") + "/sitemap.xml" : ""}`,
    ),
);
app.get("/sitemap.xml", (_req, res) => {
  if (!process.env.SITE_URL) {
    res
      .status(503)
      .type("text/plain")
      .send("Set SITE_URL to enable the production sitemap.");
    return;
  }
  res
    .type("application/xml")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageKeys.map((p) => `<url><loc>${escape(process.env.SITE_URL!.replace(/\/$/, "") + (p === "home" ? "/" : "/" + p))}</loc></url>`).join("")}</urlset>`,
    );
});
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Endpoint not found." });
    return;
  }
  next();
});
app.get("/{*splat}", async (req, res, next) => {
  try {
    const admin = req.path === "/admin" || req.path === "/admin/";
    const key = (
      req.path === "/" ? "home" : req.path.slice(1).replace(/\/$/, "")
    ) as PageKey;
    const found = pageKeys.includes(key);
    const page = found ? key : "home";
    const preview = req.query.preview === "1" && !!session(req);
    const content = getContent(preview).content;
    const saved =
      typeof req.query.saved === "string" &&
      /^\d+$/.test(req.query.saved) &&
      !!db
        .prepare("SELECT id FROM enquiries WHERE id=?")
        .get(Number(req.query.saved));
    const props = {
      content,
      page,
      preview,
      sent: !!saved,
      formError: req.query.error
        ? "Your enquiry was not saved. Check the fields and try again."
        : undefined,
      notFound: !found,
    };
    const originalMeta = content.pages[page];
    const meta = {
      ...originalMeta,
      description: originalMeta.description.includes(brand.company)
        ? originalMeta.description
        : `${originalMeta.description} ${brand.ownership}`,
    };
    const publicOrigin = process.env.SITE_URL?.replace(/\/$/, "");
    const structuredData = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${brand.companyUrl}#organization`,
          name: brand.company,
          url: brand.companyUrl,
          email: brand.email,
          telephone: brand.telephone,
        },
        {
          "@type": "SoftwareApplication",
          name: brand.name,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          slogan: brand.tagline,
          description: `${brand.tagline}. ${brand.ownership} Business management with configuration-dependent monitoring integration.`,
          publisher: { "@id": `${brand.companyUrl}#organization` },
          ...(publicOrigin ? { url: publicOrigin } : {}),
        },
      ],
    }).replace(/</g, "\\u003c");
    const seoExtras = `<meta name="author" content="${brand.company}"/><meta property="og:site_name" content="${brand.name}"/><meta property="og:image" content="${publicOrigin || ""}/images/social-preview.webp"/><meta property="og:image:alt" content="Fisheries360 — ${brand.tagline}. Concept diagram, not a product photograph."/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escape(meta.seoTitle)}"/><meta name="twitter:description" content="${escape(meta.description)}"/>${!admin && !preview && found ? `<script type="application/ld+json">${structuredData}</script>` : ""}`;
    res.status(admin || found ? 200 : 404);
    res.set("Cache-Control", "no-store");
    const data = JSON.stringify(props).replace(/</g, "\\u003c");
    let html = `<!DOCTYPE html><html lang="en" class="no-js"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#092732"/><title>${escape(admin ? "Fisheries360 · Team workspace" : !found ? "Page not found · Fisheries360" : meta.seoTitle)}</title><meta name="description" content="${escape(meta.description)}"/>${admin || preview || !found ? '<meta name="robots" content="noindex,nofollow"/>' : ""}${process.env.SITE_URL && !admin && found && !preview ? `<link rel="canonical" href="${escape(process.env.SITE_URL.replace(/\/$/, "") + req.path)}"/>` : ""}<meta property="og:title" content="${escape(meta.seoTitle)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:type" content="website"/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/>${!built ? '<link rel="stylesheet" href="/src/style.css?direct"/>' : ""}${assets.css.map((h) => `<link rel="stylesheet" href="${h}"/>`).join("")}</head><body><div id="root">${admin ? "<noscript>The team workspace requires JavaScript. Public website content and enquiry submission work without it.</noscript>" : renderToString(<App {...props} />)}</div><script id="page-data" type="application/json">${data}</script><script type="module" src="${built ? assets.js : "/src/client.tsx"}"></script></body></html>`;
    html = html.replace("</head>", seoExtras + "</head>");
    if (!built) html = await vite.transformIndexHtml(req.originalUrl, html);
    res.type("html").send(html);
  } catch (err) {
    next(err);
  }
});
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err?.message || "Server error");
  res.status(err instanceof multer.MulterError ? 400 : 500).json({
    error:
      err instanceof multer.MulterError
        ? "Upload exceeds the allowed size or file count."
        : "The request could not be completed. Please try again.",
  });
});
const port = Number(process.env.PORT || 4310);
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`Fisheries360 local preview: http://localhost:${port}`),
);
server.on("error", (err: any) => {
  console.error(
    err.code === "EADDRINUSE"
      ? `Port ${port} is occupied. Set PORT to an available port.`
      : err.message,
  );
  process.exit(1);
});
