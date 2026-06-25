"use client";

import AttachmentViewerPane from "@/components/AttachmentViewerPane";

export default function NoteAttachmentPreview({ filePath, fileName }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <AttachmentViewerPane filePath={filePath} fileName={fileName} />
    </div>
  );
}
