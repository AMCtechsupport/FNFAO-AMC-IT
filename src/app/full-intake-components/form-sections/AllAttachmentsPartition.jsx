"use client";

import { useEffect, useMemo, useState } from "react";
import FormattedDate from "@/components/FormattedDate";
import AttachmentViewerPane from "@/components/AttachmentViewerPane";
import { getFileKind } from "@/app/lib/attachment-utils";

function noteTypeLabel(noteType) {
  const type = String(noteType || "").toLowerCase();
  if (type === "legal") return "Legal Note";
  if (type === "case") return "Case Note";
  return noteType || "Note";
}

export default function AllAttachmentsPartition({ notesData }) {
  const attachments = useMemo(
    () =>
      (notesData || [])
        .filter((note) => note.fileName && note.filePath)
        .sort((a, b) => (b.note_id || 0) - (a.note_id || 0)),
    [notesData],
  );

  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    if (!attachments.length) {
      setSelectedKey(null);
      return;
    }

    const stillExists = attachments.some(
      (item) => `${item.note_id}-${item.filePath}` === selectedKey,
    );
    if (!stillExists) {
      const first = attachments[0];
      setSelectedKey(`${first.note_id}-${first.filePath}`);
    }
  }, [attachments, selectedKey]);

  const selectedAttachment =
    attachments.find((item) => `${item.note_id}-${item.filePath}` === selectedKey) ||
    attachments[0] ||
    null;

  if (!attachments.length) {
    return (
      <p className="text-sm text-gray-500 italic">
        No attached files yet. Add attachments on Case Notes or Legal Notes.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
          >
            Attached Files ({attachments.length})
          </div>
          <ul className="divide-y divide-gray-100 max-h-[32rem] overflow-y-auto">
            {attachments.map((item) => {
              const key = `${item.note_id}-${item.filePath}`;
              const isSelected = key === selectedKey;
              const kind = getFileKind(item.fileName);

              return (
                <li key={key}>
                  <button
                    type="button"
                    data-view-allow="true"
                    onClick={() => setSelectedKey(key)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected ? "bg-purple-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 break-words">
                        {item.fileName}
                      </span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        {kind}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                        {noteTypeLabel(item.noteType)}
                      </span>
                      <FormattedDate dateString={item.createdAt} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-8">
        <AttachmentViewerPane
          filePath={selectedAttachment?.filePath}
          fileName={selectedAttachment?.fileName}
          minHeightClass="min-h-[32rem]"
        />
      </div>
    </div>
  );
}
