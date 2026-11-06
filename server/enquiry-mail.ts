import nodemailer from "nodemailer";
import type { DatabaseSync } from "node:sqlite";
import { brand } from "../src/brand";

export function enquiryMailer(
  db: DatabaseSync,
  env: NodeJS.ProcessEnv = process.env,
  testSender?: (message: any) => Promise<any>,
) {
  db.exec(`CREATE TABLE IF NOT EXISTS enquiry_mail (
    enquiry_id INTEGER PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt INTEGER NOT NULL DEFAULT 0, last_error TEXT NOT NULL DEFAULT '',
    sent_at TEXT NOT NULL DEFAULT '');`);
  const port = Number(env.SMTP_PORT || 587);
  const configured =
    !!env.SMTP_HOST &&
    !!env.SMTP_FROM &&
    Number.isInteger(port) &&
    port > 0 &&
    port < 65536 &&
    (!env.SMTP_USER || !!env.SMTP_PASS);
  const transport =
    configured && !testSender
      ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port,
          secure: env.SMTP_SECURE === "true" || port === 465,
          requireTLS: port !== 465,
          auth: env.SMTP_USER
            ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
            : undefined,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
        })
      : undefined;
  let busy = false;
  return {
    configured,
    enqueue(id: number) {
      db.prepare("INSERT INTO enquiry_mail(enquiry_id) VALUES(?)").run(id);
    },
    async flush() {
      if (busy || (!configured && !testSender)) return;
      busy = true;
      try {
        const rows = db
          .prepare(
            `SELECT e.*,m.attempts FROM enquiry_mail m JOIN enquiries e ON e.id=m.enquiry_id WHERE m.status='pending' AND m.next_attempt<=? ORDER BY e.id LIMIT 10`,
          )
          .all(Date.now()) as any[];
        for (const row of rows) {
          try {
            const message = {
              from: env.SMTP_FROM,
              to: brand.email,
              replyTo: row.email,
              subject: `Fisheries360 enquiry F360-${row.id}`,
              text: [
                brand.name,
                brand.tagline,
                brand.ownership,
                "",
                `Reference: F360-${row.id}`,
                `Name: ${row.name}`,
                `Email: ${row.email}`,
                `Company / farm: ${row.company}`,
                `Location: ${row.location}`,
                "",
                row.requirements,
              ].join("\n"),
            };
            const result = await (testSender
              ? testSender(message)
              : transport!.sendMail(message));
            if (
              !result.accepted?.some(
                (address: any) =>
                  String(
                    typeof address === "object" ? address.address : address,
                  ).toLowerCase() === brand.email,
              )
            )
              throw Error("recipient-not-accepted");
            db.prepare(
              "UPDATE enquiry_mail SET status='sent',attempts=attempts+1,last_error='',sent_at=CURRENT_TIMESTAMP WHERE enquiry_id=?",
            ).run(row.id);
          } catch {
            // Never persist credentials, SMTP response strings, or enquiry bodies in error logs.
            db.prepare(
              "UPDATE enquiry_mail SET attempts=attempts+1,last_error='SMTP delivery failed; queued for retry',next_attempt=? WHERE enquiry_id=?",
            ).run(
              Date.now() +
                Math.min(3600000, 60000 * 2 ** Math.min(row.attempts, 6)),
              row.id,
            );
          }
        }
      } finally {
        busy = false;
      }
    },
  };
}
