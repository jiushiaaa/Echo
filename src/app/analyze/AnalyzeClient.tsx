'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type AnalysisStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

type EmotionPoint = {
  t: number;
  tension: number;
  label?: string;
};

type VisionResult = {
  sceneType?: string;
  objects?: string[];
  emotionTone?: string;
  recommendedCategory?: string[];
  insertTiming?: string;
  confidence?: number;
  reasoning?: string;
};

const STEPS_TEMPLATE: string[] = [
  '扫描场景画面',
  '识别关键物体',
  '计算情绪曲线',
  '定位广告窗口',
];

const PRESET_EMOTION_CURVE: EmotionPoint[] = [
  { t: 0, tension: 0.32, label: '回京路上' },
  { t: 18, tension: 0.48, label: '街市偶遇' },
  { t: 36, tension: 0.71, label: '朝堂风向' },
  { t: 58, tension: 0.84, label: '暗流涌现' },
  { t: 78, tension: 0.62, label: '范闲自嘲' },
  { t: 102, tension: 0.31, label: '回府独白' },
  { t: 120, tension: 0.28, label: '夜深独坐' },
];

const PRESET_OBJECTS = [
  '范闲独白', '鉴查院腰牌', '京都城门', '庆帝的冷笑', '监察使令牌',
];

export default function AnalyzeClient() {
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [steps, setSteps] = useState<AnalysisStep[]>(
    STEPS_TEMPLATE.map((label) => ({ label, status: 'pending' }))
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [emotionCurve] = useState<EmotionPoint[]>(PRESET_EMOTION_CURVE);
  const [detectedObjects, setDetectedObjects] = useState<string[]>(PRESET_OBJECTS);
  const [error, setError] = useState<string | null>(null);
  const [isPreset, setIsPreset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const runStepAnimation = useCallback((onDone: () => void) => {
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
        onDone();
      }
    };
    tick();
  }, []);

  const analyzeWithVision = useCallback(async (base64: string) => {
    setError(null);
    setIsPreset(false);
    runStepAnimation(async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setVisionResult(data);
        if (data.objects) setDetectedObjects(data.objects);
        setPhase('done');
      } catch {
        setVisionResult(null);
        setDetectedObjects(PRESET_OBJECTS);
        setPhase('done');
        setError('视觉分析 API 调用失败，已降级为预设数据');
      }
    });
  }, [runStepAnimation]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setUploadedImage(url);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        analyzeWithVision(base64);
      };
      reader.readAsDataURL(file);
    },
    [analyzeWithVision]
  );

  const startPresetAnalysis = useCallback(() => {
    setIsPreset(true);
    setError(null);
    runStepAnimation(() => {
      setVisionResult(null);
      setDetectedObjects(PRESET_OBJECTS);
      setPhase('done');
    });
  }, [runStepAnimation]);

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

  const sceneType = visionResult?.sceneType || '古装权谋 · 现代灵魂';
  const emotionTone = visionResult?.emotionTone || '紧张→释然';
  const confidence = visionResult?.confidence;
  const recommendedCats = visionResult?.recommendedCategory || ['3C 手机', '文旅', '游戏'];
  const reasoning = visionResult?.reasoning;

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
                支持 JPG / PNG / WebP · AI 将分析场景内容
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs tracking-wider">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button className="btn btn-primary w-full" onClick={startPresetAnalysis}>
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
              {isPreset ? '分析中...' : 'AI 视觉分析中...'}
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
              {!isPreset && !error && (
                <p className="text-[#22c55e]/60 text-[11px] mt-2 text-center">
                  AI 视觉模型分析完成
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bordered-card p-3 border-yellow-500/30 bg-yellow-500/5">
              <p className="text-yellow-400/80 text-xs">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SceneCard sceneType={sceneType} emotionTone={emotionTone} confidence={confidence} />
            <ObjectsCard objects={detectedObjects} />
            <EmotionCurveCard curve={emotionCurve} />
            <AdWindowCard recommendedCats={recommendedCats} reasoning={reasoning} />
          </div>

          <button
            className="btn btn-ghost w-fit"
            onClick={() => {
              setPhase('idle');
              setUploadedImage(null);
              setVisionResult(null);
              setError(null);
              if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
              }
            }}
          >
            重新分析
          </button>
        </div>
      )}
    </div>
  );
}

function SceneCard({ sceneType, emotionTone, confidence }: { sceneType: string; emotionTone: string; confidence?: number }) {
  return (
    <div className="bordered-card p-5">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        场景识别
      </div>
      <div className="flex flex-col gap-3">
        <Row label="类型" value={sceneType} />
        <Row label="氛围" value={emotionTone} />
        {confidence !== undefined && (
          <Row label="置信" value={`${(confidence * 100).toFixed(0)}%`} />
        )}
      </div>
    </div>
  );
}

