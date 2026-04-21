'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 glass-hi">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center gap-5">
          {!isHome && (
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-text transition"
            >
              <BackArrow />
              <span>首页</span>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md border border-white/20 grid place-items-center text-white font-semibold text-[13px] tracking-tight">
              E
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold tracking-wide">Echo</div>
              <div className="text-[10px] text-muted tracking-wider">AD · ECHO OF STORY</div>
            </div>
          </Link>

          <nav className="ml-4 hidden md:flex items-center gap-0.5">
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
                    'px-3 py-1.5 text-[13px] transition flex items-center gap-2 relative',
                    active
                      ? 'text-text'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <span className="text-[10px] text-muted/60 font-mono">{item.short}</span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute left-3 right-3 bottom-0 h-[1.5px] bg-amber" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="hidden md:block">
            <LLMStatusBadge />
          </div>

          <button
            className="md:hidden w-9 h-9 grid place-items-center rounded-md border border-white/10 text-muted hover:text-text transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-20 md:hidden pt-16">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative glass-hi border-b border-[color:var(--divider)] px-5 py-5">
            <nav className="flex flex-col gap-1">
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
                      'px-3 py-3 text-sm flex items-center gap-3 rounded-md border border-transparent',
                      active
                        ? 'text-text border-white/10 bg-white/4'
                        : 'text-muted hover:text-text'
                    )}
                  >
                    <span className="text-[10px] text-muted/60 font-mono w-6">{item.short}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-5 pt-4 border-t border-[color:var(--divider)] flex items-center justify-between">
              <span className="text-[11px] text-muted tracking-wider uppercase">LLM</span>
              <LLMStatusBadge />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BackArrow() {
  return (
    <svg viewBox="0 0 20 20" className="w-3 h-3">
      <path
        fill="currentColor"
        d="M9.7 4.3a1 1 0 010 1.4L6.4 9H16a1 1 0 110 2H6.4l3.3 3.3a1 1 0 01-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4">
      <path fill="currentColor" d="M3 5h14v2H3zm0 4h14v2H3zm0 4h14v2H3z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4">
      <path
        fill="currentColor"
        d="M5.3 4.3a1 1 0 011.4 0L10 7.6l3.3-3.3a1 1 0 111.4 1.4L11.4 9l3.3 3.3a1 1 0 11-1.4 1.4L10 10.4l-3.3 3.3a1 1 0 11-1.4-1.4L8.6 9 5.3 5.7a1 1 0 010-1.4z"
      />
    </svg>
  );
}
