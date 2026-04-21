'use client';

import { useEffect, useRef, useState } from 'react';
import SceneVideoStub from '@/components/SceneVideoStub';
import AdPlayer from '@/components/AdPlayer';
import CircuitBreaker from '@/components/CircuitBreaker';
import type { SceneDefinition } from '@/data/scenes';
import { DANMAKU_PACKS } from '@/data/danmaku';
import { ROLE_TONES } from '@/data/prompts';
import type { EmotionAggregate } from '@/lib/echo';
import { cn } from '@/lib/utils';

type EmotionDominant = 'heartache' | 'catharsis' | 'contemplation' | 'negative';

const EMOTION_LABELS: Record<EmotionDominant, { label: string; color: string; bg: string }> = {
  heartache:     { label: '虐心共情',   color: '#ff8aa0', bg: 'linear-gradient(135deg, #3a1a24 0%, #5a1d32 100%)' },
  catharsis:     { label: '爽感逆袭',   color: '#ffd36b', bg: 'linear-gradient(135deg, #2a1f08 0%, #4d3614 100%)' },
  contemplation: { label: '哲思沉静',   color: '#7aa7ff', bg: 'linear-gradient(135deg, #0c1a2b 0%, #10243e 100%)' },
  negative:      { label: '厌恶愤怒',   color: '#ff4f6b', bg: 'linear-gradient(135deg, #1a0509 0%, #3a0e17 100%)' },
};

