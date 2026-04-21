'use client';

import { useEffect, useRef, useState } from 'react';
import FitnessGauge from '@/components/FitnessGauge';
import ScenePoster from '@/components/ScenePoster';
import { BRANDS, CONFLICT_SCENARIO, type BrandMaterial } from '@/data/brands';
import { SCENES, type SceneDefinition } from '@/data/scenes';
import { cn } from '@/lib/utils';

type FitnessResult = {
  score: number;
  verdict: 'approved' | 'refactor' | 'rejected';
  reasons: string[];
  categoryFit: number;
  styleFit: number;
};

type RepairState = {
  loading: boolean;
  copy: string;
  newScore?: number;
  verdict?: string;
  strategy?: string[];
};

export default function GovernanceClient() {
  // 当前选中（拖拽落点）
  const [selected, setSelected] = useState<{ brand: BrandMaterial; scene: SceneDefinition } | null>(null);
  const [fit, setFit] = useState<FitnessResult | null>(null);
  const [repair, setRepair] = useState<RepairState>({ loading: false, copy: '' });

  // 拖拽
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // 概览：所有 品牌 × 剧集 的分数矩阵（用作下方可视化）
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    // 初始化矩阵
    const m: Record<string, Record<string, number>> = {};
    BRANDS.forEach((b) => {
      m[b.id] = {};
      SCENES.forEach((s) => {
        m[b.id][s.id] = 0;
      });
    });
    setMatrix(m);

    (async () => {
      // 异步并发计算
      const promises: Promise<void>[] = [];
      for (const b of BRANDS) {
        for (const s of SCENES) {
          promises.push(
            fetch('/api/fitness', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ brandId: b.id, sceneId: s.id }),
            })
              .then((r) => r.json())
              .then((data: FitnessResult) => {
                setMatrix((prev) => ({
                  ...prev,
                  [b.id]: { ...prev[b.id], [s.id]: data.score },
                }));
              })
              .catch(() => {})
          );
        }
      }
      await Promise.all(promises);
    })();
  }, []);

  const apply = async (brand: BrandMaterial, scene: SceneDefinition) => {
    setSelected({ brand, scene });
    setRepair({ loading: false, copy: '' });
    const resp = await fetch('/api/fitness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: brand.id, sceneId: scene.id }),
    });
    const data: FitnessResult = await resp.json();
    setFit(data);
  };

  const tryRepair = async () => {
    if (!selected || !fit) return;
    setRepair({ loading: true, copy: '' });
    const resp = await fetch('/api/repair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandId: selected.brand.id,
        sceneId: selected.scene.id,
        originalScore: fit.score,
      }),
    });
    if (!resp.body) return;
    const newScore = Number(resp.headers.get('X-Repair-New-Score')) || fit.score + 30;
    const verdict = resp.headers.get('X-Repair-Verdict') || 'approved';
    const strategyRaw = resp.headers.get('X-Repair-Strategy');
    const strategy = strategyRaw
      ? JSON.parse(decodeURIComponent(strategyRaw))
      : [];
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let txt = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      txt += decoder.decode(value, { stream: true });
      setRepair({ loading: true, copy: txt });
    }
    setRepair({ loading: false, copy: txt, newScore, verdict, strategy });
  };

  return (
    <div className="space-y-6">
      {/* 冲突场景·硬核原则条 */}
      <div className="bordered-card-hi p-4 flex items-start md:items-center gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <div className="text-xs text-accent font-mono tracking-widest">⚠ CONFLICT · 硬核原则演示</div>
          <div className="text-sm mt-1">
            <span className="text-white font-medium">Vermeer</span> 坚持在{' '}
            <span className="text-white font-medium">《庆余年 2》</span>高潮处插硬广，出价{' '}
            <span className="text-accent font-bold">3 倍</span> —— 接不接？
          </div>
        </div>
        <button
          onClick={() =>
            apply(
              BRANDS.find((b) => b.id === CONFLICT_SCENARIO.brandId)!,
              SCENES.find((s) => s.id === CONFLICT_SCENARIO.sceneId)!
            )
          }
          className="btn btn-danger whitespace-nowrap"
        >
          直接演示冲突场景 →
        </button>
      </div>

      {/* 拖拽区 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-5">
        {/* 品牌素材池 */}
        <div className="bordered-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">品牌素材池</div>
            <span className="chip text-[11px]">{BRANDS.length} 个品牌</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BRANDS.map((b) => (
              <div
                key={b.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', b.id);
                  setDraggingId(b.id);
                }}
                onDragEnd={() => setDraggingId(null)}
                onClick={() => setSelected({ brand: b, scene: selected?.scene ?? SCENES[0] })}
                className={cn(
                  'p-3 rounded-lg border cursor-grab active:cursor-grabbing transition',
                  draggingId === b.id
                    ? 'opacity-60 scale-95'
                    : selected?.brand.id === b.id
                    ? 'border-echo bg-echo/10'
                    : 'border-white/10 bg-white/2 hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-md grid place-items-center text-sm"
                      style={{ background: b.color + '22', color: b.color }}
                    >
                      {b.glyph}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{b.name}</div>
                      <div className="text-[10px] text-muted">{b.category}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {b.styleTags.slice(0, 2).map((t) => (
                    <span key={t} className="chip text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted leading-relaxed">
            💡 拖到右侧任意剧集卡片或点击选中 —— 系统实时评分。
          </div>
        </div>

        {/* 剧集接受区 */}
        <div className="space-y-3">
          {SCENES.map((s) => (
            <div
              key={s.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(s.id);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDropTarget(null);
                const brandId = e.dataTransfer.getData('text/plain');
                const brand = BRANDS.find((x) => x.id === brandId);
                if (brand) apply(brand, s);
              }}
              className={cn(
                'relative rounded-xl overflow-hidden border-2 border-dashed transition',
                dropTarget === s.id
                  ? 'border-echo'
                  : 'border-white/10'
              )}
            >
              <div className="grid grid-cols-[1fr_auto] gap-0">
                <ScenePoster scene={s} size="sm" />
                <div className="px-4 py-3 bg-surface/80 min-w-[160px] flex flex-col justify-between items-end">
                  <div className="text-xs text-muted">
                    {selected?.scene.id === s.id && selected.brand ? (
                      <span>
                        <span className="text-white font-medium">{selected.brand.name}</span>
                        <br />→ {s.title}
                      </span>
                    ) : (
                      <span>释放到此处</span>
                    )}
                  </div>
                  <div className="mt-2">
                    {selected?.scene.id === s.id && fit ? (
                      <div className="text-right">
                        <div
                          className="font-mono text-2xl font-bold"
                          style={{ color: verdictColor(fit.verdict) }}
                        >
                          {fit.score}
                        </div>
                        <div className="text-[10px] text-muted">contextual fit</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-muted/30">–</div>
                        <div className="text-[10px] text-muted/50">未评分</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 评分详情 · 拦截 · AI 修复 */}
      {selected && fit && (
        <div className="bordered-card-hi p-6 space-y-5">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-start gap-4">
              <FitnessGauge score={fit.score} size={180} />
              <div className="space-y-1 pt-3">
                <div className="text-xs text-muted font-mono tracking-wider">CURRENT MATCH</div>
                <div className="text-lg font-semibold">
                  {selected.brand.name}
                  <span className="text-muted mx-2">×</span>
                  {selected.scene.title}
                </div>
                <div className="text-xs text-muted">
                  {selected.brand.category} → {selected.scene.genre}
                </div>
                <div className="mt-3 space-y-1">
                  {fit.reasons.map((r, i) => (
                    <div key={i} className="text-[12px] text-muted flex items-start gap-2">
                      <span className="text-echo mt-0.5">·</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full lg:border-l lg:border-white/5 lg:pl-6">
              <div className="text-xs text-muted font-mono tracking-wider">原始硬广文案</div>
              <div className="mt-2 p-3 rounded-lg bg-white/3 border border-white/5 text-sm leading-relaxed">
                {selected.brand.rawCopy}
              </div>

              {fit.verdict === 'rejected' && !repair.copy && (
                <div className="mt-4 p-4 rounded-lg border border-danger/30 bg-danger/5">
                  <div className="text-danger text-sm font-semibold mb-1">
                    ⛔ 拦截 · 该配对已被平台治理系统阻止
                  </div>
                  <div className="text-xs text-white/70 leading-relaxed">
                    品类/风格双维度均不达标 —— 如果直接投放，用户的沉浸契约将被严重撕毁，品牌也会收获负面弹幕。
                  </div>
                  <button onClick={tryRepair} className="btn btn-primary mt-3 text-xs">
                    🔧 启动 AI 强制改造引擎
                  </button>
                </div>
              )}

              {fit.verdict === 'refactor' && !repair.copy && (
                <div className="mt-4 p-4 rounded-lg border border-warn/30 bg-warn/5">
                  <div className="text-warn text-sm font-semibold mb-1">
                    ⚠ 灰区 · 必须经 AI 强制改造
                  </div>
                  <div className="text-xs text-white/70 leading-relaxed">
                    品类边界附近，建议由 Echo 改造引擎重写后进入流量池。
                  </div>
                  <button onClick={tryRepair} className="btn btn-primary mt-3 text-xs">
                    🔧 自动改造
                  </button>
                </div>
              )}

              {fit.verdict === 'approved' && (
                <div className="mt-4 p-3 rounded-lg border border-ok/30 bg-ok/5 text-ok text-sm">
                  ✓ 达标 · 进入正常流量池。此时可由 LLM 直接进行腔调改写生成最终广告。
                </div>
              )}

              {repair.copy && (
                <div className="mt-4 p-4 rounded-lg border border-echo/40 bg-echo/5 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-echo">
                      ✨ AI 改造后文案
                    </div>
                    {repair.newScore !== undefined && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted">评分</span>
                        <span className="font-mono text-danger line-through opacity-70">
                          {fit.score}
                        </span>
                        <span className="text-muted">→</span>
                        <span className="font-mono text-ok font-bold">{repair.newScore}</span>
                        <span
                          className="chip text-[10px]"
                          style={{
                            background:
                              (repair.newScore ?? 0) >= 70
                                ? 'rgba(34,197,94,0.14)'
                                : 'rgba(245,196,0,0.14)',
                            color:
                              (repair.newScore ?? 0) >= 70 ? '#7be3a6' : '#f5d963',
                            borderColor:
                              (repair.newScore ?? 0) >= 70
                                ? 'rgba(34,197,94,0.4)'
                                : 'rgba(245,196,0,0.4)',
                          }}
                        >
                          {(repair.newScore ?? 0) >= 70 ? '改造通过' : '仍需再改'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      'font-serif text-[17px] leading-relaxed text-white/90',
                      repair.loading && 'stream-cursor'
                    )}
                  >
                    {repair.copy}
                  </div>
                  {repair.strategy && repair.strategy.length > 0 && !repair.loading && (
                    <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {repair.strategy.map((s, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-muted leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="text-echo">0{i + 1}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 text-[11px] text-muted border-t border-white/8 pt-3">
                    💡 <span className="text-white/80">商业增值解读</span>：广告主为"被改造到及格"额外付费，Echo 多一个 SaaS 式收入来源。
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 契合度矩阵可视化 */}
      <div className="bordered-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted font-mono tracking-wider">FITNESS MATRIX</div>
            <div className="text-lg font-semibold">全量契合度矩阵</div>
            <div className="text-xs text-muted mt-0.5">所有品牌 × 所有剧集的实时评分（后端并发计算）</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <LegendDot color="#22c55e" label="≥70 通过" />
            <LegendDot color="#f5c400" label="50-69 改造" />
            <LegendDot color="#ff3860" label="<50 拒绝" />
          </div>
        </div>
        <div className="overflow-auto scrollbar-thin">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-muted text-xs">
                <th className="text-left font-medium py-2 pr-4 sticky left-0 bg-surface">品牌 \ 剧集</th>
                {SCENES.map((s) => (
                  <th key={s.id} className="px-3 py-2 text-center font-medium">
                    <span className="badge-ip" style={{ background: s.poster.mainColor + '22', color: s.poster.accentColor }}>
                      {s.title}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BRANDS.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-white/5 hover:bg-white/2"
                >
                  <td className="py-2 pr-4 sticky left-0 bg-surface">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md grid place-items-center text-sm"
                        style={{ background: b.color + '22', color: b.color }}
                      >
                        {b.glyph}
                      </div>
                      <div>
                        <div className="text-[13px]">{b.name}</div>
                        <div className="text-[10px] text-muted">{b.category}</div>
                      </div>
                    </div>
                  </td>
                  {SCENES.map((s) => {
                    const v = matrix[b.id]?.[s.id] ?? 0;
                    const color = v >= 70 ? '#22c55e' : v >= 50 ? '#f5c400' : v > 0 ? '#ff3860' : '#3a3a48';
                    return (
                      <td
                        key={s.id}
                        className="px-3 py-2 text-center cursor-pointer"
                        onClick={() => apply(b, s)}
                      >
                        <div
                          className="inline-block px-2.5 py-1 rounded-md font-mono text-[13px] transition"
                          style={{
                            background: color + '16',
                            color,
                            border: `1px solid ${color}44`,
                          }}
                        >
                          {v || '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 金句横幅 */}
      <div className="bordered-card-hi p-6 text-center">
        <div className="text-xs text-muted font-mono tracking-widest mb-2">ECHO · 品味守门人</div>
        <div
          className="font-serif font-semibold"
          style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
        >
          <span className="grad-echo">不达标的广告，连被讨厌的资格都没有。</span>
        </div>
        <div className="text-muted text-sm mt-2">
          它根本进不了流量池 —— 这不是用户让渡的权利，是平台自觉的原则。
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function verdictColor(v: string) {
  if (v === 'approved') return '#22c55e';
  if (v === 'refactor') return '#f5c400';
  return '#ff3860';
}
