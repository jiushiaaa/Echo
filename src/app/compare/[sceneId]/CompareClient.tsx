'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SceneVideoStub from '@/components/SceneVideoStub';
import AdPlayer, { AdFrame } from '@/components/AdPlayer';
import AIDecisionPanel, { DecisionStep } from '@/components/AIDecisionPanel';
import NarrativePackUnlock from '@/components/NarrativePackUnlock';
import type { SceneDefinition } from '@/data/scenes';
import { HARD_AD } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';

type SceneAnalysis = {
  genre: string;
  tone: string;
  tension_peak: number;
  tension_end: number;
  relaxed_window_sec: number;
  reusable_assets: string[];
  signature_dialogue: string;
};

type PlaybackMode = 'idle' | 'scene' | 'hardAd' | 'echoAd' | 'done';

const SCENE_SHORT_DURATION = 16; // Demo 中剧集片段加速播放，16 秒 = 情绪曲线全览

export default function CompareClient({
  scene,
  analysis,
}: {
  scene: SceneDefinition;
  analysis: SceneAnalysis;
}) {
  const role = ROLE_TONES[scene.roleToneId];
  const [playing, setPlaying] = useState(false);

  // 左右两路分别独立
  const [leftMode, setLeftMode] = useState<PlaybackMode>('idle');
  const [rightMode, setRightMode] = useState<PlaybackMode>('idle');
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [nepOpen, setNepOpen] = useState(false);

  // 在剧集进度里把真实时长映射到演示时长
  const leftTightT = (scene.tightMoment.t / scene.duration) * SCENE_SHORT_DURATION;
  const rightRelaxT = (scene.relaxedMoment.t / scene.duration) * SCENE_SHORT_DURATION;

  // AI 决策步骤
  const [decision, setDecision] = useState<DecisionStep[]>(() => initialSteps(scene, analysis));
  const [streamingCopy, setStreamingCopy] = useState<string>('');

  // 流式文案
  const streamStarted = useRef(false);
  useEffect(() => {
    if (rightMode !== 'echoAd' || streamStarted.current) return;
    streamStarted.current = true;
    (async () => {
      setStreamingCopy('');
      const resp = await fetch('/api/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role.id,
          brand: scene.heroAd.brandName,
          sellingPoint: scene.heroAd.sellingPoint,
          sceneContext: `${scene.title} · ${scene.signatureDialogue}`,
        }),
      });
      if (!resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamingCopy((prev) => prev + chunk);
      }
    })();
  }, [rightMode, scene, role.id]);

  // 播放主循环
  const handleStart = useCallback(() => {
    setPlaying(true);
    setLeftMode('scene');
    setRightMode('scene');
    setLeftTime(0);
    setRightTime(0);
    streamStarted.current = false;
    setStreamingCopy('');
    setDecision(initialSteps(scene, analysis));
    // 依次触发 AI 决策步骤的 active/done
    scheduleDecisionFlow(setDecision);
  }, [scene, analysis]);

  const handleRestart = useCallback(() => {
    setPlaying(false);
    setLeftMode('idle');
    setRightMode('idle');
    setLeftTime(0);
    setRightTime(0);
    streamStarted.current = false;
    setStreamingCopy('');
    setDecision(initialSteps(scene, analysis));
    setTimeout(handleStart, 100);
  }, [handleStart, scene, analysis]);

  // 左屏：tightMoment 时强插硬广
  const onLeftTimeUpdate = (t: number) => {
    setLeftTime(t);
    if (leftMode === 'scene' && t >= leftTightT) {
      setLeftMode('hardAd');
    }
  };
  // 右屏：relaxedMoment 时自然过渡到 Echo 广告
  const onRightTimeUpdate = (t: number) => {
    setRightTime(t);
    if (rightMode === 'scene' && t >= rightRelaxT) {
      setRightMode('echoAd');
    }
  };

  // 右屏广告播完 → 打开延展包
  const onEchoAdEnd = () => {
    setRightMode('done');
    setTimeout(() => setNepOpen(true), 400);
  };
  const onHardAdEnd = () => setLeftMode('done');

  const heroFrames: AdFrame[] = scene.heroAd.fallbackFrames;

  return (
    <div className="space-y-6">
      {/* 播放控制 */}
      <div className="flex items-center justify-between flex-wrap gap-3 bordered-card px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="chip chip-echo">
            <span className="w-1.5 h-1.5 rounded-full bg-echo" />
            场景模拟 · {scene.title}
          </span>
          <span className="text-xs text-muted">
            该片段共 {scene.duration}s，Demo 用加速视图（{SCENE_SHORT_DURATION}s 走完全部情绪曲线）
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!playing ? (
            <button onClick={handleStart} className="btn btn-primary">
              ▶ 开始对比演示
            </button>
          ) : (
            <button onClick={handleRestart} className="btn btn-ghost">
              ↻ 重新演示
            </button>
          )}
        </div>
      </div>

      {/* 分屏对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左屏：改造前 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="chip chip-danger">现状 · BEFORE</span>
                <h3 className="text-lg font-semibold">硬广强插 · 腾讯视频现状</h3>
              </div>
              <p className="text-xs text-muted mt-1">
                剧情播到 <span className="text-danger font-medium">{scene.tightMoment.label}</span> 时强插标准化硬广
              </p>
            </div>
          </div>

          {leftMode === 'scene' || leftMode === 'idle' ? (
            <SceneVideoStub
              scene={scene}
              playing={playing && leftMode === 'scene'}
              currentTime={mapTime(leftTime, SCENE_SHORT_DURATION, scene.duration)}
              onTimeUpdate={onLeftTimeUpdate}
            />
          ) : leftMode === 'hardAd' ? (
            <div className="relative">
              <AdPlayer
                frames={HARD_AD.frames}
                duration={HARD_AD.duration}
                brandName={HARD_AD.brandName}
                playing
                onEnd={onHardAdEnd}
                variant="hard"
              />
              <div className="absolute inset-0 pointer-events-none animate-fade-in">
                <div className="absolute top-6 right-6 chip chip-danger">
                  切换瞬间 · 无过渡
                </div>
              </div>
            </div>
          ) : (
            <div
              className="aspect-video rounded-xl grid place-items-center bordered-card text-center p-6"
            >
              <div>
                <div className="chip chip-danger mb-3">硬广结束 · 用户已跳过 67%</div>
                <div className="text-lg text-muted">剧情被打断，情绪未恢复</div>
              </div>
            </div>
          )}

          {/* 左屏数据 */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="用户跳过率" value="67%" tone="danger" />
            <Stat label="广告完播" value="31%" tone="danger" />
            <Stat label="弹幕正面率" value="-12%" tone="danger" />
          </div>
        </div>

        {/* 右屏：Echo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="chip chip-echo">Echo · AFTER</span>
                <h3 className="text-lg font-semibold">原生化广告 · 情绪谷底过渡</h3>
              </div>
              <p className="text-xs text-muted mt-1">
                剧情播到 <span className="text-echo font-medium">{scene.relaxedMoment.label}</span> 时自然过渡到{role.displayName}广告
              </p>
            </div>
          </div>

          {rightMode === 'scene' || rightMode === 'idle' ? (
            <SceneVideoStub
              scene={scene}
              playing={playing && rightMode === 'scene'}
              currentTime={mapTime(rightTime, SCENE_SHORT_DURATION, scene.duration)}
              onTimeUpdate={onRightTimeUpdate}
            />
          ) : rightMode === 'echoAd' ? (
            <AdPlayer
              videoSrc={scene.heroAd.videoSrc}
              frames={heroFrames}
              duration={scene.heroAd.duration}
              brandName={scene.heroAd.brandName}
              streamingText={streamingCopy || undefined}
              playing
              onEnd={onEchoAdEnd}
              variant="native"
            />
          ) : (
            <div
              className="aspect-video rounded-xl overflow-hidden bordered-card"
              style={{ background: scene.poster.bgGradient }}
            >
              <div className="h-full grid place-items-center text-center p-6">
                <div>
                  <div className="chip chip-echo mb-3">🔑 叙事延展包已解锁</div>
                  <div className="text-lg text-white">{scene.narrativePack.unlockHint}</div>
                  <button
                    onClick={() => setNepOpen(true)}
                    className="btn btn-primary mt-4"
                  >
                    查看延展包
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 右屏数据 */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="用户跳过率" value="22%" tone="ok" sub="↓67% vs 硬广" />
            <Stat label="广告完播" value="78%" tone="ok" sub="↑120% vs 硬广" />
            <Stat label="弹幕正面率" value="+412%" tone="ok" sub="延展包驱动" />
          </div>
        </div>
      </div>

      {/* AI 决策面板 */}
      <AIDecisionPanel
        steps={decision}
        streamingText={rightMode === 'echoAd' ? streamingCopy : undefined}
        streamingLabel="★ 腔调模仿·LLM 实时生成中"
      />

      {/* 叙事延展包弹层 */}
      <NarrativePackUnlock
        scene={scene}
        show={nepOpen}
        onClose={() => setNepOpen(false)}
      />
    </div>
  );
}

