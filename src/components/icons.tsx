interface IconProps {
  className?: string;
}

export function FolderIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`shrink-0 text-amber-500 ${className}`}>
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4.38a1.5 1.5 0 0 1 1.06.44L10.5 6h6A1.5 1.5 0 0 1 18 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9Z" />
    </svg>
  );
}

export function FileIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`shrink-0 text-slate-400 ${className}`}>
      <path d="M5.5 2.75h5.69c.4 0 .78.16 1.06.44l3.06 3.06c.28.28.44.66.44 1.06v9.44c0 .41-.34.75-.75.75h-9.5a.75.75 0 0 1-.75-.75V3.5c0-.41.34-.75.75-.75Z" />
      <path d="M11 2.75V6.5c0 .41.34.75.75.75h3.75" />
    </svg>
  );
}

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`size-4 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}>
      <path d="M7.5 5.5 12 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NodeIcon({ type, className }: { type: "file" | "folder"; className?: string }) {
  return type === "folder" ? <FolderIcon className={className} /> : <FileIcon className={className} />;
}
