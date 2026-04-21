'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type LLMStatus = { mock: boolean; baseURL: string; model: string };

export default function LLMStatusBadge() {
  const [status, setStatus] = useState<LLMStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ mock: true, baseURL: 'unreachable', model: '' }));
  }, []);

  if (!status) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'chip transition',
          status.mock ? 'chip-warn' : 'chip-echo'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            status.mock ? 'bg-warn' : 'bg-echo animate-pulse'
          )}
        />
        {status.mock ? 'Mock · 离线演示' : 'LLM · 实时'}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 glass-hi rounded-xl p-4 text-xs shadow-2xl">
          <div className="font-semibold mb-2">
            {status.mock ? '当前处于 Mock 模式' : '已接入实时 LLM'}
          </div>
          {status.mock ? (
            <div className="text-muted leading-relaxed">
              未检测到 OpenAI-compatible API Key。Demo 会降级使用预生成文案，保证演示完整性。<br />
              配置 <code className="font-mono text-echo">OPENAI_API_KEY</code> 与{' '}
              <code className="font-mono text-echo">OPENAI_BASE_URL</code> 后自动切换真实链路。
            </div>
          ) : (
            <div className="text-muted leading-relaxed">
              Base URL：<span className="font-mono text-text">{status.baseURL}</span>
              <br />
              Model：<span className="font-mono text-text">{status.model}</span>
              <br />
              <span className="text-xs text-echo mt-2 block">
                认接口不认厂商 · 任意 OpenAI-compatible 服务均可
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
