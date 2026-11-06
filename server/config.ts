import { existsSync } from "node:fs";
if (existsSync(".env")) process.loadEnvFile(".env");
for (const name of ["SITE_URL", "APP_ORIGIN"]) {
  const value = process.env[name];
  if (value) {
    const u = new URL(value);
    if (
      !["http:", "https:"].includes(u.protocol) ||
      u.username ||
      u.password ||
      u.search ||
      u.hash ||
      u.pathname !== "/"
    )
      throw new Error(
        `${name} must be an HTTP(S) origin without a path or credentials.`,
      );
  }
}
