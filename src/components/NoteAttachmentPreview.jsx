"use client";

import { useEffect, useState } from "react";

function getFileKind(fileName) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  return "other";
}

async function fetchAttachmentUrl(filePath, fileName, { inline = false } = {}) {
  const params = new URLSearchParams({ file_path: filePath });
  if (fileName) params.set("file_name", fileName);
  if (inline) params.set("inline", "1");

  const res = await fetch(`/api/notes/download?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Could not load attachment");
  }

  const { signedUrl } = await res.json();
  if (!signedUrl) {
    throw new Error("Attachment URL unavailable");
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

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const url = await fetchAttachmentUrl(filePath, fileName, { inline: true });
        if (!cancelled) setPreviewUrl(url);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to load preview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filePath, fileName, canPreview]);

  const handleDownload = async () => {
    try {
      const url = await fetchAttachmentUrl(filePath, fileName);
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
