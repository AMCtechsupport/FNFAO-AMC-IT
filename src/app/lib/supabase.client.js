import { createQueryClient } from "./query-builder.js";

async function clientExecutor(payload) {
  let res;
  let json;
  try {
    res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    json = await res.json();
  } catch (err) {
    return { data: null, error: { message: err.message || "Network error contacting database" } };
  }

  if (!res.ok) {
    const message =
      [json.error, json.details].filter(Boolean).join(": ") || "Database request failed";
    return { data: null, error: { message, details: json.details, code: json.code } };
  }

  if (json?.error) {
    const dbError = json.error;
    const message =
      typeof dbError === "string"
        ? dbError
        : [dbError.message, dbError.code].filter(Boolean).join(" ");
    return {
      data: null,
      error: {
        message: message || "Database request failed",
        details: typeof dbError === "object" ? dbError.details : undefined,
        code: typeof dbError === "object" ? dbError.code : undefined,
      },
    };
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
        async upload(storagePath, fileOrBuffer, options = {}) {
          const formData = new FormData();
          formData.append("storage_path", storagePath);

          if (typeof File !== "undefined" && fileOrBuffer instanceof File) {
            formData.append("file", fileOrBuffer);
          } else if (fileOrBuffer instanceof Blob) {
            formData.append("file", fileOrBuffer);
          } else {
            const blob = new Blob([fileOrBuffer], {
              type: options.contentType || "application/octet-stream",
            });
            formData.append("file", blob, storagePath.split("/").pop() || "upload");
          }

          const res = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            return { data: null, error: { message: json.error || "Upload failed" } };
          }
          return { data: { path: json.path || storagePath }, error: null };
        },
        async createSignedUrl(storagePath, _expiresIn = 3600, options = {}) {
          const params = new URLSearchParams({ file_path: storagePath });
          if (options.inline) {
            params.set("inline", "1");
          }
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
