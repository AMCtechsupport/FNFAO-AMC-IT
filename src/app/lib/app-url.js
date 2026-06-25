export function getAppPublicUrl() {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "";
  return url.replace(/\/$/, "");
}

export function getLoginUrl() {
  const base = getAppPublicUrl();
  return base ? `${base}/login` : "/login";
}
