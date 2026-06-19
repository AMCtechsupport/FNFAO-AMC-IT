import { createQueryClient } from "./query-builder.js";

async function clientExecutor(payload) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    return { data: null, error: { message: json.error || "Database request failed" } };
  }
  return json;
}

const dbClient = createQueryClient(clientExecutor);

const supabase = {
  from(table) {
    return dbClient.from(table);
  },
  storage: {
    from(_bucket) {
      return {
        async upload() {
          return { data: null, error: { message: "Upload through /api/notes" } };
        },
        async createSignedUrl(storagePath, _expiresIn = 3600, options = {}) {
          const params = new URLSearchParams({ file_path: storagePath });
          if (options.download) {
            params.set(
              "file_name",
              typeof options.download === "string" ? options.download : "download",
            );
          }
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
          return { data: { signedUrl: `${baseUrl}/api/files/download?${params.toString()}` }, error: null };
        },
      };
    },
  },
  channel(_name) {
    return dbClient.channel(_name);
  },
  auth: {
    async setSession() {
      return { data: { session: null }, error: null };
    },
  },
};

export default supabase;