// ------------------------------------------------------------

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: 'ok' | 'danger';
}) {
  const color = tone === 'ok' ? '#22c55e' : '#ff3860';
  return (
    <div className="bordered-card px-3 py-2.5">
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
      <div
        className="font-mono text-xl font-bold mt-0.5"
        style={{ color }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted/80 mt-0.5">{sub}</div>}
    </div>
  );
}

function mapTime(demoT: number, demoDur: number, realDur: number) {
  return (demoT / demoDur) * realDur;
}

function initialSteps(scene: SceneDefinition, analysis: SceneAnalysis): DecisionStep[] {
  return [
    {
      icon: null,
      label: '剧情识别',
      value: `${analysis.genre} · 张力峰值 ${analysis.tension_peak.toFixed(2)} → 尾段 ${analysis.tension_end.toFixed(2)}`,
      hint: `多模态 + 字幕缓存 · 离线预处理`,
      state: 'pending',
    },
    {
      icon: null,
      label: '弹幕情绪聚合',
      value: '心疼·共情占主导（预设样本 0.78）',
      hint: `LLM 语义聚合 · 非词频统计`,
      state: 'pending',
    },
    {
      icon: null,
      label: '最佳插入点',
      value: `${scene.relaxedMoment.label}`,
      hint: `回避高张力区间，选择情绪自然呼吸点`,
      state: 'pending',
    },
    {
      icon: null,
      label: '风格匹配',
      value: `${ROLE_TONES[scene.roleToneId].displayName} · ${ROLE_TONES[scene.roleToneId].era}`,
      hint: `半文半白 / 冷峻哲思 / 沪式商海 —— 高维风格迁移`,
      state: 'pending',
    },
    {
      icon: null,
      label: '资产复用',
      value: scene.reusableAssets.slice(0, 3).join(' · '),
      hint: '叙事资产耦合：广告"继承"剧集虚拟资产，非简单"像"',
      state: 'pending',
    },
    {
      icon: null,
      label: '品牌方费用模型',
      value: '基础广告费 + 延展包溢价（+30%）',
      hint: '平台抽成 30% · IP 方分成 10%',
      state: 'pending',
    },
  ];
}

function scheduleDecisionFlow(setDecision: (fn: (prev: DecisionStep[]) => DecisionStep[]) => void) {
  const timings = [300, 900, 1500, 2200, 3000, 3800];
  const durations = [500, 500, 500, 500, 500, 500];
  timings.forEach((t, i) => {
    setTimeout(() => {
      setDecision((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, state: 'active' } : s))
      );
    }, t);
    setTimeout(() => {
      setDecision((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, state: 'done' } : s))
      );
    }, t + durations[i]);
  });
}
