/**
 * Test kết nối database
 * Usage: pnpm db:test
 */
import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

// const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_LOCAL_URL = process.env.DATABASE_LOCAL_URL;

if (!DATABASE_LOCAL_URL) {
  console.error("✗ DATABASE_LOCAL_URL chưa được set trong .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_LOCAL_URL, // "postgresql://postgres:123456@localhost:5432/tracking_aw",
});

async function test() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected:", res.rows[0]);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await pool.end();
  }
}

test();