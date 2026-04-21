'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SceneDefinition } from '@/data/scenes';
import { cn } from '@/lib/utils';

/**
 * 剧集片段"视频占位"——不侵权的风格化演示层。
 * 核心：
 *  - 随时间推进的进度指示
 *  - 情绪曲线以可视化形式流动
 *  - 当前时刻周边出现"对白剪影"浮现
 *  - 粒子/光斑模拟镜头运动
 */
export default function SceneVideoStub({
  scene,
  playing,
  currentTime,
  onTimeUpdate,
  showDanmaku,
  danmakuMessages = [],
  className,
}: {
  scene: SceneDefinition;
  playing: boolean;
  currentTime: number;
  onTimeUpdate?: (t: number) => void;
  showDanmaku?: boolean;
  danmakuMessages?: string[];
  className?: string;
}) {
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      onTimeUpdate?.(currentTime + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, currentTime, onTimeUpdate]);

  // 当前 tension 值插值
  const tension = useMemo(() => interpTension(scene, currentTime), [scene, currentTime]);

  // 当前最近的 label（作为"对白提示"）
  const currentLabel = useMemo(() => {
    let lastLabel = scene.emotionCurve[0]?.label ?? '';
    for (const pt of scene.emotionCurve) {
      if (pt.t <= currentTime) lastLabel = pt.label ?? lastLabel;
    }
    return lastLabel;
  }, [scene.emotionCurve, currentTime]);

  return (
    <div
      className={cn(
        'relative w-full aspect-video overflow-hidden rounded-xl',
        className
      )}
      style={{ background: scene.poster.bgGradient }}
    >
      {/* 背景纹理 */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage:
            scene.poster.pattern === 'radial-dots'
              ? `radial-gradient(${scene.poster.accentColor}33 1px, transparent 1.5px)`
              : scene.poster.pattern === 'vertical-lines'
              ? `repeating-linear-gradient(90deg, ${scene.poster.accentColor}0f 0 1px, transparent 1px 32px)`
              : `linear-gradient(115deg, transparent 40%, ${scene.poster.accentColor}22 45%, transparent 48%)`,
          backgroundSize: scene.poster.pattern === 'radial-dots' ? '24px 24px' : undefined,
          opacity: 0.55 + tension * 0.3,
        }}
      />

      {/* 呼吸/张力光晕 */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${scene.poster.mainColor}${tensionToHex(tension)}, transparent 65%)`,
          opacity: 0.35 + tension * 0.4,
        }}
      />

      {/* 巨型意象字（随 tension 抖动） */}
      <div
        className="absolute inset-0 flex items-center justify-center font-serif select-none pointer-events-none"
        style={{
          fontSize: '320px',
          color: scene.poster.mainColor,
          opacity: 0.22,
          lineHeight: 1,
          transform: `scale(${1 + tension * 0.04})`,
          transition: 'transform 0.6s ease',
        }}
      >
        {scene.poster.motif}
      </div>

      {/* 对白提示 */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-4">
        <div
          className="chip"
          style={{
            background: scene.poster.mainColor + '22',
            borderColor: scene.poster.accentColor + '55',
            color: scene.poster.accentColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {scene.title} · 第 {Math.floor(currentTime)}s
        </div>
        <div
          className="text-right text-[11px] font-mono text-white/40"
          style={{ lineHeight: 1.2 }}
        >
          tension {tension.toFixed(2)}
          <br />
          {currentLabel}
        </div>
      </div>

      {/* 对白剪影（代表性台词） */}
      <div className="absolute bottom-14 left-5 right-5">
        <div
          className="font-serif leading-relaxed opacity-90"
          style={{
            fontSize: 22,
            color: scene.poster.accentColor,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          「{scene.signatureDialogue}」
        </div>
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full"
          style={{
            width: `${Math.min(100, (currentTime / scene.duration) * 100)}%`,
            background: `linear-gradient(90deg, ${scene.poster.mainColor}, ${scene.poster.accentColor})`,
            transition: 'width 0.2s linear',
          }}
        />
      </div>

      {/* 弹幕层 */}
      {showDanmaku && danmakuMessages.length > 0 && (
        <DanmakuLayer messages={danmakuMessages} />
      )}
    </div>
  );
}

function interpTension(scene: SceneDefinition, t: number) {
  const pts = scene.emotionCurve;
  if (t <= pts[0].t) return pts[0].tension;
  if (t >= pts[pts.length - 1].t) return pts[pts.length - 1].tension;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (t >= a.t && t <= b.t) {
      const r = (t - a.t) / (b.t - a.t);
      return a.tension + (b.tension - a.tension) * r;
    }
  }
  return 0.5;
}

function tensionToHex(tension: number) {
  const v = Math.round(30 + tension * 50);
  return v.toString(16).padStart(2, '0');
}

function DanmakuLayer({ messages }: { messages: string[] }) {
  const tracks = 5;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {messages.map((m, i) => {
        const track = i % tracks;
        const topPct = 8 + track * 11;
        const delay = (i / messages.length) * 6 + (i % 3) * 0.4;
        return (
          <div
            key={i + ':' + m}
            className="danmaku-item absolute text-sm font-medium"
            style={{
              top: `${topPct}%`,
              right: '-20%',
              animationDelay: `${delay}s`,
              color: pickDanmakuColor(i),
              textShadow: '0 0 6px rgba(0,0,0,0.7)',
            }}
          >
            {m}
          </div>
        );
      })}
    </div>
  );
}

function pickDanmakuColor(i: number) {
  const colors = ['#ffffff', '#ffd6a5', '#a5b4fc', '#fca5a5', '#fde68a', '#b9a6ff', '#ffb58e'];
  return colors[i % colors.length];
}
