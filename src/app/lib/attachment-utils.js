export function getFileKind(fileName) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  return "other";
}

export async function fetchPreviewBlobUrl(filePath, fileName) {
  const params = new URLSearchParams({ file_path: filePath, inline: "1" });
  if (fileName) params.set("file_name", fileName);

  const res = await fetch(`/api/files/download?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || `Could not load attachment (${res.status})`);
  }

  const buffer = await res.arrayBuffer();
  const headerType = res.headers.get("content-type") || "";
  const ext = (fileName || filePath).split(".").pop()?.toLowerCase();
  const fallbackType =
    ext === "pdf"
      ? "application/pdf"
      : ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)
        ? `image/${ext === "jpg" ? "jpeg" : ext}`
        : "application/octet-stream";
  const mimeType =
    headerType && headerType !== "application/octet-stream" ? headerType : fallbackType;

  return URL.createObjectURL(new Blob([buffer], { type: mimeType }));
}

export async function fetchDownloadUrl(filePath, fileName) {
  const params = new URLSearchParams({ file_path: filePath });
  if (fileName) params.set("file_name", fileName);

  const res = await fetch(`/api/notes/download?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Could not prepare download");
  }

  const { signedUrl } = await res.json();
  if (!signedUrl) {
    throw new Error("Download URL unavailable");
  }

  return signedUrl;
}
