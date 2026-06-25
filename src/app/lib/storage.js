import "server-only";
import fs from "fs/promises";
import path from "path";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getAppPublicUrl } from "./app-url.js";
import { getSpacesConfig, isSpacesEnabled } from "./spaces-config.js";

const ATTACHMENTS_DIR =
  process.env.ATTACHMENTS_DIR || path.join(process.cwd(), "storage", "attachments");

let s3Client = null;

function getS3Client() {
  const config = getSpacesConfig();
  if (!config) {
    throw new Error("DigitalOcean Spaces is not configured");
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  return s3Client;
}

function normalizeStoragePath(storagePath) {
  return String(storagePath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^(\.\.(\/|$))+/, "");
}

function objectKey(storagePath) {
  const config = getSpacesConfig();
  const normalized = normalizeStoragePath(storagePath);
  return config.prefix ? `${config.prefix}/${normalized}` : normalized;
}

function resolveLocalPath(storagePath) {
  const normalized = normalizeStoragePath(storagePath);
  return path.join(ATTACHMENTS_DIR, normalized);
}

async function ensureLocalDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function uploadToSpaces(storagePath, buffer, options = {}) {
  const config = getSpacesConfig();
  const key = objectKey(storagePath);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || "application/octet-stream",
    }),
  );

  return { data: { path: storagePath }, error: null };
}

async function uploadToLocal(storagePath, buffer) {
  try {
    const fullPath = resolveLocalPath(storagePath);
    await ensureLocalDir(fullPath);
    await fs.writeFile(fullPath, buffer);
    return { data: { path: storagePath }, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

async function objectExists(storagePath) {
  if (isSpacesEnabled()) {
    const config = getSpacesConfig();
    try {
      await getS3Client().send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: objectKey(storagePath),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  try {
    await fs.access(resolveLocalPath(storagePath));
    return true;
  } catch {
    return false;
  }
}

function buildDownloadUrl(storagePath, options = {}) {
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
  const baseUrl = getAppPublicUrl();
  return `${baseUrl}/api/files/download?${params.toString()}`;
}

export const storage = {
  from(_bucket) {
    return {
      async upload(storagePath, body, options = {}) {
        try {
          const buffer = Buffer.isBuffer(body)
            ? body
            : body instanceof ArrayBuffer
              ? Buffer.from(body)
              : body?.arrayBuffer
                ? Buffer.from(await body.arrayBuffer())
                : Buffer.from(body);

          if (isSpacesEnabled()) {
            return uploadToSpaces(storagePath, buffer, options);
          }
          return uploadToLocal(storagePath, buffer);
        } catch (err) {
          console.error("[storage] Upload failed:", err);
          return { data: null, error: { message: err.message || "Upload failed" } };
        }
      },

      async createSignedUrl(storagePath, _expiresIn = 3600, options = {}) {
        try {
          const exists = await objectExists(storagePath);
          if (!exists) {
            return { data: null, error: { message: "File not found" } };
          }

          return {
            data: { signedUrl: buildDownloadUrl(storagePath, options) },
            error: null,
          };
        } catch (err) {
          return { data: null, error: { message: err.message || "File not found" } };
        }
      },
    };
  },
};

export async function readAttachment(storagePath) {
  if (isSpacesEnabled()) {
    const config = getSpacesConfig();
    const result = await getS3Client().send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: objectKey(storagePath),
      }),
    );

    if (!result.Body) {
      throw new Error("File not found");
    }

    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  return fs.readFile(resolveLocalPath(storagePath));
}

export async function getAttachmentContentType(storagePath) {
  if (isSpacesEnabled()) {
    try {
      const config = getSpacesConfig();
      const head = await getS3Client().send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: objectKey(storagePath),
        }),
      );
      return head.ContentType || "application/octet-stream";
    } catch {
      return "application/octet-stream";
    }
  }

  return "application/octet-stream";
}