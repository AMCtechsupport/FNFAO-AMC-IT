import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

function resolveSpacesRegion(endpointUrl, explicit) {
  const ex = explicit?.trim();
  if (ex) return ex;
  try {
    const host = new URL(endpointUrl.trim()).hostname.toLowerCase();
    const match = /^([a-z0-9-]+)\.digitaloceanspaces\.com$/.exec(host);
    if (match) return match[1];
  } catch {
    /* ignore */
  }
  return "us-east-1";
}

function normalizeSpacesBucket(raw) {
  let bucket = raw.trim();
  if (!bucket) return bucket;
  if (bucket.toLowerCase().includes("digitaloceanspaces.com")) {
    try {
      const url = new URL(bucket.includes("://") ? bucket : `https://${bucket}`);
      const parts = url.hostname.toLowerCase().split(".");
      if (
        parts.length >= 4 &&
        parts[parts.length - 2] === "digitaloceanspaces" &&
        parts[parts.length - 1] === "com"
      ) {
        return parts[0];
      }
    } catch {
      /* ignore */
    }
  }
  return bucket;
}

async function main() {
  const endpoint = process.env.SPACES_ENDPOINT?.trim();
  const bucket = process.env.SPACES_BUCKET?.trim();
  const accessKeyId = process.env.SPACES_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.SPACES_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    console.log("DigitalOcean Spaces not configured; using local disk for attachments.");
    return;
  }

  const client = new S3Client({
    endpoint,
    region: resolveSpacesRegion(endpoint, process.env.SPACES_REGION),
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  const bucketName = normalizeSpacesBucket(bucket);

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    const prefix = (process.env.SPACES_ATTACHMENTS_PREFIX || "attachments")
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
    console.log(`DigitalOcean Spaces ready (bucket: ${bucketName}, prefix: ${prefix}).`);
  } catch (err) {
    console.warn(
      `DigitalOcean Spaces check failed for bucket "${bucketName}": ${err?.message || err}`,
    );
  }
}

main().catch((err) => {
  console.warn("Spaces verification error:", err?.message || err);
});
