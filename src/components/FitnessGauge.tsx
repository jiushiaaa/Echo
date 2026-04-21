'use client';

import { cn } from '@/lib/utils';

/**
 * 契合度评分仪表盘（半圆形）
 *   <50: 降级/拒绝（红）
 *   50-69: 强制改造（黄）
 *   >=70: 正常流量池（绿）
 */
export default function FitnessGauge({
  score,
  size = 160,
  label,
  subtle,
}: {
  score: number;
  size?: number;
  label?: string;
  subtle?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const verdict: 'ok' | 'warn' | 'bad' =
    clamped >= 70 ? 'ok' : clamped >= 50 ? 'warn' : 'bad';

  const verdictColor =
    verdict === 'ok' ? '#22c55e' : verdict === 'warn' ? '#f5c400' : '#ff3860';
  const verdictLabel =
    verdict === 'ok' ? '正常流量池' : verdict === 'warn' ? '强制改造' : '降级/拒绝';

  // 半圆弧 stroke-dasharray（半周长 = π·r）
  const r = 70;
  const circum = Math.PI * r;
  const dashOffset = circum * (1 - clamped / 100);

  return (
    <div className={cn('flex flex-col items-center', subtle && 'opacity-90')}>
      <div className="relative" style={{ width: size, height: size * 0.58 }}>
        <svg
          width={size}
          height={size * 0.58}
          viewBox="0 0 180 108"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="fitGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ff3860" />
              <stop offset="50%" stopColor="#f5c400" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 92 A 70 70 0 0 1 160 92"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 20 92 A 70 70 0 0 1 160 92"
            stroke="url(#fitGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circum}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />
          <g>
            {[0, 50, 70, 100].map((tick) => {
              const angle = Math.PI * (1 - tick / 100);
              const x1 = 90 + Math.cos(angle) * 58;
              const y1 = 92 - Math.sin(angle) * 58;
              const x2 = 90 + Math.cos(angle) * 66;
              const y2 = 92 - Math.sin(angle) * 66;
              return (
                <line
                  key={tick}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={tick === 70 ? '#22c55e' : tick === 50 ? '#f5c400' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="1.5"
                />
              );
            })}
          </g>
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
          style={{ paddingBottom: size * 0.06 }}
        >
          <div
            className="font-mono font-bold"
            style={{ fontSize: size * 0.3, color: verdictColor, lineHeight: 1 }}
          >
            {clamped}
          </div>
          <div className="text-[10px] text-muted tracking-widest font-mono">/ 100</div>
        </div>
      </div>

      <div
        className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: verdictColor + '22',
          border: `1px solid ${verdictColor}66`,
          color: verdictColor,
        }}
      >
        {verdictLabel}
      </div>
      {label && <div className="text-xs text-muted mt-1.5">{label}</div>}
    </div>
  );
}
