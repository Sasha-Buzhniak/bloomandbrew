export function HeartDoodle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20.5c-5.5-3.8-8.5-7-8.5-10.6 0-2.6 2-4.4 4.3-4.4 1.7 0 3.2 1 4.2 2.6 1-1.6 2.5-2.6 4.2-2.6 2.3 0 4.3 1.8 4.3 4.4 0 3.6-3 6.8-8.5 10.6Z" />
    </svg>
  );
}

export function FlowerDoodle({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4c1.5 1.8 1.5 4.2 0 6-1.5-1.8-1.5-4.2 0-6Z" />
      <path d="M12 14c1.5 1.8 1.5 4.2 0 6-1.5-1.8-1.5-4.2 0-6Z" />
      <path d="M4 12c1.8-1.5 4.2-1.5 6 0-1.8 1.5-4.2 1.5-6 0Z" />
      <path d="M14 12c1.8-1.5 4.2-1.5 6 0-1.8 1.5-4.2 1.5-6 0Z" />
      <path d="M12 16v5" />
    </svg>
  );
}

export function SectionOverline({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-3 text-[11px] uppercase tracking-micro text-espresso/60">
      <span className="h-px w-8 bg-espresso/30" aria-hidden="true" />
      {children}
      <span className="h-px w-8 bg-espresso/30" aria-hidden="true" />
    </p>
  );
}
