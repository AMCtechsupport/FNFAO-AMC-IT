/**
 * Decodes common HTML entities in a string.
 * Used to fix values stored with HTML-encoded characters (e.g., &#x27; → ').
 */
export function decodeHtml(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}
