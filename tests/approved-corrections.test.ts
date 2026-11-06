import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { enquiryMailer } from "../server/enquiry-mail";
import { approvedContent, approvedText } from "../server/approved-content";
import { initialContent } from "../src/content";
import { brand } from "../src/brand";

test("approved corrections preserve unrelated edits and replace stale identity, with safe imagery", () => {
  const data = structuredClone(initialContent);
  data.pages.home.sections[0].title = "Owner custom headline";
  data.pages.home.description = "Pond se Profit tak. Neksoft Global Pvt Ltd";
  data.pages.home.sections[0].image = "/images/cagenode-hero-v2.webp";
  const corrected = approvedContent(data);
  assert.equal(corrected.pages.home.sections[0].title, "Owner custom headline");
  assert.match(
    corrected.pages.home.description,
    /Connecting Aquaculture to Intelligence/,
  );
  assert.match(
    corrected.pages.home.description,
    /Neksoft Consultancy Services B\.V\./,
  );
  assert.equal(
    corrected.pages.home.sections[0].image,
    "/images/cagenode-diagram.svg",
  );
  assert.equal(
    approvedText("Neksoft Global Service Private Limited"),
    brand.company,
  );
  assert.equal(approvedText("Neksoft Global Private Limited"), brand.company);
  assert.equal(approvedText("Neksoft Global Pvt Ltd"), brand.company);
});

test("mail outbox saves without SMTP and retries only through an isolated sender, fixed approved recipient", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "PRAGMA foreign_keys=ON; CREATE TABLE enquiries(id INTEGER PRIMARY KEY,name TEXT,email TEXT,company TEXT,location TEXT,requirements TEXT);",
  );
  db.prepare("INSERT INTO enquiries VALUES(1,?,?,?,?,?)").run(
    "Isolated test",
    "test@example.invalid",
    "Test farm",
    "Test location",
    "Isolated notification verification",
  );
  const unconfigured = enquiryMailer(db, {});
  unconfigured.enqueue(1);
  await unconfigured.flush();
  assert.equal(
    (db.prepare("SELECT status FROM enquiry_mail").get() as any).status,
    "pending",
  );
  let fail = true;
  const captured: any[] = [];
  const configured = enquiryMailer(
    db,
    {
      SMTP_HOST: "smtp.invalid",
      SMTP_FROM: "sender@example.invalid",
      ENQUIRY_EMAIL: "wrong@example.invalid",
    },
    async (message) => {
      captured.push(message);
      if (fail) throw Error("private smtp details");
      return { accepted: [brand.email] };
    },
  );
  await configured.flush();
  let state = db.prepare("SELECT * FROM enquiry_mail").get() as any;
  assert.equal(state.status, "pending");
  assert.equal(state.attempts, 1);
  assert.doesNotMatch(state.last_error, /private/);
  db.exec("UPDATE enquiry_mail SET next_attempt=0");
  fail = false;
  await configured.flush();
  state = db.prepare("SELECT * FROM enquiry_mail").get() as any;
  assert.equal(state.status, "sent");
  assert.equal(captured[1].to, brand.email);
  assert.equal(captured[1].replyTo, "test@example.invalid");
  assert.match(captured[1].text, /Neksoft Consultancy Services B\.V\./);
  assert.match(captured[1].text, /Connecting Aquaculture to Intelligence/);
  db.close();
});
