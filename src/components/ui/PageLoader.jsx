export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg width="40" height="40" viewBox="0 0 40 40" className="animate-spin text-mulberry-500">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
          <path d="M20 4a16 16 0 0 1 16 16" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <p className="font-mono text-xs uppercase tracking-widest text-cocoa-400">Loading…</p>
      </div>
    </div>
  );
}
