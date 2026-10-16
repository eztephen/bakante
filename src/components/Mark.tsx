export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--court-surface)" />
      <rect x="5" y="7" width="22" height="18" fill="none" stroke="var(--court-paint)" strokeWidth="2" />
      <path d="M16 7v18M5 16h22" stroke="var(--court-paint)" strokeWidth="2" />
      <circle cx="23" cy="11" r="3.5" fill="var(--tangerine)" />
    </svg>
  );
}
