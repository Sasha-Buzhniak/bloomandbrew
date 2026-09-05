export function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div
      data-testid="marquee-ribbon"
      className={`overflow-hidden border-y py-4 ${dark ? "border-cream/15 bg-espresso text-cream" : "border-espresso/10 bg-rosemist/60 text-espresso"}`}
    >
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-[11px] uppercase tracking-[0.3em]">
            {item}
            <span className="font-script text-xl normal-case tracking-normal text-blushdeep" aria-hidden="true">♡</span>
          </span>
        ))}
      </div>
    </div>
  );
}
