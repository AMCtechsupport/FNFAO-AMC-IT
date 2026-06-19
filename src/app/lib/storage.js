import "server-only";
import fs from "fs/promises";
import path from "path";

const ATTACHMENTS_DIR =
  process.env.ATTACHMENTS_DIR || path.join(process.cwd(), "storage", "attachments");

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function resolvePath(storagePath) {
  const normalized = path.normalize(storagePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(ATTACHMENTS_DIR, normalized);
}

export const storage = {
  from(_bucket) {
    return {
      async upload(storagePath, buffer, _options = {}) {
        try {
          const fullPath = resolvePath(storagePath);
          await ensureDir(fullPath);
          await fs.writeFile(fullPath, buffer);
          return { data: { path: storagePath }, error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },

      async createSignedUrl(storagePath, _expiresIn = 3600, options = {}) {
        try {
          const fullPath = resolvePath(storagePath);
          await fs.access(fullPath);
          const params = new URLSearchParams({ file_path: storagePath });
          if (options.download) {
            params.set(
              "file_name",
              typeof options.download === "string" ? options.download : "download",
            );
          }
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
          const signedUrl = `${baseUrl}/api/files/download?${params.toString()}`;
          return { data: { signedUrl }, error: null };
        } catch (err) {
          return { data: null, error: { message: err.message || "File not found" } };
        }
      },
    };
  },
};

export async function readAttachment(storagePath) {
  const fullPath = resolvePath(storagePath);
  return fs.readFile(fullPath);
}
