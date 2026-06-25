export default function StickyFormActions({ children, className = "" }) {
  return (
    <>
      <div className="h-20" aria-hidden="true" />
      <div
        className={`fixed bottom-0 left-[var(--sidebar-width,14rem)] right-0 z-40 border-t border-gray-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {children}
        </div>
      </div>
    </>
  );
}
