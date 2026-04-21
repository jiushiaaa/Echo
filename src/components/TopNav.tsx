'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LLMStatusBadge from './LLMStatusBadge';

const NAV = [
  { href: '/', label: '场景', short: '01' },
  { href: '/compare', label: '对比', short: '02' },
  { href: '/mirror', label: '镜像', short: '03' },
  { href: '/governance', label: '治理', short: '04' },
  { href: '/value', label: '价值', short: '05' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-5 py-3 glass-hi border-b border-white/5">
      <div className="max-w-[1400px] mx-auto flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-echo to-accent grid place-items-center text-white font-bold text-sm">
            E
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-wide">Echo</div>
            <div className="text-[10px] text-muted -mt-0.5">广告是剧集的回声</div>
          </div>
        </Link>

        <nav className="ml-6 hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2',
                  active
                    ? 'bg-white/8 text-text'
                    : 'text-muted hover:text-text hover:bg-white/4'
                )}
              >
                <span className="text-[10px] text-muted/60 font-mono">{item.short}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />
        <LLMStatusBadge />
      </div>
    </header>
  );
}