export default function MirrorClient({ scene }: { scene: SceneDefinition }) {
  const role = ROLE_TONES[scene.roleToneId];

  // 弹幕列表（累积）
  const [danmaku, setDanmaku] = useState<string[]>(() =>
    DANMAKU_PACKS.find((p) => p.id === 'heartache')!.messages.slice(0, 12).map((m) => m.text)
  );
  const [input, setInput] = useState('');
  const [emotion, setEmotion] = useState<EmotionAggregate | null>(null);
  const [breachShow, setBreachShow] = useState(false);
  const [copy, setCopy] = useState('');
  const [sceneTime, setSceneTime] = useState(0);
  const streamRef = useRef<AbortController | null>(null);
  const copyGenTimerRef = useRef<any>(null);

  // 首次自动聚合情绪
  useEffect(() => {
    void aggregate(danmaku);
    // eslint-disable-next-line
  }, []);

  async function aggregate(msgs: string[]) {
    try {
      const resp = await fetch('/api/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs }),
      });
      const data: EmotionAggregate = await resp.json();
      setEmotion(data);
      if (data.dominant === 'negative' && data.confidence >= 0.55) {
        setBreachShow(true);
      }
      // 重新生成广告文案（非负向时）
      if (data.dominant !== 'negative') {
        queueCopyGen(data.dominant);
      }
    } catch (e) {
      // 忽略网络错误
    }
  }

  function queueCopyGen(dominant: EmotionDominant) {
    if (copyGenTimerRef.current) clearTimeout(copyGenTimerRef.current);
    copyGenTimerRef.current = setTimeout(() => regenerateCopy(dominant), 220);
  }

  async function regenerateCopy(dominant: EmotionDominant) {
    if (streamRef.current) streamRef.current.abort();
    const ctrl = new AbortController();
    streamRef.current = ctrl;
    setCopy('');
    try {
      const resp = await fetch('/api/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role.id,
          brand: scene.heroAd.brandName,
          sellingPoint: scene.heroAd.sellingPoint,
          sceneContext: `${scene.title} · ${scene.signatureDialogue}`,
          emotionOverride: dominant,
        }),
        signal: ctrl.signal,
      });
      if (!resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setCopy((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      // 忽略 abort 异常
    }
  }

  const submit = () => {
    if (!input.trim()) return;
    const next = [...danmaku, input.trim()].slice(-60);
    setDanmaku(next);
    setInput('');
    void aggregate(next);
  };

  const applyPreset = (packId: string) => {
    const pack = DANMAKU_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    const msgs = pack.messages.map((m) => m.text);
    setDanmaku(msgs);
    void aggregate(msgs);
  };

  const addBatch = (packId: string) => {
    const pack = DANMAKU_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    const msgs = pack.messages.map((m) => m.text);
    const next = [...danmaku, ...msgs.slice(0, 8)].slice(-80);
    setDanmaku(next);
    void aggregate(next);
  };

  const dominant = emotion?.dominant ?? 'heartache';
  const styleInfo = EMOTION_LABELS[dominant];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
      {/* 左：视频 + 广告预览 */}
      <div className="space-y-3">
        <SceneVideoStub
          scene={scene}
          playing
          currentTime={sceneTime}
          onTimeUpdate={(t) =>
            setSceneTime(t > scene.duration ? 0 : t)
          }
          showDanmaku
          danmakuMessages={danmaku.slice(-18)}
        />

        {/* 广告实时预览（响应情绪） */}
        <div
          className={cn(
            'relative rounded-xl overflow-hidden aspect-video transition-all duration-700'
          )}
          style={{ background: styleInfo.bg }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `radial-gradient(${styleInfo.color}33 1px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative h-full p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="chip" style={{ background: styleInfo.color + '22', borderColor: styleInfo.color + '66', color: styleInfo.color }}>
                Echo · 情绪镜像
              </div>
              <div className="text-[11px] font-mono text-white/50">
                {dominant.toUpperCase()} · conf {(emotion?.confidence ?? 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-white/50 mb-2 font-mono">
                {role.displayName} · 实时改写
              </div>
              <div
                className={cn(
                  'font-serif leading-relaxed stream-cursor',
                )}
                style={{
                  fontSize: 'clamp(22px, 2.6vw, 30px)',
                  color: styleInfo.color,
                  textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                  minHeight: 90,
                }}
              >
                {copy || '等待情绪信号 · 请在右侧输入或选择预设'}
              </div>
              <div className="mt-2 text-xs text-white/60">
                同一个品牌 · 不同情绪 · 不同温度
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右：交互控制 */}
      <div className="space-y-4">
        {/* 情绪聚合结果 */}
        <div className="bordered-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted tracking-wider font-mono">EMOTION AGGREGATE</div>
              <div className="text-lg font-semibold mt-0.5">
                当前主导情绪：
                <span style={{ color: styleInfo.color }}>{styleInfo.label}</span>
              </div>
            </div>
            <div className="text-xl font-mono font-bold" style={{ color: styleInfo.color }}>
              {((emotion?.confidence ?? 0) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="space-y-1.5">
            {(['heartache', 'catharsis', 'contemplation', 'negative'] as EmotionDominant[]).map(
              (k) => {
                const v = emotion?.scores[k] ?? 0;
                const meta = EMOTION_LABELS[k];
                return (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-16 text-[11px] text-muted">{meta.label}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${v * 100}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                    <div className="w-10 text-right text-[11px] font-mono text-muted">
                      {(v * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              }
            )}
          </div>
          {emotion?.keywords && emotion.keywords.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted">语义关键词：</span>
              {emotion.keywords.map((k) => (
                <span key={k} className="chip text-[11px]">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 弹幕输入框 */}
        <div className="bordered-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">现场弹幕输入</div>
            <div className="text-[11px] text-muted font-mono">
              累计 {danmaku.length} 条 · 实时聚合
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="随便打一条 —— 看 AI 如何响应"
              className="flex-1 px-3 py-2 rounded-lg bg-surface border border-white/10 text-sm focus:outline-none focus:border-echo/50"
            />
            <button onClick={submit} className="btn btn-primary">
              发送
            </button>
          </div>
          <div className="mt-2 text-[11px] text-muted">
            ⌨ 回车发送 · 负向厌恶情绪会触发全屏熔断（试试 "这剧真烂""退钱"）
          </div>
        </div>

        {/* 预设包切换 */}
        <div className="bordered-card p-4">
          <div className="text-sm font-semibold mb-3">预设弹幕包 · 一键切换</div>
          <div className="grid grid-cols-2 gap-2">
            {DANMAKU_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition hover:scale-[1.01]',
                  p.id === 'negative'
                    ? 'border-danger/40 hover:bg-danger/10'
                    : 'border-white/10 hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{p.label}</div>
                  <span className="text-[10px] text-muted font-mono">{p.messages.length} 条</span>
                </div>
                <div className="text-[11px] text-muted leading-relaxed">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => addBatch('heartache')} className="btn btn-ghost text-xs">
              ＋追加 8 条虐心
            </button>
            <button onClick={() => addBatch('negative')} className="btn btn-danger text-xs">
              ＋追加 8 条负向
            </button>
          </div>
        </div>

        {/* 弹幕轨道展示 */}
        <div className="bordered-card p-4 max-h-48 overflow-y-auto scrollbar-thin">
          <div className="text-xs text-muted mb-2">弹幕流（最近 20 条）</div>
          <div className="space-y-1 text-sm">
            {danmaku.slice(-20).reverse().map((m, i) => (
              <div key={danmaku.length - i + ':' + m} className="text-white/80">
                <span className="text-muted/60 font-mono text-[10px] mr-2">#{danmaku.length - i}</span>
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 全屏熔断 */}
      <CircuitBreaker
        show={breachShow}
        confidence={emotion?.confidence ?? 0.87}
        onClose={() => setBreachShow(false)}
      />
    </div>
  );
}
