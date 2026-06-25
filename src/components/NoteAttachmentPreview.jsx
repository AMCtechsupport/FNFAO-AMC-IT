"use client";

import { useEffect, useState } from "react";

function getFileKind(fileName) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  return "other";
}

async function fetchPreviewBlobUrl(filePath, fileName) {
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

async function fetchDownloadUrl(filePath, fileName) {
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

export default function NoteAttachmentPreview({ filePath, fileName }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fileKind = getFileKind(fileName);
  const canPreview = fileKind === "pdf" || fileKind === "image";

  useEffect(() => {
    if (!filePath || !canPreview) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    (async () => {
      setLoading(true);
      setLoadError(null);
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });

      try {
        objectUrl = await fetchPreviewBlobUrl(filePath, fileName);
        if (!cancelled) setPreviewUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to load preview");
        }
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath, fileName, canPreview]);

  const handleDownload = async () => {
    try {
      const url = await fetchDownloadUrl(filePath, fileName);
      window.open(url, "_blank");
    } catch {
      // ignore — user can retry
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
          {fileName}
        </span>
        <button
          type="button"
          className="px-3 py-1 text-xs font-semibold rounded-lg transition-colors border border-blue-300 text-blue-600 bg-white hover:bg-blue-50"
          onClick={handleDownload}
          data-view-allow="true"
        >
          Download
        </button>
      </div>

      <div className="flex-1 w-full min-w-0 min-h-[28rem] border border-gray-200 rounded-lg overflow-hidden bg-white">
        {!canPreview && (
          <div className="flex h-full min-h-[28rem] items-center justify-center p-6 text-center text-sm text-gray-500">
            Preview is not available for this file type. Use Download to open the file.
          </div>
        )}

        {canPreview && loading && (
          <div className="flex h-full min-h-[28rem] items-center justify-center text-sm text-gray-500">
            Loading preview…
          </div>
        )}

        {canPreview && loadError && (
          <div className="flex h-full min-h-[28rem] items-center justify-center p-6 text-center text-sm text-red-600">
            {loadError}
          </div>
        )}

        {canPreview && !loading && !loadError && fileKind === "pdf" && previewUrl && (
          <iframe
            src={previewUrl}
            title={fileName}
            className="w-full h-[28rem] border-0"
          />
        )}

        {canPreview && !loading && !loadError && fileKind === "image" && previewUrl && (
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-[28rem] object-contain bg-gray-50"
          />
        )}
      </div>
    </div>
  );
}
