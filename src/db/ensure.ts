import { sql } from "drizzle-orm";
import { db } from "./index";

let ready: Promise<void> | null = null;

export function ensureAuthSchema() {
  ready ??= (async () => {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub text`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'password'`);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique ON users (google_sub)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS auth_tokens (
      id text PRIMARY KEY,
      email text NOT NULL,
      token_hash text NOT NULL,
      purpose text NOT NULL,
      expires_at timestamptz NOT NULL,
      used boolean NOT NULL DEFAULT false
    )`);
  })();
  return ready;
}
