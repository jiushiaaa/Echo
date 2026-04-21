'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import LLMStatusBadge from './LLMStatusBadge';

const NAV = [
  { href: '/', label: '首页' },
  { href: '/compare', label: '核心对比' },
  { href: '/mirror', label: '情绪镜像' },
  { href: '/governance', label: '品味守门人' },
  { href: '/value', label: '三方价值' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-5 md:px-8 lg:px-12 pointer-events-none">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 pointer-events-auto">
          {/* 左：Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-full liquid-glass grid place-items-center text-white font-heading italic text-[15px]">
              E
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-medium tracking-wide">Echo</div>
              <div className="text-[10px] text-muted tracking-wider uppercase">
                Ad · Echo of Story
              </div>
            </div>
          </Link>

          {/* 中：pill 导航 */}
          <nav className="liquid-glass rounded-full px-1.5 py-1 hidden md:flex items-center gap-0.5">
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
                    'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/75 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 右：状态 + 移动菜单 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <LLMStatusBadge />
            </div>
            <button
              className="md:hidden w-10 h-10 rounded-full liquid-glass grid place-items-center text-white/80 hover:text-white transition"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="菜单"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative mt-24 mx-5 liquid-glass rounded-3xl p-3">
            <nav className="flex flex-col">
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
                      'px-4 py-3 text-sm rounded-2xl flex items-center justify-between',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/75 hover:text-white'
                    )}
                  >
                    <span>{item.label}</span>
                    {active && <span className="text-white/40 text-xs">·</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 px-4 py-3 flex items-center justify-between border-t border-white/10">
              <span className="text-[11px] text-white/50 tracking-widest uppercase">
                LLM
              </span>
              <LLMStatusBadge />
            </div>
          </div>
        </div>
      )}
    </>
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
