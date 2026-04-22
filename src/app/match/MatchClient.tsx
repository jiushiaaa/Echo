'use client';

import { useState, useCallback } from 'react';
import { SCENES } from '@/data/scenes';
import { BRANDS } from '@/data/brands';
import ScenePoster from '@/components/ScenePoster';
import FitnessGauge from '@/components/FitnessGauge';
import { cn } from '@/lib/utils';

type FitnessResult = {
  score: number;
  verdict: string;
  reasons: string[];
  categoryFit: number;
  styleFit: number;
};

type BrandState = {
  status: 'idle' | 'loading' | 'done';
  result?: FitnessResult;
};

type Phase = 'idle' | 'scanning' | 'evaluating' | 'result';

const scene = SCENES[0];

export default function MatchClient() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [brandStates, setBrandStates] = useState<Record<string, BrandState>>(() =>
    Object.fromEntries(BRANDS.map((b) => [b.id, { status: 'idle' as const }]))
  );
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [ranked, setRanked] = useState<Array<{ id: string; score: number }>>([]);

  const reset = useCallback(() => {
    setPhase('idle');
    setBrandStates(Object.fromEntries(BRANDS.map((b) => [b.id, { status: 'idle' as const }])));
    setWinnerId(null);
    setRanked([]);
  }, []);

  const startMatch = useCallback(async () => {
    reset();
    setPhase('scanning');

    await delay(800);
    setPhase('evaluating');

    const promises = BRANDS.map((brand) =>
      fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, sceneId: 'qingyunian' }),
      }).then((r) => r.json() as Promise<FitnessResult>)
    );

    const results = await Promise.all(promises);
    const resultMap = new Map<string, FitnessResult>();
    BRANDS.forEach((b, i) => resultMap.set(b.id, results[i]));

    for (let i = 0; i < BRANDS.length; i++) {
      const brand = BRANDS[i];
      setBrandStates((prev) => ({
        ...prev,
        [brand.id]: { status: 'loading' },
      }));
      await delay(300);
      setBrandStates((prev) => ({
        ...prev,
        [brand.id]: { status: 'done', result: resultMap.get(brand.id) },
      }));
    }

    const sorted = BRANDS.map((b) => ({
      id: b.id,
      score: resultMap.get(b.id)?.score ?? 0,
    })).sort((a, b) => b.score - a.score);

    await delay(800);
    setRanked(sorted);
    setWinnerId(sorted[0].id);
    setPhase('result');
  }, [reset]);

  const winner = BRANDS.find((b) => b.id === winnerId);
  const winnerResult = winnerId ? brandStates[winnerId]?.result : undefined;

  return (
    <div className="space-y-8">
      <div className="bordered-card p-5 flex flex-col sm:flex-row gap-5">
        <div className="shrink-0 w-full sm:w-56 rounded-lg overflow-hidden">
          <ScenePoster scene={scene} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white text-lg font-medium">{scene.title}</h2>
          <p className="text-muted text-sm mt-1">{scene.genre}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="chip chip-echo">{scene.relaxedMoment.label}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scene.reusableAssets.map((a) => (
              <span key={a} className="chip chip-accent">{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="btn btn-primary"
          onClick={startMatch}
          disabled={phase !== 'idle' && phase !== 'result'}
        >
          {phase === 'idle' ? '开始匹配' : phase === 'result' ? '重新匹配' : '匹配中…'}
        </button>
        {phase !== 'idle' && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <StepDot active={phase === 'scanning'} done={phase === 'evaluating' || phase === 'result'} />
            <span className={cn(phase === 'scanning' && 'text-echo')}>扫描场景上下文</span>
            <span className="text-white/20 mx-1">→</span>
            <StepDot active={phase === 'evaluating'} done={phase === 'result'} />
            <span className={cn(phase === 'evaluating' && 'text-echo')}>逐一评估候选品牌</span>
            <span className="text-white/20 mx-1">→</span>
            <StepDot active={false} done={phase === 'result'} />
            <span className={cn(phase === 'result' && 'text-echo')}>AI 选定最佳品牌</span>
          </div>
        )}
      </div>

      {phase === 'scanning' && (
        <div className="bordered-card p-5 animate-pulse">
          <p className="text-echo text-sm font-medium mb-3">扫描场景上下文…</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted">类型</span>
              <span className="ml-2 text-white/80">{scene.genre}</span>
            </div>
            <div>
              <span className="text-muted">情绪曲线</span>
              <span className="ml-2 text-white/80">
                {scene.emotionCurve[0].label} → {scene.emotionCurve[scene.emotionCurve.length - 1].label}
              </span>
            </div>
            <div>
              <span className="text-muted">峰值张力</span>
              <span className="ml-2 text-white/80">
                {Math.max(...scene.emotionCurve.map((p) => p.tension)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted">投放窗口</span>
              <span className="ml-2 text-white/80">{scene.relaxedMoment.label}</span>
            </div>
          </div>
        </div>
      )}

      {(phase === 'evaluating' || phase === 'result') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BRANDS.map((brand) => {
            const bs = brandStates[brand.id];
            const score = bs?.result?.score ?? 0;
            const isWinner = phase === 'result' && brand.id === winnerId;
            const borderColor =
              bs?.status === 'done'
                ? score >= 70
                  ? 'border-green-500/60'
                  : score >= 50
                    ? 'border-yellow-500/40'
                    : 'border-red-500/40'
                : 'border-white/10';

            return (
              <div
                key={brand.id}
                className={cn(
                  'bordered-card p-3 transition-all duration-500',
                  borderColor,
                  isWinner && 'ring-2 ring-echo scale-[1.03] shadow-[0_0_30px_rgba(212,165,116,0.15)]',
                  bs?.status === 'done' && score >= 70 && 'border-green-500/60',
                  bs?.status === 'done' && score < 50 && 'border-red-500/40',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{brand.glyph}</span>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{brand.name}</div>
                    <div className="text-muted text-[11px]">{brand.category}</div>
                  </div>
                </div>
                <div className="h-8 flex items-center">
                  {bs?.status === 'loading' && (
                    <div className="flex items-center gap-2">
                      <Spinner />
                      <span className="text-muted text-xs">评估中</span>
                    </div>
                  )}
                  {bs?.status === 'done' && (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-mono text-lg font-bold',
                          score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        )}
                      >
                        {score}
                      </span>
                      <span className="text-muted text-[11px]">/ 100</span>
                    </div>
                  )}
                  {bs?.status === 'idle' && (
                    <span className="text-white/20 text-xs">等待评估</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {phase === 'result' && winner && winnerResult && (
        <div className="bordered-card-hi p-6 mt-4">
          <div className="flex items-center gap-2 mb-5">
            <span className="chip chip-ok">AI 推荐</span>
            <span className="text-echo text-sm font-medium">最佳匹配品牌</span>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <FitnessGauge score={winnerResult.score} size={180} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{winner.glyph}</span>
                <div>
                  <div className="text-white text-xl font-medium">{winner.name}</div>
                  <div className="text-muted text-sm">{winner.category}</div>
                </div>
              </div>
              <div className="space-y-2">
                {winnerResult.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-echo mt-0.5">·</span>
                    <span className="text-white/80">{r}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {winner.styleTags.map((t) => (
                  <span key={t} className="chip chip-accent">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {ranked.length > 1 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-muted text-xs mb-3 tracking-wider uppercase">完整排名</p>
              <div className="space-y-2">
                {ranked.map((item, idx) => {
                  const b = BRANDS.find((br) => br.id === item.id)!;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                        idx === 0 && 'bg-white/5'
                      )}
                    >
                      <span className="text-muted font-mono text-xs w-5 text-right">
                        {idx + 1}
                      </span>
                      <span className="text-base">{b.glyph}</span>
                      <span className="text-white/90 flex-1 truncate">{b.name}</span>
                      <span className="text-muted text-xs">{b.category}</span>
                      <span
                        className={cn(
                          'font-mono font-bold w-10 text-right',
                          item.score >= 70 ? 'text-green-400' : item.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        )}
                      >
                        {item.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <span
      className={cn(
        'w-2 h-2 rounded-full transition-colors',
        done ? 'bg-echo' : active ? 'bg-echo animate-pulse' : 'bg-white/20'
      )}
    />
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-echo" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 019.17 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
