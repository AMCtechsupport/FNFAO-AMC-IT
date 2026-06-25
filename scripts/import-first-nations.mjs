import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSV_PATH = path.join(__dirname, "..", "documents", "FirstNations.csv");

/**
 * Minimal RFC 4180 CSV parser (handles quoted fields and embedded newlines).
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || (char === "\r" && text[i + 1] === "\n")) {
      row.push(field);
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      if (char === "\r") i++;
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  const cleaned = normalizeText(value);
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function headerIndex(headers, ...names) {
  const normalized = headers.map((h) => normalizeText(h).toLowerCase());
  for (const name of names) {
    const index = normalized.indexOf(name.toLowerCase());
    if (index !== -1) return index;
  }
  return -1;
}

export async function ensureFirstNationsColumns(pool) {
  await pool.query(`ALTER TABLE "First Nations" ADD COLUMN IF NOT EXISTS "bandNumber" INTEGER`);
  await pool.query(`ALTER TABLE "First Nations" ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
  await pool.query(`ALTER TABLE "First Nations" ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);
  await pool.query(`ALTER TABLE "First Nations" ADD COLUMN IF NOT EXISTS "bandOfficePhone" TEXT`);
  await pool.query(`ALTER TABLE "First Nations" ADD COLUMN IF NOT EXISTS "chiefName" TEXT`);
}

export async function importFirstNationsFromCsv(pool, csvPath = DEFAULT_CSV_PATH) {
  if (!fs.existsSync(csvPath)) {
    console.log(`First Nations CSV not found at ${csvPath}; skipping import.`);
    return { imported: 0, skipped: true };
  }

  await ensureFirstNationsColumns(pool);

  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    console.log("First Nations CSV has no data rows; skipping import.");
    return { imported: 0, skipped: true };
  }

  const headers = rows[0];
  const bandIdx = headerIndex(headers, "BandNumber", "band_number_from_isc");
  const nameIdx = headerIndex(headers, "FirstNation", "first_nation");
  const phoneIdx = headerIndex(headers, "BanOfficePhone", "BandOfficePhone");
  const chiefIdx = headerIndex(headers, "CurrentChief");
  const latIdx = headerIndex(headers, "Latitude");
  const lngIdx = headerIndex(headers, "Longitide", "Longitude");

  if (nameIdx === -1) {
    throw new Error("First Nations CSV is missing a FirstNation column.");
  }

  let imported = 0;

  for (const row of rows.slice(1)) {
    const firstNationMembership = normalizeText(row[nameIdx]);
    if (!firstNationMembership) continue;

    const bandNumber = bandIdx === -1 ? null : parseNumber(row[bandIdx]);
    const latitude = latIdx === -1 ? null : parseNumber(row[latIdx]);
    const longitude = lngIdx === -1 ? null : parseNumber(row[lngIdx]);
    const bandOfficePhone = phoneIdx === -1 ? null : normalizeText(row[phoneIdx]) || null;
    const chiefName = chiefIdx === -1 ? null : normalizeText(row[chiefIdx]) || null;

    await pool.query(
      `INSERT INTO "First Nations"
        ("firstNationMembership", "bandNumber", latitude, longitude, "bandOfficePhone", "chiefName")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("firstNationMembership") DO UPDATE SET
         "bandNumber" = EXCLUDED."bandNumber",
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         "bandOfficePhone" = EXCLUDED."bandOfficePhone",
         "chiefName" = EXCLUDED."chiefName"`,
      [firstNationMembership, bandNumber, latitude, longitude, bandOfficePhone, chiefName],
    );
    imported++;
  }

  console.log(`Imported ${imported} First Nations from ${path.basename(csvPath)}.`);
  return { imported, skipped: false };
}

export async function seedDefaultFirstNationOptions(pool) {
  const defaultFirstNations = ["Non-Status", "Métis", "Metis", "Other"];
  for (const name of defaultFirstNations) {
    await pool.query(
      `INSERT INTO "First Nations" ("firstNationMembership") VALUES ($1)
       ON CONFLICT ("firstNationMembership") DO NOTHING`,
      [name],
    );
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const useSsl =
    process.env.DB_SSL === "true" ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("ondigitalocean.com");

  const pg = await import("pg");
  const pool = new pg.default.Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await importFirstNationsFromCsv(pool);
    await seedDefaultFirstNationOptions(pool);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
