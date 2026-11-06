import "./config";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { initialContent } from "../src/content";
export const dataDir = path.resolve(process.env.DATA_DIR || "data");
mkdirSync(path.join(dataDir, "uploads"), { recursive: true });
export const db = new DatabaseSync(path.join(dataDir, "fisheries360.sqlite"));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('owner','editor')));
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY CHECK(id=1),published TEXT NOT NULL,draft TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY,body TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS enquiries(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,company TEXT NOT NULL,location TEXT NOT NULL,requirements TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',notes TEXT NOT NULL DEFAULT '',follow_up TEXT NOT NULL DEFAULT '',created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,url TEXT NOT NULL,alt TEXT NOT NULL,usage TEXT NOT NULL,created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY)");
const base = JSON.stringify(initialContent);
db.prepare(
  "INSERT OR IGNORE INTO content(id,published,draft) VALUES(1,?,?)",
).run(base, base);
// Migrate only the former default visuals, once; preserve owner edits and revisions.
if (
  !db
    .prepare("SELECT name FROM schema_migrations WHERE name=?")
    .get("visual-direction-v2")
) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const existing = db
      .prepare("SELECT published,draft FROM content WHERE id=1")
      .get() as { published: string; draft: string };
    for (const field of ["published", "draft"] as const) {
      const data = JSON.parse(existing[field]);
      for (const page of ["home", "cagenode"]) {
        const hero = data.pages[page].sections.find(
          (s: { id: string }) => s.id === "hero",
        );
        if (
          hero &&
          (hero.image === "/images/aquaculture.webp" || hero.image === "")
        ) {
          hero.image = "/images/cagenode-hero-v2.webp";
          hero.alt =
            "AI-generated conceptual CageNode monitoring assembly above aquaculture waters; proposed hardware, not an actual installation";
        }
      }
      if (JSON.stringify(data) !== existing[field]) {
        db.prepare(
          "INSERT INTO revisions(body,action,actor) VALUES(?,?,?)",
        ).run(
          existing[field],
          "Before visual redesign / " + field,
          "Local project migration",
        );
        db.prepare(
          `UPDATE content SET ${field}=?,version=version+1 WHERE id=1`,
        ).run(JSON.stringify(data));
      }
    }
    db.prepare("INSERT INTO schema_migrations(name) VALUES(?)").run(
      "visual-direction-v2",
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
db.prepare("INSERT OR IGNORE INTO media(id,url,alt,usage) VALUES(?,?,?,?)").run(
  "cagenode-concept-v2",
  "/images/cagenode-hero-v2.webp",
  "CageNode conceptual visualization",
  "AI-generated concept poster created for Fisheries360. Proposed hardware only; not a real installation or verified production specification. Used as the video-ready hero poster.",
);
export function getContent(draft = false) {
  const row = db.prepare("SELECT * FROM content WHERE id=1").get() as any;
  return {
    content: JSON.parse(row[draft ? "draft" : "published"]),
    version: row.version,
  };
}
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const got = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return got.length === expected.length && timingSafeEqual(got, expected);
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
