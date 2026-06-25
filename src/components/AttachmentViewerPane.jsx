"use client";

import { useEffect, useState } from "react";
import {
  fetchDownloadUrl,
  fetchPreviewBlobUrl,
  getFileKind,
} from "@/app/lib/attachment-utils";

export default function AttachmentViewerPane({
  filePath,
  fileName,
  minHeightClass = "min-h-[28rem]",
  showToolbar = true,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileKind = getFileKind(fileName);
  const canPreview = fileKind === "pdf" || fileKind === "image";

  useEffect(() => {
    if (!filePath || !fileName) {
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
      setLoadError(null);
      setLoading(false);
      return undefined;
    }

    if (!canPreview) {
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
      setLoadError(null);
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
    if (!filePath) return;
    try {
      const url = await fetchDownloadUrl(filePath, fileName);
      window.open(url, "_blank");
    } catch {
      // ignore — user can retry
    }
  };

  if (!filePath || !fileName) {
    return (
      <div
        className={`flex ${minHeightClass} items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500`}
      >
        Select a file from the list to preview it here.
      </div>
    );
  }

  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden ${minHeightClass}`}>
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-sm font-medium text-gray-800 truncate">{fileName}</span>
          <button
            type="button"
            className="px-3 py-1 text-xs font-semibold rounded-lg transition-colors border border-blue-300 text-blue-600 bg-white hover:bg-blue-50 shrink-0"
            onClick={handleDownload}
            data-view-allow="true"
          >
            Download
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {!canPreview && (
          <div className={`flex ${minHeightClass} items-center justify-center p-6 text-center text-sm text-gray-500`}>
            Preview is not available for this file type. Use Download to open the file.
          </div>
        )}

        {canPreview && loading && (
          <div className={`flex ${minHeightClass} items-center justify-center text-sm text-gray-500`}>
            Loading preview…
          </div>
        )}

        {canPreview && loadError && (
          <div className={`flex ${minHeightClass} items-center justify-center p-6 text-center text-sm text-red-600`}>
            {loadError}
          </div>
        )}

        {canPreview && !loading && !loadError && fileKind === "pdf" && previewUrl && (
          <iframe src={previewUrl} title={fileName} className="w-full h-full min-h-[26rem] border-0" />
        )}

        {canPreview && !loading && !loadError && fileKind === "image" && previewUrl && (
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full min-h-[26rem] object-contain bg-gray-50"
          />
        )}
      </div>
    </div>
  );
}
