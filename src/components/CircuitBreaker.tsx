'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 情绪熔断全屏动画
 *   触发条件：弹幕情绪聚合结果 dominant === 'negative'
 *   视觉：暗色背景 + 红色警告条纹 + 抖动 + 大字警告 + 治理规则引用
 *   持续 3 秒后自动收起
 */
export default function CircuitBreaker({
  show,
  confidence = 0.87,
  onClose,
  autoHideMs = 3600,
}: {
  show: boolean;
  confidence?: number;
  onClose?: () => void;
  autoHideMs?: number;
}) {
  const [phase, setPhase] = useState<'hidden' | 'warn' | 'reveal'>('hidden');

  useEffect(() => {
    if (!show) {
      setPhase('hidden');
      return;
    }
    setPhase('warn');
    const toReveal = setTimeout(() => setPhase('reveal'), 600);
    const toClose = setTimeout(() => {
      setPhase('hidden');
      onClose?.();
    }, autoHideMs);
    return () => {
      clearTimeout(toReveal);
      clearTimeout(toClose);
    };
  }, [show, onClose, autoHideMs]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-10',
        phase === 'warn' && 'breach-shake'
      )}
      style={{ background: 'rgba(5, 2, 5, 0.94)' }}
    >
      <div className="absolute inset-0 warn-stripes opacity-60" />

      <div className="relative max-w-2xl w-full text-center animate-fade-in">
        <div className="mb-4 inline-flex items-center gap-2 text-danger text-xs tracking-[0.3em] font-mono uppercase">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          EMOTION CIRCUIT BREAKER · TRIGGERED
        </div>

        <div
          className={cn(
            'font-serif font-semibold mt-2',
            phase === 'warn' ? 'text-danger' : 'text-white'
          )}
          style={{ fontSize: 'clamp(28px, 4.8vw, 48px)', lineHeight: 1.15 }}
        >
          情绪熔断触发
        </div>
        <div
          className="mt-2 text-danger"
          style={{ fontSize: 'clamp(18px, 2.4vw, 24px)', lineHeight: 1.3 }}
        >
          本时段商业广告已强制下线
        </div>

        <div className="mt-10 max-w-lg mx-auto text-left glass-hi rounded-xl p-5">
          <div className="text-xs font-mono text-danger/80 mb-2 tracking-wider">
            平台治理规则 · Rule 03
          </div>
          <div className="text-sm leading-relaxed text-white/85">
            当前弹幕情绪聚合显示
            <span className="mx-1.5 px-2 py-0.5 rounded bg-danger/20 border border-danger/40 font-mono text-danger">
              厌恶 {(confidence * 100).toFixed(0)}%
            </span>
            主导。符合治理规则第 3 条：
            <span className="text-danger font-medium">
              用户情绪极度负面时，平台有义务停止商业打扰
            </span>
            。
          </div>
          <div className="mt-4 text-xs text-white/50 border-t border-white/10 pt-3">
            → 系统正在切换到「幕后花絮解锁」模式，或继续无广告播放
          </div>
        </div>

        <div className="mt-8 text-xs tracking-[0.2em] text-muted font-mono">
          ECHO · TASTE GUARDIAN
        </div>
      </div>
    </div>
  );
}
