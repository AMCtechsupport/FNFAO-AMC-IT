import fs from "fs";
import path from "path";
import pg from "pg";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const useSsl =
    process.env.DB_SSL === "true" ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("ondigitalocean.com");

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@fnfao.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Create admin only if that email does not exist yet (safe to run on every deploy).
  const existingAdmin = await pool.query(
    `SELECT advocate_id FROM "Advocates" WHERE LOWER(email) = $1 LIMIT 1`,
    [adminEmail],
  );

  if (existingAdmin.rows.length === 0) {
    await pool.query(
      `INSERT INTO "Advocates" ("firstName", "lastName", email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')`,
      ["Admin", "User", adminEmail, passwordHash],
    );
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail} (password unchanged)`);
  }

  const seedDropdowns = [
    ['INSERT INTO "First Nations" ("firstNationMembership") VALUES ($1) ON CONFLICT DO NOTHING', ["Sample First Nation"]],
    ['INSERT INTO "CFS Agencies" ("agencyName") VALUES ($1) ON CONFLICT DO NOTHING', ["Sample CFS Agency"]],
    ['INSERT INTO "CFS Status" ("cfsStatus") VALUES ($1) ON CONFLICT DO NOTHING', ["Open"]],
  ];

  for (const [sql, params] of seedDropdowns) {
    await pool.query(sql, params);
  }

  console.log("Database schema applied.");
  console.log(`Admin user ready: ${adminEmail}`);
  console.log("Change ADMIN_PASSWORD after first login.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
