'use client';

import type { SceneDefinition } from '@/data/scenes';
import { cn } from '@/lib/utils';

/**
 * 剧集主视觉占位卡。
 * 刻意保持风格化/抽象——不侵犯任何 IP 版权，用色彩和意象代表气质。
 */
export default function ScenePoster({
  scene,
  size = 'md',
  active = false,
}: {
  scene: SceneDefinition;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}) {
  const heightCls = {
    sm: 'h-36',
    md: 'h-64',
    lg: 'h-96',
  }[size];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl transition-transform',
        heightCls,
        active && 'ring-2 ring-echo scale-[1.015]'
      )}
      style={{ background: scene.poster.bgGradient }}
    >
      {/* 纹理层 */}
      <PatternLayer pattern={scene.poster.pattern} accent={scene.poster.accentColor} />

      {/* 巨型意象字 */}
      <div
        className="absolute inset-0 flex items-center justify-center font-serif select-none"
        style={{
          fontSize: size === 'lg' ? '280px' : size === 'md' ? '180px' : '100px',
          color: scene.poster.mainColor,
          opacity: 0.26,
          lineHeight: 1,
          textShadow: `0 0 40px ${scene.poster.mainColor}44`,
        }}
      >
        {scene.poster.motif}
      </div>

      {/* 扫描线 */}
      <div className="scan-line" style={{ top: '18%', animationDelay: '0.2s' }} />

      {/* 文字信息 */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            className="badge-ip"
            style={{ background: scene.poster.mainColor + '22', color: scene.poster.accentColor }}
          >
            {scene.eraLabel}
          </span>
          <span className="font-mono text-[11px] text-white/50">
            {scene.id.toUpperCase()}
          </span>
        </div>

        <div>
          <div
            className="font-serif font-semibold"
            style={{
              color: scene.poster.accentColor,
              fontSize: size === 'lg' ? 34 : size === 'md' ? 24 : 16,
              letterSpacing: '0.5px',
              lineHeight: 1.15,
            }}
          >
            {scene.title}
          </div>
          <div className="text-white/70 text-sm mt-0.5">{scene.subtitle}</div>
          <div
            className="mt-2 text-[11px] tracking-wide opacity-80"
            style={{ color: scene.poster.accentColor }}
          >
            {scene.tagline}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternLayer({
  pattern,
  accent,
}: {
  pattern: 'vertical-lines' | 'radial-dots' | 'neon-lines';
  accent: string;
}) {
  if (pattern === 'vertical-lines') {
    return (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}10 0px, ${accent}10 1px, transparent 1px, transparent 28px)`,
          opacity: 0.6,
        }}
      />
    );
  }
  if (pattern === 'radial-dots') {
    return (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${accent}30 1px, transparent 1.5px)`,
          backgroundSize: '22px 22px',
          opacity: 0.45,
        }}
      />
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(115deg, transparent 40%, ${accent}20 45%, transparent 48%),
          linear-gradient(245deg, transparent 50%, ${accent}18 58%, transparent 62%)
        `,
        opacity: 0.7,
      }}
    />
  );
}
