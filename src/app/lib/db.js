import "server-only";
import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required. Link your DigitalOcean PostgreSQL database or set DATABASE_URL in .env.local.",
    );
  }

  if (!pool) {
    const useSsl =
      process.env.DB_SSL === "true" ||
      process.env.DATABASE_URL.includes("sslmode=require") ||
      process.env.DATABASE_URL.includes("ondigitalocean.com");

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }

  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}

export function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}
