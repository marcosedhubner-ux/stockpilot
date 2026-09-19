/**
 * Small on-brand glyph for empty/placeholder states — a muted scanner-blue
 * barcode mark, echoing the `.barcode-stripes` motif used on the login
 * screen without repeating its full-strength treatment.
 */
export function BarcodeGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 28"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="4" width="2" height="20" rx="1" fill="currentColor" />
      <rect x="6" y="4" width="1" height="20" rx="0.5" fill="currentColor" />
      <rect x="10" y="4" width="3" height="20" rx="1" fill="currentColor" />
      <rect x="16" y="4" width="1" height="20" rx="0.5" fill="currentColor" />
      <rect x="19" y="4" width="2" height="20" rx="1" fill="currentColor" />
      <rect x="24" y="4" width="1" height="20" rx="0.5" fill="currentColor" />
      <rect x="27" y="4" width="2" height="20" rx="1" fill="currentColor" />
      <rect x="32" y="4" width="3" height="20" rx="1" fill="currentColor" />
      <rect x="37" y="4" width="1" height="20" rx="0.5" fill="currentColor" />
    </svg>
  );
}
