import "server-only";

function parseSpacesHost(hostname) {
  const host = hostname.toLowerCase();

  const virtualHosted = /^([a-z0-9-]+)\.([a-z0-9-]+)\.digitaloceanspaces\.com$/.exec(host);
  if (virtualHosted) {
    const [, bucket, region] = virtualHosted;
    return {
      endpoint: `https://${region}.digitaloceanspaces.com`,
      region,
      bucketHint: bucket,
    };
  }

  const regional = /^([a-z0-9-]+)\.digitaloceanspaces\.com$/.exec(host);
  if (regional) {
    return {
      endpoint: `https://${regional[1]}.digitaloceanspaces.com`,
      region: regional[1],
      bucketHint: null,
    };
  }

  return null;
}

function normalizeSpacesEndpoint(endpointUrl) {
  try {
    const parsed = parseSpacesHost(new URL(endpointUrl.trim()).hostname);
    if (parsed) return parsed;
  } catch {
    /* ignore */
  }

  return { endpoint: endpointUrl.trim(), region: null, bucketHint: null };
}

function resolveSpacesRegion(endpointUrl, explicit) {
  const ex = explicit?.trim();
  if (ex) return ex;

  const normalized = normalizeSpacesEndpoint(endpointUrl);
  if (normalized.region) return normalized.region;

  return "us-east-1";
}

function normalizeSpacesBucket(raw, bucketHint = null) {
  if (bucketHint) return bucketHint;

  let bucket = raw.trim();
  if (!bucket) return bucket;
  if (bucket.toLowerCase().includes("digitaloceanspaces.com")) {
    try {
      const parsed = parseSpacesHost(new URL(bucket.includes("://") ? bucket : `https://${bucket}`).hostname);
      if (parsed?.bucketHint) return parsed.bucketHint;
    } catch {
      /* ignore */
    }
  }
  return bucket;
}

export function getSpacesConfig() {
  const endpointRaw = process.env.SPACES_ENDPOINT?.trim();
  const bucketRaw = process.env.SPACES_BUCKET?.trim();
  const accessKeyId = process.env.SPACES_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.SPACES_SECRET_ACCESS_KEY?.trim();

  if (!endpointRaw || !bucketRaw || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const endpointInfo = normalizeSpacesEndpoint(endpointRaw);

  return {
    endpoint: endpointInfo.endpoint,
    bucket: normalizeSpacesBucket(bucketRaw, endpointInfo.bucketHint),
    region: resolveSpacesRegion(endpointInfo.endpoint, process.env.SPACES_REGION),
    accessKeyId,
    secretAccessKey,
    prefix: (process.env.SPACES_ATTACHMENTS_PREFIX || "attachments")
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+$/, ""),
  };
}

export function isSpacesEnabled() {
  return getSpacesConfig() != null;
}
