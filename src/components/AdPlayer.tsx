'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type AdFrame = {
  bgGradient: string;
  headline: string;
  footline?: string;
};

/**
 * 广告播放器：接受一组"帧"（图文广告）或一个视频 src。
 *  - 视频优先：若 videoSrc 可加载，播视频
 *  - 图文兜底：按 800ms 节奏轮播 frames，配合转场
 *  - 顶部流式文案覆盖：当 streamingText 传入时流式渲染在画面上
 */
export default function AdPlayer({
  videoSrc,
  frames,
  duration = 7,
  streamingText,
  brandName,
  playing,
  onEnd,
  variant = 'native',
  className,
}: {
  videoSrc?: string;
  frames: AdFrame[];
  duration?: number;
  streamingText?: string;
  brandName?: string;
  playing: boolean;
  onEnd?: () => void;
  variant?: 'hard' | 'native';
  className?: string;
}) {
  const [videoOk, setVideoOk] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameIdx, setFrameIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // 图文兜底轮播
  useEffect(() => {
    if (!playing || videoOk) return;
    const perFrame = (duration * 1000) / frames.length;
    const interval = setInterval(() => {
      setFrameIdx((i) => Math.min(i + 1, frames.length - 1));
    }, perFrame);
    const tick = setInterval(() => {
      setElapsed((e) => {
        if (e + 0.1 >= duration) {
          clearInterval(interval);
          clearInterval(tick);
          onEnd?.();
          return duration;
        }
        return e + 0.1;
      });
    }, 100);
    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [playing, duration, frames.length, onEnd, videoOk]);

  useEffect(() => {
    if (!playing) {
      setFrameIdx(0);
      setElapsed(0);
    }
  }, [playing]);

  const frame = frames[frameIdx] ?? frames[0];

  return (
    <div
      className={cn(
        'relative w-full aspect-video overflow-hidden rounded-xl',
        className
      )}
      style={{ background: frame.bgGradient }}
    >
      {/* 视频优先 */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          onCanPlay={() => setVideoOk(true)}
          onError={() => setVideoOk(false)}
          onEnded={() => onEnd?.()}
          autoPlay={playing}
          muted
          playsInline
        />
      )}

      {/* 图文层（视频失败/无源时显示） */}
      {!videoOk && (
        <>
          {/* 背景粒子 */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                variant === 'hard'
                  ? `repeating-linear-gradient(45deg, #ffffff08 0 1px, transparent 1px 16px)`
                  : `radial-gradient(white 0.5px, transparent 1px)`,
              backgroundSize: variant === 'hard' ? undefined : '18px 18px',
            }}
          />

          {/* 模式标识 */}
          <div className="absolute top-4 left-4">
            {variant === 'hard' ? (
              <div className="chip chip-danger">硬广 · 传统形态</div>
            ) : (
              <div className="chip chip-echo">Echo · 原生形态</div>
            )}
          </div>
          <div className="absolute top-4 right-4 font-mono text-[11px] text-white/60">
            ADV {Math.ceil(elapsed)}/{duration}s
          </div>

          {/* 文案 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div
              key={frameIdx}
              className="animate-slide-up font-serif font-semibold text-white leading-tight"
              style={{ fontSize: 'clamp(22px, 3.4vw, 40px)', textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}
            >
              {streamingText || frame.headline}
            </div>
            {frame.footline && !streamingText && (
              <div
                key={'f' + frameIdx}
                className="animate-slide-up mt-4 text-white/85"
                style={{ fontSize: 'clamp(12px, 1.4vw, 16px)' }}
              >
                {frame.footline}
              </div>
            )}
            {streamingText && (
              <div className="stream-cursor mt-2 text-white/60 text-sm">AI 实时撰写中</div>
            )}
          </div>

          {/* 品牌水印 */}
          {brandName && (
            <div className="absolute bottom-4 left-4 text-white/80 text-xs font-mono">
              BRAND · {brandName}
            </div>
          )}

          {/* 进度条 */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-white/80"
              style={{
                width: `${(elapsed / duration) * 100}%`,
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* 帧指示器 */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {frames.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === frameIdx ? 'white' : 'rgba(255,255,255,0.3)',
                  transform: i === frameIdx ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