function ObjectsCard({ objects }: { objects: string[] }) {
  return (
    <div className="bordered-card p-5">
      <div className="text-[11px] text-white/50 tracking-wider uppercase mb-4">
        关键物体检测
      </div>
      <div className="flex flex-wrap gap-2">
        {objects.map((obj) => (
          <span key={obj} className="chip chip-echo">
            {obj}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmotionCurveCard({ curve }: { curve: EmotionPoint[] }) {
  const W = 480;
  const H = 180;
  const PAD_X = 40;
  const PAD_Y = 24;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_Y * 2;

  const maxT = 120;
  const toX = (t: number) => PAD_X + (t / maxT) * chartW;
  const toY = (tension: number) => PAD_Y + (1 - tension) * chartH;

  const pathD = curve.map((p, i) => {
    const x = toX(p.t);
    const y = toY(p.tension);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const peakIdx = curve.reduce((maxI, p, i, arr) => p.tension > arr[maxI].tension ? i : maxI, 0);
  const valleyIdx = curve.reduce((minI, p, i, arr) => (i > 2 && p.tension < arr[minI].tension) ? i : minI, 2);

  const peak = curve[peakIdx];
  const valley = curve[valleyIdx];

  const adWindowStart = valley.t - 10;
  const adWindowEnd = Math.min(maxT, valley.t + 20);

  const pathLength = curve.reduce((total, p, i) => {
    if (i === 0) return 0;
    const prev = curve[i - 1];
    const dx = toX(p.t) - toX(prev.t);
    const dy = toY(p.tension) - toY(prev.tension);
    return total + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
        <defs>
          <linearGradient id="adWindowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X} y1={H - PAD_Y} x2={W - PAD_X} y2={H - PAD_Y}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1}
        />
        {[0.25, 0.5, 0.75, 1].map((v) => (
          <line
            key={v}
            x1={PAD_X} y1={toY(v)} x2={W - PAD_X} y2={toY(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />
        ))}

        <rect
          x={toX(adWindowStart)}
          y={PAD_Y}
          width={toX(adWindowEnd) - toX(adWindowStart)}
          height={chartH}
          fill="url(#adWindowGrad)"
          rx={4}
        />
        <line
          x1={toX(adWindowStart)} y1={PAD_Y}
          x2={toX(adWindowStart)} y2={PAD_Y + chartH}
          stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4}
        />
        <line
          x1={toX(adWindowEnd)} y1={PAD_Y}
          x2={toX(adWindowEnd)} y2={PAD_Y + chartH}
          stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4}
        />
        <text
          x={(toX(adWindowStart) + toX(adWindowEnd)) / 2}
          y={PAD_Y + 12}
          textAnchor="middle"
          fill="#22c55e"
          fontSize={8}
          fontFamily="sans-serif"
          opacity={0.7}
        >
          广告推荐窗口
        </text>

        <path
          d={pathD}
          fill="none"
          stroke="#d4a574"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength}
          className="animate-draw-line"
        />

        {curve.map((p, i) => (
          <g key={i}>
            <circle
              cx={toX(p.t)}
              cy={toY(p.tension)}
              r={hoveredIdx === i ? 7 : (i === peakIdx || i === valleyIdx ? 5 : 3)}
              fill={
                i === peakIdx ? '#ef4444'
                : i === valleyIdx ? '#22c55e'
                : '#d4a574'
              }
              className="transition-all duration-200"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {hoveredIdx === i && (
              <g>
                <rect
                  x={toX(p.t) - 55}
                  y={toY(p.tension) - 40}
                  width={110}
                  height={30}
                  rx={6}
                  fill="rgba(0,0,0,0.85)"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                />
                <text
                  x={toX(p.t)}
                  y={toY(p.tension) - 27}
                  textAnchor="middle"
                  fill="white"
                  fontSize={9}
                  fontFamily="sans-serif"
                >
                  {p.label || `${p.t}s`} · 张力 {p.tension.toFixed(2)}
                </text>
                <text
                  x={toX(p.t)}
                  y={toY(p.tension) - 16}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={8}
                  fontFamily="sans-serif"
                >
                  t={p.t}s
                </text>
              </g>
            )}
          </g>
        ))}

        {hoveredIdx === null && (
          <>
            <text
              x={toX(peak.t)} y={toY(peak.tension) - 10}
              textAnchor="middle" fill="#ef4444" fontSize={10} fontFamily="sans-serif"
            >
              {peak.label || '峰值'} {peak.tension.toFixed(2)}
            </text>
            <text
              x={toX(valley.t)} y={toY(valley.tension) + 16}
              textAnchor="middle" fill="#22c55e" fontSize={10} fontFamily="sans-serif"
            >
              {valley.label || '谷底'} {valley.tension.toFixed(2)}
            </text>
          </>
        )}

        <text x={PAD_X} y={H - 4} fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="sans-serif">
          0s
        </text>
        <text x={W - PAD_X} y={H - 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="sans-serif">
          120s
        </text>
      </svg>
      <div className="text-white/40 text-xs mt-2">
        片段总时长 150s · 显示前 120s 关键区间 · <span className="text-[#22c55e]/60">绿色区域</span>为推荐广告插入窗口
      </div>
    </div>
  );
}

function AdWindowCard({ recommendedCats, reasoning }: { recommendedCats: string[]; reasoning?: string }) {
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

        {recommendedCats.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] text-white/40 mb-2">AI 推荐广告品类</div>
            <div className="flex flex-wrap gap-2">
              {recommendedCats.map((cat) => (
                <span key={cat} className="chip chip-echo">{cat}</span>
              ))}
            </div>
          </div>
        )}

        {reasoning && (
          <div className="pt-1 text-white/50 text-xs leading-relaxed border-t border-white/5 mt-1 pt-3">
            {reasoning}
          </div>
        )}
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
          <path fill="currentColor" d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z" />
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
