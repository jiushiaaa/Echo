import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="max-w-[1280px] mx-auto px-6 pt-20 pb-2"
    >
      <ol className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-muted">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="hover:text-text transition"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-text' : ''}>{item.label}</span>
              )}
              {!last && <span className="text-muted/50">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
