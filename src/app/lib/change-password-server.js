"use server";

import bcrypt from "bcryptjs";
import { requireUser } from "./auth-server";
import { query } from "./db.js";

export async function changePassword({ currentPassword, newPassword }) {
  const user = await requireUser();

  if (!currentPassword || !newPassword) {
    throw new Error("Current and new password are required.");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const result = await query(
    `SELECT password_hash FROM "Advocates" WHERE advocate_id = $1`,
    [user.advocateId],
  );

  const row = result.rows[0];
  if (!row?.password_hash) {
    throw new Error("Account has no password set.");
  }

  const valid = await bcrypt.compare(currentPassword, row.password_hash);
  if (!valid) {
    throw new Error("Current password is incorrect.");
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await query(`UPDATE "Advocates" SET password_hash = $1 WHERE advocate_id = $2`, [
    hash,
    user.advocateId,
  ]);

  return { success: true };
}
