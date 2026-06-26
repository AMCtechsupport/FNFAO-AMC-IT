import { NextResponse } from "next/server";
import { query } from "../../lib/db.js";
import { requireApiUser } from "../../lib/api-auth";

export async function GET() {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const result = await query(
      `SELECT
        aa.client_id,
        aa.advocate_id,
        a."firstName" AS advocate_first_name,
        a."lastName" AS advocate_last_name
      FROM "Assigned Advocates" aa
      INNER JOIN "Advocates" a ON a.advocate_id = aa.advocate_id
      ORDER BY aa."dateAssigned" DESC`,
    );

    const assignments = (result.rows || []).map((row) => ({
      client_id: row.client_id,
      advocate_id: row.advocate_id,
      advocateName: [row.advocate_first_name, row.advocate_last_name]
        .filter(Boolean)
        .join(" "),
    }));

    return NextResponse.json({ assignments });
  } catch (err) {
    console.error("[/api/client-assignments] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load assignments" },
      { status: 500 },
    );
  }
}
