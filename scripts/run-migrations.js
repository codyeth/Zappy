/**
 * Chạy lần lượt 4 file SQL migration theo thứ tự.
 * Cần biến môi trường SUPABASE_DB_URL trong .env.local (Postgres connection string).
 *
 * Lấy URL: Supabase Dashboard → Settings → Database → Connection string → URI
 * Thay [YOUR-PASSWORD] bằng Database password.
 */
const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
const order = [
  "20240101000001_init_schema.sql",
  "20240101000002_rls.sql",
  "20240101000003_functions.sql",
  "20240101000004_seed.sql",
];

async function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return process.env;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return process.env;
}

async function main() {
  await loadEnv();
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl || !dbUrl.startsWith("postgresql://")) {
    console.error(
      "Thiếu SUPABASE_DB_URL trong .env.local.\n" +
        "Thêm: SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres\n" +
        "Lấy từ: Supabase Dashboard → Settings → Database → Connection string (URI)"
    );
    process.exit(1);
  }

  let pg;
  try {
    pg = require("pg");
  } catch {
    console.error("Cài đặt pg: npm install pg");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Đã kết nối DB.\n");
    for (const file of order) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.error("Không tìm thấy:", filePath);
        process.exit(1);
      }
      const sql = fs.readFileSync(filePath, "utf8");
      console.log("Chạy:", file);
      await client.query(sql);
      console.log("  OK\n");
    }
    console.log("Xong. Đã chạy 4 migration.");
  } catch (err) {
    console.error("Lỗi:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
