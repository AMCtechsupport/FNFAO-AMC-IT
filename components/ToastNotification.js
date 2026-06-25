export default function ToastNotification({ toast, position = "bottom-6" }) {
  if (!toast) return null;

  const isError = toast.type !== "success";

  return (
    <div
      className={`fixed ${position} right-6 z-50 max-w-lg px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
        isError ? "bg-red-600" : "bg-green-500"
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        <div className="min-w-0">
          {isError && <p className="font-semibold mb-1">Save failed</p>}
          <p className="whitespace-pre-wrap break-words leading-snug font-medium">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
