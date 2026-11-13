import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";

test(
  "complete isolated production HTTP and persistence workflows",
  { timeout: 120000 },
  async (t) => {
    const port = await new Promise<number>((resolve) => {
      const s = net.createServer();
      s.listen(0, "127.0.0.1", () => {
        const p = (s.address() as net.AddressInfo).port;
        s.close(() => resolve(p));
      });
    });
    const dir = mkdtempSync(path.join(os.tmpdir(), "fisheries360-test-"));
    const origin = `http://127.0.0.1:${port}`;
    const proc = spawn(
      process.execPath,
      ["--import", "tsx", "server/index.tsx"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_ENV: "production",
          PORT: String(port),
          DATA_DIR: dir,
          APP_ORIGIN: origin,
        },
        stdio: "pipe",
      },
    );
    let logs = "";
    proc.stdout.on("data", (d) => (logs += d));
    proc.stderr.on("data", (d) => (logs += d));
    let db: DatabaseSync | undefined;
    try {
      for (let i = 0; i < 100; i++) {
        try {
          const r = await fetch(origin + "/api/health");
          if (r.ok) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.equal((await fetch(origin + "/api/health")).status, 200, logs);
      db = new DatabaseSync(path.join(dir, "fisheries360.sqlite"));
      const password = randomBytes(24).toString("hex");
      const makeUser = (role: string) => {
        const salt = randomBytes(16).toString("hex");
        db!
          .prepare("INSERT INTO users(email,password,role) VALUES(?,?,?)")
          .run(
            `${role}@test.invalid`,
            salt + ":" + scryptSync(password, salt, 64).toString("hex"),
            role,
          );
      };
      assert.equal(
        (db.prepare("SELECT count(*) n FROM users").get() as any).n,
        0,
        "No seeded accounts",
      );
      assert.equal(
        (db.prepare("SELECT count(*) n FROM enquiries").get() as any).n,
        0,
        "No seeded enquiries",
      );
      makeUser("owner");
      makeUser("editor");
      type Auth = { cookie: string; csrf: string };
      async function call(
        route: string,
        method = "GET",
        body?: unknown,
        auth?: Auth,
        extra: Record<string, string> = {},
      ) {
        return fetch(origin + route, {
          method,
          headers: {
            ...(body ? { "Content-Type": "application/json" } : {}),
            Origin: origin,
            Accept: "application/json",
            ...(auth ? { Cookie: auth.cookie, "x-csrf-token": auth.csrf } : {}),
            ...extra,
          },
          body: body ? JSON.stringify(body) : undefined,
          redirect: "manual",
        });
      }
      async function login(role: string): Promise<Auth> {
        const r = await call("/api/admin/login", "POST", {
          email: role + "@test.invalid",
          password,
        });
        assert.equal(r.status, 200);
        const d = await r.json();
        assert.match(r.headers.get("set-cookie")!, /HttpOnly/);
        assert.match(r.headers.get("set-cookie")!, /Secure/);
        assert.match(r.headers.get("set-cookie")!, /SameSite=Strict/);
        return {
          cookie: r.headers.get("set-cookie")!.split(";")[0],
          csrf: d.csrf,
        };
      }
      const owner = await login("owner"),
        editor = await login("editor");
      await t.test(
        "hero films support progressive playback and byte ranges",
        async () => {
          for (const file of [
            "fisheries360-hero.mp4",
            "fisheries360-hero-mobile.mp4",
            "fisheries360-product-demo.mp4",
            "fisheries360-product-demo-mobile.mp4",
          ]) {
            const bytes = readFileSync("public/media/" + file);
            assert.ok(bytes.length > 1000);
            assert.ok(bytes.indexOf(Buffer.from("moov")) > 0);
            assert.ok(
              bytes.indexOf(Buffer.from("moov")) <
                bytes.indexOf(Buffer.from("mdat")),
              "MP4 metadata precedes media payload",
            );
            const response = await fetch(origin + "/media/" + file, {
              headers: { Range: "bytes=0-1023" },
            });
            assert.equal(response.status, 206);
            assert.match(response.headers.get("content-type")!, /^video\/mp4/);
            assert.equal(
              response.headers.get("content-range"),
              `bytes 0-1023/${bytes.length}`,
            );
            assert.equal((await response.arrayBuffer()).byteLength, 1024);
          }
        },
      );
      await t.test(
        "six distinct SSR routes, navigation targets, metadata, static assets and 404",
        async () => {
          const titles = new Set();
          const targets = new Set<string>();
          for (const route of [
            "/",
            "/platform",
            "/cagenode",
            "/solutions",
            "/about",
            "/contact",
          ]) {
            const r = await fetch(origin + route);
            assert.equal(r.status, 200);
            const html = await r.text();
            assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
            titles.add(html.match(/<title>(.*?)<\/title>/)![1]);
            assert.match(html, /<meta name="description"/);
            assert.match(html, /<main id="main">/);
            assert.ok(!html.includes('rel="canonical"'), "No guessed domain");
            assert.match(
              r.headers.get("content-security-policy")!,
              /default-src 'self'/,
            );
            for (const [, href] of html.matchAll(/href="(\/(?!\/)[^"#?]*)/g))
              targets.add(href);
            for (const [, src] of html.matchAll(
              /(?:src|href)="(\/[^"#?]+\.(?:webp|svg|css|js))"/g,
            ))
              targets.add(src);
          }
          assert.equal(titles.size, 6);
          for (const target of targets)
            assert.equal((await fetch(origin + target)).status, 200, target);
          assert.equal((await fetch(origin + "/missing-page")).status, 404);
          assert.equal((await fetch(origin + "/api/missing")).status, 404);
          assert.equal((await fetch(origin + "/sitemap.xml")).status, 503);
        },
      );
      await t.test(
        "enquiry validation, same-origin protection, persistent save and no-JS form response",
        async () => {
          assert.equal(
            (await call("/api/enquiries", "POST", { name: "a" })).status,
            400,
          );
          const body = {
            name: "Disposable integration test",
            email: "test@example.invalid",
            company: "Test farm",
            location: "Test location",
            requirements: "Verify isolated persistence workflow.",
            website: "",
          };
          assert.equal(
            (
              await call("/api/enquiries", "POST", body, undefined, {
                Origin: "https://invalid.example",
              })
            ).status,
            403,
          );
          const r = await call("/api/enquiries", "POST", body);
          assert.equal(r.status, 201);
          const saved = await r.json();
          assert.ok(
            db!.prepare("SELECT id FROM enquiries WHERE id=?").get(saved.id),
          );
          const native = await fetch(origin + "/api/enquiries", {
            method: "POST",
            headers: {
              Origin: origin,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(body),
            redirect: "manual",
          });
          assert.equal(native.status, 303);
          assert.match(
            native.headers.get("location")!,
            /^\/contact\?saved=\d+$/,
          );
          assert.match(
            await (await fetch(origin + native.headers.get("location"))).text(),
            /Your enquiry has been saved/,
          );
        },
      );
      await t.test("authentication, role enforcement and CSRF", async () => {
        assert.equal((await call("/api/admin/content")).status, 401);
        assert.equal((await call("/api/admin/enquiries")).status, 401);
        assert.equal(
          (
            await call("/api/admin/login", "POST", {
              email: "owner@test.invalid",
              password: "wrong",
            })
          ).status,
          401,
        );
        assert.equal(
          (await call("/api/admin/publish", "POST", { version: 1 }, editor))
            .status,
          403,
        );
        assert.equal(
          (
            await call(
              "/api/admin/publish",
              "POST",
              { version: 1 },
              { ...owner, csrf: "wrong" },
            )
          ).status,
          403,
        );
        const session = await (
          await call("/api/admin/session", "GET", undefined, editor)
        ).json();
        assert.equal(session.role, "editor");
      });
      await t.test(
        "page/section draft edits, optimistic locking, preview, publish and revision restore",
        async () => {
          let d = await (
            await call("/api/admin/content", "GET", undefined, owner)
          ).json();
          const original = d.content.pages.home.sections[0].title;
          d.content.pages.home.sections[0].title =
            "Isolated draft verification";
          d.content.collections.capabilities[0][1] =
            "Verified editable shared module content.";
          d.content.menus[0].label = "Welcome";
          const googleTag =
            '<meta name="google-site-verification" content="test-code_123"/>';
          d.content.googleSiteVerification = "test-code_123";
          let r = await call("/api/admin/content", "PUT", d, editor);
          assert.equal(r.status, 200);
          d = await r.json();
          assert.ok(!(await (await fetch(origin)).text()).includes(googleTag));
          assert.ok(
            !(await (await fetch(origin)).text()).includes(
              "Isolated draft verification",
            ),
          );
          assert.match(
            await (
              await fetch(origin + "/?preview=1", {
                headers: { Cookie: owner.cookie },
              })
            ).text(),
            /Isolated draft verification/,
          );
          assert.ok(
            !(await (await fetch(origin + "/?preview=1")).text()).includes(
              "Isolated draft verification",
            ),
          );
          assert.equal(
            (
              await call(
                "/api/admin/content",
                "PUT",
                { ...d, version: 1 },
                owner,
              )
            ).status,
            409,
          );
          const invalid = structuredClone(d);
          invalid.content.googleSiteVerification = 'test" invalid';
          assert.equal(
            (await call("/api/admin/content", "PUT", invalid, owner)).status,
            400,
          );
          r = await call(
            "/api/admin/publish",
            "POST",
            { version: d.version },
            owner,
          );
          assert.equal(r.status, 200);
          d = await r.json();
          assert.match(
            await (await fetch(origin)).text(),
            /Isolated draft verification/,
          );
          assert.ok(
            (await (await fetch(origin)).text())
              .split("</head>")[0]
              .includes(googleTag),
          );
          assert.ok(
            !(await (await fetch(origin + "/admin")).text()).includes(
              googleTag,
            ),
          );
          const revisions = await (
            await call("/api/admin/revisions", "GET", undefined, owner)
          ).json();
          assert.ok(revisions.length >= 2);
          r = await call(
            `/api/admin/revisions/${revisions[0].id}/restore`,
            "POST",
            { version: d.version },
            owner,
          );
          assert.equal(r.status, 200);
          d = await r.json();
          assert.equal(d.content.pages.home.sections[0].title, original);
          assert.match(
            await (await fetch(origin)).text(),
            /Isolated draft verification/,
            "Restore only changes draft",
          );
          r = await call(
            "/api/admin/publish",
            "POST",
            { version: d.version },
            owner,
          );
          assert.equal(r.status, 200);
          assert.ok(
            !(await (await fetch(origin)).text()).includes(
              "Isolated draft verification",
            ),
          );
        },
      );
      await t.test(
        "image upload, optimisation, metadata and validation",
        async () => {
          const form = new FormData();
          form.set(
            "file",
            new Blob([readFileSync("public/images/social-preview.webp")], {
              type: "image/webp",
            }),
            "sample.webp",
          );
          form.set("alt", "Isolated aquaculture image");
          form.set("usage", "Test-only copy of the project diagram preview.");
          const r = await fetch(origin + "/api/admin/media", {
            method: "POST",
            headers: {
              Origin: origin,
              Cookie: editor.cookie,
              "x-csrf-token": editor.csrf,
            },
            body: form,
          });
          assert.equal(r.status, 201);
          const m = await r.json();
          assert.ok(existsSync(path.join(dir, "uploads", m.id + ".webp")));
          assert.equal((await fetch(origin + m.url)).status, 200);
          const library = await (
            await call("/api/admin/media", "GET", undefined, owner)
          ).json();
          assert.equal(library[0].alt, "Isolated aquaculture image");
          const bad = new FormData();
          bad.set(
            "file",
            new Blob(["<svg/>"], { type: "image/svg+xml" }),
            "bad.svg",
          );
          bad.set("alt", "SVG test");
          bad.set("usage", "Invalid upload test");
          assert.equal(
            (
              await fetch(origin + "/api/admin/media", {
                method: "POST",
                headers: {
                  Origin: origin,
                  Cookie: owner.cookie,
                  "x-csrf-token": owner.csrf,
                },
                body: bad,
              })
            ).status,
            400,
          );
        },
      );
      await t.test(
        "enquiry status, notes, follow-up, role-restricted deletion and logout",
        async () => {
          const rows = await (
            await call("/api/admin/enquiries", "GET", undefined, owner)
          ).json();
          assert.equal(rows.length, 2);
          const id = rows[0].id;
          assert.equal(
            (
              await call(
                "/api/admin/enquiries/" + id,
                "PATCH",
                {
                  status: "contacted",
                  notes: "Isolated test follow-up",
                  follow_up: "2026-12-01",
                },
                editor,
              )
            ).status,
            200,
          );
          const row = db!
            .prepare("SELECT * FROM enquiries WHERE id=?")
            .get(id) as any;
          assert.equal(row.status, "contacted");
          assert.equal(row.follow_up, "2026-12-01");
          assert.equal(
            (await call("/api/admin/enquiries/" + id, "DELETE", {}, editor))
              .status,
            403,
          );
          assert.equal(
            (await call("/api/admin/enquiries/" + id, "DELETE", {}, owner))
              .status,
            200,
          );
          assert.equal(
            (await call("/api/admin/logout", "POST", {}, owner)).status,
            200,
          );
          assert.equal(
            (await call("/api/admin/session", "GET", undefined, owner)).status,
            401,
          );
        },
      );
    } finally {
      db?.close();
      proc.kill();
      await new Promise((r) => proc.once("exit", r));
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
