import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    app: "ok",
    database: "unknown",
    advocatesTable: false,
    adminCount: 0,
    timestamp: new Date().toISOString(),
  };

  if (!process.env.DATABASE_URL) {
    checks.database = "missing DATABASE_URL";
    return NextResponse.json(checks, { status: 503 });
  }

  try {
    const { query } = await import("@/app/lib/db.js");
    await query("SELECT 1 AS ok");
    checks.database = "connected";

    try {
      const advocates = await query(
        `SELECT COUNT(*)::int AS count FROM "Advocates" WHERE role = 'admin'`,
      );
      checks.advocatesTable = true;
      checks.adminCount = advocates.rows[0]?.count ?? 0;
    } catch (tableErr) {
      checks.database = `connected but schema not ready: ${tableErr.message}`;
    }
  } catch (err) {
    checks.database = `error: ${err.message}`;
    return NextResponse.json(checks, { status: 503 });
  }

  return NextResponse.json(checks);
}
