import { db, hashPassword } from "../server/store";
import { createInterface } from "node:readline/promises";
const rl = createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("User email: ")).trim().toLowerCase();
const role = (await rl.question("Role (owner/editor): ")).trim();
console.log(
  "Enter a unique password with at least 6 characters. Input is hidden.",
);
rl.close();
async function secret(): Promise<string> {
  if (!process.stdin.isTTY)
    throw new Error("Use an interactive terminal to create users.");
  return new Promise((resolve) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const listener = (chunk: Buffer) => {
      for (const ch of chunk.toString()) {
        if (ch === "\u0003") process.exit(1);
        if (ch === "\r" || ch === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.off("data", listener);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    process.stdin.on("data", listener);
  });
}
const password = await secret();
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !["owner", "editor"].includes(role) ||
  password.length < 6 ||
  password.length > 256
)
  throw new Error("Invalid email, role or password length (6–256).");
db.prepare("INSERT INTO users(email,password,role) VALUES(?,?,?)").run(
  email,
  hashPassword(password),
  role,
);
console.log(`Created ${role} account for ${email}.`);

