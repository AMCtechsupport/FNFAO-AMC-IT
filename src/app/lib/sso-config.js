import "server-only";

const DEFAULT_LOGIN_DOMAIN = "manitobachiefs.com";

export function getLoginDomain() {
  return (process.env.LOGIN_DOMAIN || DEFAULT_LOGIN_DOMAIN)
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
}

export function isAzureSsoConfigured() {
  const tenantId = (process.env.AZURE_TENANT_ID || "").trim();
  const clientId = (process.env.AZURE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.AZURE_CLIENT_SECRET || "").trim();
  return !!(tenantId && clientId && clientSecret);
}

export function emailEligibleForMicrosoftSso(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized) return false;
  const domain = getLoginDomain();
  if (!domain) return true;
  return normalized.endsWith(`@${domain}`);
}

export function getBackdoorEmail() {
  return (process.env.ADMIN_EMAIL || process.env.BACKDOOR_EMAIL || "")
    .trim()
    .toLowerCase();
}

export async function findAdvocateByEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  const { query } = await import("./db.js");
  const result = await query(
    `SELECT advocate_id, "firstName", "lastName", email, role
     FROM "Advocates"
     WHERE LOWER(email) = $1
     LIMIT 1`,
    [normalized],
  );
  return result.rows[0] || null;
}

export function advocateToAuthUser(advocate) {
  return {
    id: String(advocate.advocate_id),
    email: advocate.email,
    name: `${advocate.firstName} ${advocate.lastName}`.trim(),
    role: advocate.role,
    advocateId: advocate.advocate_id,
  };
}
