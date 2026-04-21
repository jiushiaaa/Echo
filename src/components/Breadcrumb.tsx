import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="max-w-[1280px] mx-auto px-6 pt-28 md:pt-32 pb-2"
    >
      <ol className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-white/50 font-body">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-white' : ''}>{item.label}</span>
              )}
              {!last && <span className="text-white/25">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
