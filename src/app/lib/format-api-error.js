/**
 * Build a user-visible error string from API / database error objects.
 */
export function formatApiError(error, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const parts = [];
  if (error.message) parts.push(error.message);
  if (error.details && error.details !== error.message) parts.push(error.details);
  if (error.code) parts.push(`(${error.code})`);

  return parts.join("\n") || fallback;
}
