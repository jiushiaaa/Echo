'use client';

import { useState, useRef, useCallback } from 'react';

type AnalysisStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

type EmotionPoint = {
  t: number;
  tension: number;
  label?: string;
};

const STEPS_TEMPLATE: string[] = [
  '扫描场景画面',
  '识别关键物体',
  '计算情绪曲线',
  '定位广告窗口',
];

const EMOTION_CURVE: EmotionPoint[] = [
  { t: 0, tension: 0.32 },
  { t: 18, tension: 0.48 },
  { t: 36, tension: 0.71 },
  { t: 58, tension: 0.84 },
  { t: 78, tension: 0.62 },
  { t: 102, tension: 0.31 },
  { t: 120, tension: 0.28 },
];

const DETECTED_OBJECTS = [
  '范闲独白',
  '鉴查院腰牌',
  '京都城门',
  '庆帝的冷笑',
  '监察使令牌',
];

export default function AnalyzeClient() {
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [steps, setSteps] = useState<AnalysisStep[]>(
    STEPS_TEMPLATE.map((label) => ({ label, status: 'pending' }))
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const startAnalysis = useCallback(() => {
    setPhase('analyzing');
    const fresh: AnalysisStep[] = STEPS_TEMPLATE.map((label) => ({
      label,
      status: 'pending',
    }));
    setSteps(fresh);

    let i = 0;
    const tick = () => {
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, status: 'done' };
          if (idx === i) return { ...s, status: 'active' };
          return { ...s, status: 'pending' };
        })
      );
      i++;
      if (i <= STEPS_TEMPLATE.length) {
        setTimeout(tick, 800);
      } else {
        setPhase('done');
      }
    };
    tick();
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      startAnalysis();
    },
    [startAnalysis]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-8">
      {phase === 'idle' && (
        <div className="flex flex-col gap-5">
          <div
            className={`bordered-card border-dashed flex flex-col items-center justify-center gap-4 py-16 px-6 transition cursor-pointer ${
              isDragging ? 'border-[#d4a574] bg-white/[0.03]' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <UploadIcon />
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">
                拖拽图片到此处，或点击选择文件
              </p>
              <p className="text-white/40 text-xs mt-1">
                支持 JPG / PNG / WebP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs tracking-wider">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button className="btn btn-primary w-full" onClick={startAnalysis}>
            使用庆余年预设片段
          </button>
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="flex flex-col gap-6">
          {uploadedImage && (
            <div className="bordered-card p-3">
              <img
                src={uploadedImage}
                alt="uploaded"
                className="w-full max-h-48 object-contain rounded-lg"
              />
            </div>
          )}
          <div className="bordered-card p-6">
            <div className="text-white/80 text-sm font-medium mb-5">
              分析中...
            </div>
            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <StepIndicator status={step.status} />
                  <span
                    className={`text-sm transition-colors ${
                      step.status === 'done'
                        ? 'text-white/60'
                        : step.status === 'active'
                        ? 'text-white'
                        : 'text-white/30'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col gap-5">
          {uploadedImage && (
            <div className="bordered-card p-3">
              <img
                src={uploadedImage}
                alt="uploaded"
                className="w-full max-h-48 object-contain rounded-lg"
              />
              <p className="text-white/40 text-[11px] mt-2 text-center">
                Demo 模式：使用预设分析数据 · 真实 API 待接入
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SceneCard />
            <ObjectsCard />
            <EmotionCurveCard />
            <AdWindowCard />
          </div>

          <button
            className="btn btn-ghost w-fit"
            onClick={() => {
              setPhase('idle');
              setUploadedImage(null);
            }}
          >
            重新分析
          </button>
        </div>
      )}
    </div>
  );
}

function SceneCard() {
  return (
    <div className="bordered-card p-5">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        场景识别
      </div>
      <div className="flex flex-col gap-3">
        <Row label="类型" value="古装权谋 · 现代灵魂" />
        <Row label="时代" value="架空古装" />
        <Row label="氛围" value="朝堂博弈、家国情怀" />
      </div>
    </div>
  );
}

function ObjectsCard() {
  return (
    <div className="bordered-card p-5">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        关键物体检测
      </div>
      <div className="flex flex-wrap gap-2">
        {DETECTED_OBJECTS.map((obj) => (
          <span key={obj} className="chip chip-echo">
            {obj}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmotionCurveCard() {
  const W = 480;
  const H = 180;
  const PAD_X = 40;
  const PAD_Y = 24;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_Y * 2;

  const maxT = 120;

  const toX = (t: number) => PAD_X + (t / maxT) * chartW;
  const toY = (tension: number) => PAD_Y + (1 - tension) * chartH;

  const pathD = EMOTION_CURVE.map((p, i) => {
    const x = toX(p.t);
    const y = toY(p.tension);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const peakIdx = 3;
  const valleyIdx = 5;
  const peak = EMOTION_CURVE[peakIdx];
  const valley = EMOTION_CURVE[valleyIdx];

  return (
    <div className="bordered-card p-5 md:col-span-2">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        情绪曲线
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 200 }}
      >
        <line
          x1={PAD_X}
          y1={H - PAD_Y}
          x2={W - PAD_X}
          y2={H - PAD_Y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        {[0.25, 0.5, 0.75, 1].map((v) => (
          <line
            key={v}
            x1={PAD_X}
            y1={toY(v)}
            x2={W - PAD_X}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}

        <path
          d={pathD}
          fill="none"
          stroke="#d4a574"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {EMOTION_CURVE.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.t)}
            cy={toY(p.tension)}
            r={i === peakIdx || i === valleyIdx ? 5 : 3}
            fill={
              i === peakIdx
                ? '#ef4444'
                : i === valleyIdx
                ? '#22c55e'
                : '#d4a574'
            }
          />
        ))}

        <text
          x={toX(peak.t)}
          y={toY(peak.tension) - 10}
          textAnchor="middle"
          fill="#ef4444"
          fontSize={10}
          fontFamily="sans-serif"
        >
          暗流涌现 {peak.tension.toFixed(2)}
        </text>

        <text
          x={toX(valley.t)}
          y={toY(valley.tension) + 16}
          textAnchor="middle"
          fill="#22c55e"
          fontSize={10}
          fontFamily="sans-serif"
        >
          回府独白 {valley.tension.toFixed(2)}
        </text>

        <text
          x={PAD_X}
          y={H - 4}
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
          fontFamily="sans-serif"
        >
          0s
        </text>
        <text
          x={W - PAD_X}
          y={H - 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
          fontFamily="sans-serif"
        >
          120s
        </text>
      </svg>
      <div className="text-white/40 text-xs mt-2">
        片段总时长 150s · 显示前 120s 关键区间
      </div>
    </div>
  );
}

function AdWindowCard() {
  return (
    <div className="bordered-card p-5 md:col-span-2">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        推荐广告窗口
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] mt-1.5 shrink-0" />
          <div>
            <div className="text-white text-sm font-medium">
              回府独白 · 1:42
            </div>
            <div className="text-white/60 text-xs mt-1">
              张力值降至 0.31，情绪自然呼吸点
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5 shrink-0" />
          <div>
            <div className="text-white/60 text-sm font-medium">
              <span className="text-[#ef4444]">NOT recommended:</span>{' '}
              暗流涌现 · 0:58
            </div>
            <div className="text-white/40 text-xs mt-1">
              张力峰值 0.84，强行插入会打断沉浸
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-white/40 text-xs shrink-0 w-10">{label}</span>
      <span className="text-white/90 text-sm">{value}</span>
    </div>
  );
}

function StepIndicator({ status }: { status: 'pending' | 'active' | 'done' }) {
  if (status === 'done') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 grid place-items-center shrink-0">
        <svg viewBox="0 0 16 16" className="w-3 h-3 text-[#22c55e]">
          <path
            fill="currentColor"
            d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z"
          />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#d4a574]/20 grid place-items-center shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#d4a574] animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-white/5 grid place-items-center shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8 text-white/30"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
      />
    </svg>
  );
}
