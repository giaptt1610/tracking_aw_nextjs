/**
 * Test kết nối database
 * Usage: pnpm db:test
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("✗ DATABASE_URL chưa được set trong .env.local");
  process.exit(1);
}

// DATABASE_URL is guaranteed non-empty after the guard above
const dbUrl = DATABASE_URL;

const safeUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
console.log(`\nKết nối tới: ${safeUrl}\n`);

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    connect_timeout: 5, // fail nhanh nếu lỗi
  });

  try {
    const result = await sql`SELECT NOW() as now`;
    console.log("✅ DB connected");
    console.log("Time:", result[0].now);
  } catch (err) {
    console.error("❌ DB connection failed");
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
