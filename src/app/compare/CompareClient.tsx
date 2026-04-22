'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneVideoStub from '@/components/SceneVideoStub';
import AdPlayer from '@/components/AdPlayer';
import AIDecisionPanel, { DecisionStep } from '@/components/AIDecisionPanel';
import type { SceneDefinition } from '@/data/scenes';
import { MISMATCH_AD } from '@/data/scenes';
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

type LeftMode = 'idle' | 'scene' | 'hardAd' | 'done';
type RightMode = 'idle' | 'scene' | 'transition' | 'nativeAd' | 'return' | 'done';

const SCENE_SHORT_DURATION = 16;

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
};

export default function CompareClient({
  scene,
  analysis,
}: {
  scene: SceneDefinition;
  analysis: SceneAnalysis;
}) {
  const [playing, setPlaying] = useState(false);

  const [leftMode, setLeftMode] = useState<LeftMode>('idle');
  const [rightMode, setRightMode] = useState<RightMode>('idle');
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);

  const leftTightT = (scene.tightMoment.t / scene.duration) * SCENE_SHORT_DURATION;
  const rightRelaxT = (scene.relaxedMoment.t / scene.duration) * SCENE_SHORT_DURATION;

  const [decision, setDecision] = useState<DecisionStep[]>(() => initialSteps(scene, analysis));

  const [transitionText, setTransitionText] = useState('');
  const [returnText, setReturnText] = useState('');
  const streamStarted = useRef(false);
  const returnStreamStarted = useRef(false);

  useEffect(() => {
    if (rightMode !== 'transition' || streamStarted.current) return;
    streamStarted.current = true;

    const role = ROLE_TONES[scene.roleToneId];
    setTransitionText('');

    fetch('/api/tone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId: scene.roleToneId,
        brand: scene.heroAd.brandName,
        sellingPoint: scene.heroAd.sellingPoint,
        sceneContext: scene.relaxedMoment.label,
        emotionOverride: 'heartache',
        mode: 'transition',
      }),
    })
      .then((res) => {
        if (!res.body) throw new Error('No body');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        function read(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              setTimeout(() => setRightMode('nativeAd'), 1200);
              return;
            }
            setTransitionText((prev) => prev + decoder.decode(value, { stream: true }));
            return read();
          });
        }
        return read();
      })
      .catch(() => {
        setTransitionText(`${role.displayName}：${scene.heroAd.brandName}，值得被好好对待。`);
        setTimeout(() => setRightMode('nativeAd'), 1200);
      });
  }, [rightMode, scene]);

  useEffect(() => {
    if (rightMode !== 'return' || returnStreamStarted.current) return;
    returnStreamStarted.current = true;

    setReturnText('');

    fetch('/api/tone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId: scene.roleToneId,
        brand: scene.title,
        sellingPoint: '剧情回归',
        sceneContext: '广告结束，剧情即将继续',
        emotionOverride: 'catharsis',
        mode: 'return',
      }),
    })
      .then((res) => {
        if (!res.body) throw new Error('No body');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        function read(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              setTimeout(() => setRightMode('done'), 1500);
              return;
            }
            setReturnText((prev) => prev + decoder.decode(value, { stream: true }));
            return read();
          });
        }
        return read();
      })
      .catch(() => {
        setReturnText('灯火重燃，故事未完。');
        setTimeout(() => setRightMode('done'), 1500);
      });
  }, [rightMode, scene]);

  const handleStart = useCallback(() => {
    setPlaying(true);
    setLeftMode('scene');
    setRightMode('scene');
    setLeftTime(0);
    setRightTime(0);
    setTransitionText('');
    setReturnText('');
    streamStarted.current = false;
    returnStreamStarted.current = false;
    setDecision(initialSteps(scene, analysis));
    scheduleDecisionFlow(setDecision);
  }, [scene, analysis]);

  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    const t = setTimeout(() => handleStart(), 1000);
    return () => clearTimeout(t);
  }, [handleStart]);

  const handleRestart = useCallback(() => {
    setPlaying(false);
    setLeftMode('idle');
    setRightMode('idle');
    setLeftTime(0);
    setRightTime(0);
    setTransitionText('');
    setReturnText('');
    streamStarted.current = false;
    returnStreamStarted.current = false;
    setDecision(initialSteps(scene, analysis));
    setTimeout(handleStart, 100);
  }, [handleStart, scene, analysis]);

  const onLeftTimeUpdate = (t: number) => {
    setLeftTime(t);
    if (leftMode === 'scene' && t >= leftTightT) {
      setLeftMode('hardAd');
    }
  };

  const onRightTimeUpdate = (t: number) => {
    setRightTime(t);
    if (rightMode === 'scene' && t >= rightRelaxT) {
      setRightMode('transition');
    }
  };

  const onHardAdEnd = () => setLeftMode('done');
  const onNativeAdEnd = () => setRightMode('return');

  const activeStreamText =
    rightMode === 'transition' ? transitionText
    : rightMode === 'return' ? returnText
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 bordered-card px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="chip chip-echo">
            <span className="w-1.5 h-1.5 rounded-full bg-echo" />
            场景模拟 · {scene.title}
          </span>
          <span className="text-xs text-muted">
            {scene.duration}s 片段 · 加速至 {SCENE_SHORT_DURATION}s 演示
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip chip-danger">传统投放 · BEFORE</span>
              <h3 className="text-lg font-semibold">随机品牌 · 高潮硬切 · 无过渡</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              {scene.tightMoment.label} 时强插不相关品牌「{MISMATCH_AD.brandName}」({MISMATCH_AD.brandCategory})
            </p>
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
                videoSrc={MISMATCH_AD.videoSrc}
                frames={[
                  {
                    bgGradient: 'linear-gradient(135deg, #1a0818 0%, #c2547a 100%)',
                    headline: MISMATCH_AD.brandName,
                    footline: MISMATCH_AD.sellingPoint,
                  },
                ]}
                duration={MISMATCH_AD.duration}
                brandName={MISMATCH_AD.brandName}
                playing
                onEnd={onHardAdEnd}
                variant="hard"
              />
              <div className="absolute inset-0 pointer-events-none animate-fade-in">
                <div className="absolute top-6 right-6 chip chip-danger">
                  高潮硬切 · 品牌不匹配 · 无过渡
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-xl grid place-items-center bordered-card text-center p-6">
              <div>
                <div className="chip chip-danger mb-3">硬广结束 · 67% 用户已跳过</div>
                <div className="text-lg text-muted">剧情被打断 · 情绪断裂 · 品牌毫无关联</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Stat label="用户跳过率" value="67%" tone="danger" />
            <Stat label="广告完播" value="31%" tone="danger" />
            <Stat label="品牌契合" value="22%" tone="danger" sub="个护 × 古装权谋" />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip chip-echo">Echo 投放 · AFTER</span>
              <h3 className="text-lg font-semibold">匹配品牌 · 情绪谷底 · AI 过渡</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Echo 在 <span className="text-echo font-medium">{scene.relaxedMoment.label}</span> 自然过渡至匹配品牌「{scene.heroAd.brandName}」
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(rightMode === 'scene' || rightMode === 'idle') && (
              <motion.div key="scene" {...cardVariants}>
                <SceneVideoStub
                  scene={scene}
                  playing={playing && rightMode === 'scene'}
                  currentTime={mapTime(rightTime, SCENE_SHORT_DURATION, scene.duration)}
                  onTimeUpdate={onRightTimeUpdate}
                />
              </motion.div>
            )}

            {rightMode === 'transition' && (
              <motion.div
                key="transition"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="aspect-video rounded-xl grid place-items-center bordered-card relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: scene.poster.bgGradient }}
                />
                <div className="relative z-10 px-8 text-center max-w-lg">
                  <div className="chip chip-echo mb-4">AI 过渡语 · {ROLE_TONES[scene.roleToneId].displayName}</div>
                  <p className="editorial-italic text-xl md:text-2xl text-white/90 leading-relaxed">
                    「{transitionText}
                    <span className="stream-cursor" />」
                  </p>
                  <p className="text-xs text-muted mt-3">
                    从剧情情绪平滑衔接到广告
                  </p>
                </div>
              </motion.div>
            )}

            {rightMode === 'nativeAd' && (
              <motion.div key="native-ad" {...cardVariants} className="relative">
                <AdPlayer
                  videoSrc={scene.heroAd.realAdSrc}
                  frames={scene.heroAd.fallbackFrames}
                  duration={scene.heroAd.duration}
                  brandName={scene.heroAd.brandName}
                  playing
                  onEnd={onNativeAdEnd}
                  variant="native"
                />
                <div className="absolute inset-0 pointer-events-none animate-fade-in">
                  <div className="absolute top-6 right-6 chip chip-echo">
                    Echo 匹配品牌 · {scene.heroAd.brandName}
                  </div>
                </div>
              </motion.div>
            )}

            {rightMode === 'return' && (
              <motion.div
                key="return"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="aspect-video rounded-xl grid place-items-center bordered-card relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: scene.poster.bgGradient }}
                />
                <div className="relative z-10 px-8 text-center max-w-lg">
                  <div className="chip chip-echo mb-4">AI 回归语 · 拉回剧情</div>
                  <p className="editorial-italic text-xl md:text-2xl text-white/90 leading-relaxed">
                    「{returnText}
                    <span className="stream-cursor" />」
                  </p>
                  <p className="text-xs text-muted mt-3">
                    广告结束，AI 将观众情绪拉回剧情
                  </p>
                </div>
              </motion.div>
            )}

            {rightMode === 'done' && (
              <motion.div
                key="done"
                {...cardVariants}
                className="aspect-video rounded-xl grid place-items-center bordered-card text-center p-6"
              >
                <div>
                  <div className="chip chip-echo mb-3">Echo 投放完成 · 78% 完播</div>
                  <div className="text-lg text-white/80">过渡语 → 匹配广告 → 回归语 · 剧情无感恢复</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="用户跳过率" value="22%" tone="ok" sub="↓45pp vs 传统" />
            <Stat label="广告完播" value="78%" tone="ok" sub="↑47pp vs 传统" />
            <Stat label="品牌契合" value="86%" tone="ok" sub="母婴 × 古装成长" />
          </div>
        </div>
      </div>

      <AIDecisionPanel
        steps={decision}
        streamingText={activeStreamText}
        streamingLabel={
          rightMode === 'transition' ? 'AI 过渡语生成中'
          : rightMode === 'return' ? 'AI 回归语生成中'
          : 'Echo AI 决策流程'
        }
      />
    </div>
  );
}

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
      label: '场景预分析',
      value: `${analysis.genre} · 张力峰值 ${analysis.tension_peak.toFixed(2)}`,
      hint: '多模态视觉+字幕离线预处理',
      state: 'pending',
    },
    {
      icon: null,
      label: '情绪窗口选择',
      value: `${scene.relaxedMoment.label} · 张力降至 ${analysis.tension_end.toFixed(2)}`,
      hint: '回避高潮区间，选情绪自然呼吸点',
      state: 'pending',
    },
    {
      icon: null,
      label: '品牌匹配决策',
      value: `广告库 → ${scene.heroAd.brandName}（${scene.heroAd.brandCategory}）· 契合度 86%`,
      hint: '向量检索 + LLM 重排 · 淘汰不相关品牌',
      state: 'pending',
    },
    {
      icon: null,
      label: '过渡语生成',
      value: `${ROLE_TONES[scene.roleToneId].displayName} · 从剧情衔接广告`,
      hint: 'LLM 实时生成，匹配剧集腔调',
      state: 'pending',
    },
    {
      icon: null,
      label: '回归语生成',
      value: '广告结束后拉回剧情情绪',
      hint: 'AI 确保观众无感回归',
      state: 'pending',
    },
  ];
}

function scheduleDecisionFlow(setDecision: (fn: (prev: DecisionStep[]) => DecisionStep[]) => void) {
  const timings = [300, 900, 1500, 2200, 3000];
  const durations = [500, 500, 500, 500, 500];
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
