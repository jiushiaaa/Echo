'use client';

import type { SceneDefinition } from '@/data/scenes';
import { cn } from '@/lib/utils';

/**
 * 剧集主视觉占位。
 * 去塑料味重构：去除巨型意象字，改为纯色底 + 角落微光 + 极淡 pattern。
 * 刻意保持风格化/抽象，不侵犯 IP；靠排版与留白建立气质。
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
    md: 'h-56',
    lg: 'h-80',
  }[size];

  const accent = scene.poster.accentColor;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-t-[10px] transition-[filter]',
        heightCls,
        active && 'ring-1 ring-amber/60'
      )}
      style={{
        background: '#141418',
      }}
    >
      {/* 角落微光：主色以 radial-gradient 投在右上角 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 85% 15%, ${accent}26 0%, transparent 55%)`,
        }}
      />

      {/* 极淡 pattern */}
      <PatternLayer pattern={scene.poster.pattern} accent={accent} />

      {/* 底部渐暗，让文字可读 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 40%, rgba(10,10,12,0.7) 100%)',
        }}
      />

      {/* 文字信息 */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            className="badge-ip"
            style={{
              color: accent,
              borderColor: `${accent}55`,
            }}
          >
            {scene.eraLabel}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-white/40">
            {scene.id.toUpperCase()}
          </span>
        </div>

        <div>
          <div
            className="font-serif font-semibold"
            style={{
              color: '#f4f4f6',
              fontSize: size === 'lg' ? 28 : size === 'md' ? 22 : 16,
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}
          >
            {scene.title}
          </div>
          <div className="text-white/55 text-[13px] mt-1">{scene.subtitle}</div>
          <div
            className="mt-2 text-[11px] tracking-wide opacity-80"
            style={{ color: accent }}
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
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}14 0px, ${accent}14 1px, transparent 1px, transparent 32px)`,
          opacity: 0.25,
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
          backgroundSize: '26px 26px',
          opacity: 0.2,
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
          linear-gradient(245deg, transparent 50%, ${accent}16 58%, transparent 62%)
        `,
        opacity: 0.25,
      }}
    />
  );
}
