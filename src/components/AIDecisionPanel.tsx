'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type DecisionStep = {
  icon: ReactNode;
  label: string;
  value: string;
  state: 'pending' | 'active' | 'done';
  hint?: string;
};

export default function AIDecisionPanel({
  steps,
  streamingText,
  streamingLabel = '广告文案生成中',
}: {
  steps: DecisionStep[];
  streamingText?: string;
  streamingLabel?: string;
}) {
  return (
    <div className="bordered-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-echo animate-pulse" />
          <span className="text-sm font-semibold">AI 决策面板</span>
        </div>
        <div className="text-[11px] text-muted font-mono">real-time reasoning</div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 px-3 py-2 rounded-lg transition',
              step.state === 'active' && 'bg-echo/10 border border-echo/30',
              step.state === 'done' && 'bg-white/3 border border-white/5',
              step.state === 'pending' && 'opacity-40'
            )}
          >
            <div className="mt-0.5 w-5 h-5 grid place-items-center shrink-0">
              {step.state === 'done' ? (
                <svg viewBox="0 0 20 20" className="w-4 h-4 text-ok">
                  <path
                    fill="currentColor"
                    d="M10 2a8 8 0 110 16 8 8 0 010-16zm-1 11.5l6.3-6.3-1.4-1.4L9 10.7 5.7 7.4 4.3 8.8l4.7 4.7z"
                  />
                </svg>
              ) : step.state === 'active' ? (
                <div className="w-3 h-3 rounded-full border-2 border-echo border-t-transparent animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted/50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted">{step.label}</span>
                <span className="text-sm font-medium">{step.value}</span>
              </div>
              {step.hint && (
                <div className="text-[11px] text-muted/80 mt-0.5">{step.hint}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {streamingText !== undefined && (
        <div className="mt-4 pt-4 border-t border-dashed border-white/10">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-echo animate-pulse" />
            <span className="text-echo/80">以下为 AI 实时生成</span>
            <span className="text-white/30 mx-1">·</span>
            <span>{streamingLabel}</span>
          </div>
          <div
            className="font-serif text-[17px] leading-relaxed text-text stream-cursor"
            style={{ minHeight: '40px' }}
          >
            {streamingText || ''}
          </div>
        </div>
      )}
    </div>
  );
}
