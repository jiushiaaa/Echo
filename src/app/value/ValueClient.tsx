'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export default function ValueClient() {
  // CPM 滑杆
  const [emotionCoef, setEmotionCoef] = useState(1.25);
  const [danmakuCoef, setDanmakuCoef] = useState(1.15);
  const [nepCoef, setNepCoef] = useState(1.3);

  const baseCPM = 40;
  const traditionalCPM = baseCPM;
  const echoCPM = useMemo(
    () => Math.round(baseCPM * emotionCoef * danmakuCoef * nepCoef * 100) / 100,
    [emotionCoef, danmakuCoef, nepCoef]
  );

  const uplift = Math.round(((echoCPM - traditionalCPM) / traditionalCPM) * 100);

  const [accepted, setAccepted] = useState<null | boolean>(null);

  return (
    <div className="space-y-8">
      {/* CPM 公式 */}
      <section className="bordered-card-hi p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="text-xs text-muted font-mono tracking-wider mb-1">PRICING</div>
            <h2 className="text-xl font-semibold">情感溢价 CPM · 从公式推导到新定价权</h2>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted">Echo CPM vs 传统 CPM</div>
            <div className="font-mono text-3xl font-bold text-accent mt-0.5">
              +{uplift}%
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 font-mono text-[15px] leading-relaxed overflow-x-auto">
          <div className="text-muted">// 传统 CPM</div>
          <div className="text-white mb-3">
            <span className="text-muted">CPM</span> = 曝光次数 × 基础单价
          </div>
          <div className="text-muted">// Echo CPM</div>
          <div className="text-white leading-loose">
            <span className="grad-echo font-bold">Echo CPM</span> = 曝光次数 × 基础单价
            <br />
            <span className="pl-[4.3em]">×</span>{' '}
            <span className="text-warn">情绪契合系数</span>
            <span className="text-muted">(0.7-1.5)</span>
            <br />
            <span className="pl-[4.3em]">×</span>{' '}
            <span className="text-warn">弹幕正向率系数</span>
            <span className="text-muted">(0.8-1.3)</span>
            <br />
            <span className="pl-[4.3em]">×</span>{' '}
            <span className="text-warn">叙事延展溢价</span>
            <span className="text-muted">(1.0-1.5)</span>
          </div>
        </div>

        {/* 系数滑块 */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <CoefSlider
            label="情绪契合系数"
            hint={'AI 读剧情+弹幕，判断当下与广告是否共振'}
            value={emotionCoef}
            min={0.7}
            max={1.5}
            step={0.05}
            onChange={setEmotionCoef}
            color="#7c5cff"
          />
          <CoefSlider
            label="弹幕正向率系数"
            hint={'广告时段弹幕「这广告看进去了」的占比'}
            value={danmakuCoef}
            min={0.8}
            max={1.3}
            step={0.05}
            onChange={setDanmakuCoef}
            color="#ff6b35"
          />
          <CoefSlider
            label="叙事延展溢价"
            hint={'品牌方是否购买了「叙事延展包」（角色独白）'}
            value={nepCoef}
            min={1.0}
            max={1.5}
            step={0.05}
            onChange={setNepCoef}
            color="#22c55e"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-white/5 bg-white/2">
            <div className="text-xs text-muted">传统 CPM</div>
            <div className="font-mono text-2xl mt-1">¥ {traditionalCPM.toFixed(2)}</div>
            <div className="text-[11px] text-muted/70 mt-1">通投均价 · 2024 参考</div>
          </div>
          <div className="p-4 rounded-lg border border-echo/30 bg-echo/5">
            <div className="text-xs text-echo">Echo CPM</div>
            <div className="font-mono text-2xl mt-1 grad-echo font-bold">¥ {echoCPM.toFixed(2)}</div>
            <div className="text-[11px] text-muted/70 mt-1">同一曝光，溢价驱动收入</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted leading-relaxed">
          💡{' '}
          <span className="text-white/90">
            系数不是拍脑袋——它们对应 AI 可测量的行为指标（弹幕聚合值 / 情绪曲线贴合度 / 延展包曝光率）。
          </span>{' '}
          所有数字可审计、可复盘、可再训练。
        </div>
      </section>

      {/* 三方价值 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ValueCard
          party="用户 · User"
          tone="echo"
          kpis={[
            { label: '跳过率', delta: '-67%', mono: true },
            { label: '广告回看率', delta: '首次出现', mono: false },
            { label: '弹幕正面率', delta: '+412%', mono: true },
          ]}
          note="从被剥夺，到被馈赠。用户的沉浸契约不再被撕毁。"
        />
        <ValueCard
          party="平台 · Platform"
          tone="accent"
          kpis={[
            { label: '情感溢价 CPM', delta: '+42%', mono: true },
            { label: '用户留存', delta: '+12%', mono: true },
            { label: '广告时段弹幕活跃', delta: '×3.1', mono: true },
          ]}
          note="新定价权 · 新评估指标 · 新流量池规则。"
        />
        <ValueCard
          party="品牌方 · Advertiser"
          tone="ok"
          kpis={[
            { label: '品牌记忆度', delta: '×3.2', mono: true },
            { label: '延展包 UGC', delta: '×8', mono: true },
            { label: '低契合被救回', delta: '+38 分', mono: true },
          ]}
          note={'不只是买曝光，是买「被用户真正看进去」的概率。'}
        />
      </section>

      {/* 冲突 Q&A */}
      <section className="bordered-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <div className="text-xs text-accent font-mono tracking-widest mb-1">⚠ CONFLICT · 硬核原则</div>
            <h3 className="text-xl font-semibold">奢侈品 3 倍出价买《庆余年 2》硬广 —— 接不接？</h3>
            <p className="text-muted text-sm mt-1">
              这不是算数问题，是产品原则。请你先做选择，再看 Echo 的决策。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setAccepted(true)}
            className={cn(
              'rounded-xl p-5 border text-left transition',
              accepted === true
                ? 'border-danger/50 bg-danger/5'
                : 'border-white/10 hover:border-white/20'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="chip chip-danger">接单</span>
              <span className="text-xs text-muted">短期收益导向</span>
            </div>
            <div className="font-semibold text-base mt-2">接受 3 倍出价，照常投放硬广</div>
            <div className="text-xs text-muted mt-2 leading-relaxed">
              单次收益最高，但用户对平台的沉浸契约信任会被撕毁 → 长尾流失 + 弹幕负向涌现。
            </div>
          </button>
          <button
            onClick={() => setAccepted(false)}
            className={cn(
              'rounded-xl p-5 border text-left transition',
              accepted === false
                ? 'border-ok/50 bg-ok/5'
                : 'border-white/10 hover:border-white/20'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="chip chip-ok">不接 · 或强制改造</span>
              <span className="text-xs text-muted">Echo 的选择</span>
            </div>
            <div className="font-semibold text-base mt-2">拒绝，或接单但强制 AI 改造</div>
            <div className="text-xs text-muted mt-2 leading-relaxed">
              原素材契合度不足，进入"改造引擎"；改造后仍不达标则原价退回。平台即原则。
            </div>
          </button>
        </div>

        {accepted !== null && (
          <div
            className={cn(
              'mt-5 p-5 rounded-xl border animate-fade-in',
              accepted
                ? 'border-danger/30 bg-danger/5'
                : 'border-echo/30 bg-echo/5'
            )}
          >
            {accepted ? (
              <>
                <div className="text-danger font-semibold mb-2">🔥 你选了短期收益。但这一次请听 Echo 的：</div>
                <div className="text-sm leading-relaxed text-white/90">
                  一次高价低契合的投放，损失的不是别的 —— 是用户对"这个平台懂内容"的信任。
                  这种信任是复利，一旦撕毁，次日留存会以 1-3% 的速度持续衰减，
                  直到品牌方也发现"在这里投广告没人看"。
                  <br /><br />
                  <span className="grad-echo font-semibold">Echo 的立场：拒绝。</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-echo font-semibold mb-2">✓ 这就是 Echo 的答案。</div>
                <div className="text-sm leading-relaxed text-white/90">
                  对于 3 倍出价却契合度不达标的素材，我们不直接拒绝——
                  先用 AI 强制改造引擎尝试挽救（34 → 72 分是常见区间）。
                  若改造后仍不达标，原价全额退回，并向品牌方提交"不建议投放"的报告。
                  <br /><br />
                  <span className="font-semibold">这不是算数问题，是产品原则。</span>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* 战略性放弃 */}
      <section className="bordered-card p-6">
        <div className="text-xs text-muted font-mono tracking-wider mb-1">TECHNICAL HONESTY</div>
        <h3 className="text-xl font-semibold mb-3">为什么 Echo 主动放弃"实时视频生成"？</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-white/8 bg-white/2">
            <div className="text-sm font-medium text-white">当前阶段</div>
            <div className="text-xs text-muted mt-2 leading-relaxed">
              2026 年的视频生成模型（Sora / 可灵 / 即梦）在 <span className="text-white">延迟、成本、可控性</span> 三个维度
              均不满足商业广告投放标准。Echo 采用"<span className="text-echo">实时文案 + 预合成素材库</span>"架构。
            </div>
          </div>
          <div className="p-4 rounded-lg border border-echo/30 bg-echo/5">
            <div className="text-sm font-medium text-echo">未来迁移路径</div>
            <div className="text-xs text-white/80 mt-2 leading-relaxed">
              待 12-18 个月后视频生成实时化成熟，本架构可<span className="text-echo">无缝迁移为全链路实时生成</span>，
              所有上层 API、数据结构、UI 不变 —— 这叫<span className="font-semibold">有备案的自信</span>。
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 glass rounded-lg text-sm leading-relaxed italic font-serif">
          "本方案在当前阶段主动放弃"实时视频生成"这一伪需求。
          Echo 选择"实时决策+预合成素材库"架构，不是技术妥协，是对技术边界的清醒认知。"
        </div>
      </section>

      {/* 双模型架构 */}
      <section className="bordered-card p-6">
        <div className="text-xs text-muted font-mono tracking-wider mb-1">LLM ARCHITECTURE</div>
        <h3 className="text-xl font-semibold mb-3">双模型架构 · 认接口不认厂商</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-echo/30 bg-echo/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="chip chip-echo text-[11px]">RUNTIME</div>
              <div className="text-sm font-semibold">OpenAI-compatible 接口</div>
            </div>
            <div className="text-xs text-white/80 leading-relaxed">
              剧情分析 · 腔调改写 · 弹幕聚合 · 契合度评分 · AI 修复 <br />
              <span className="text-muted">要求：</span> 延迟 &lt;800ms · 国内直连 · 成本可控
              <br />
              <span className="text-muted">候选：</span> DeepSeek-V3 / Kimi / 通义 / 智谱 / OpenAI
            </div>
            <div className="mt-3 text-[11px] text-echo font-mono">
              baseURL + apiKey 两个环境变量切换，零代码迁移
            </div>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/2">
            <div className="flex items-center gap-2 mb-2">
              <div className="chip text-[11px]">OFFLINE</div>
              <div className="text-sm font-semibold">Claude 3.5 Sonnet 精修 Prompt</div>
            </div>
            <div className="text-xs text-white/80 leading-relaxed">
              离线产出 3 套角色 Prompt 模板（范闲体 / 罗辑体 / 宝总体）<br />
              产物以 JSON 形式入库，运行时零调用。
              <br />
              <span className="text-muted">定位：</span> 拿 Claude 的文学精度，不承担运行时稳定性风险。
            </div>
            <div className="mt-3 text-[11px] text-muted font-mono">
              /src/data/prompts.ts
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm leading-relaxed font-serif italic glass rounded-lg p-4">
          "该架构兼顾了文学精度与工程稳定性——这是对 LLM 商用落地的清醒认知。"
        </div>
      </section>

      {/* 沉浸经济学 */}
      <section className="bordered-card-hi p-6">
        <div className="text-xs text-muted font-mono tracking-wider mb-1">METHODOLOGY</div>
        <h3 className="text-xl font-semibold mb-3">为什么长视频用户比短视频用户更恨广告？</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-sm font-medium text-white mb-2">短视频</div>
            <div className="text-xs text-muted leading-relaxed">
              用户与平台签的是 <span className="text-white">"即时满足契约"</span>：广告是延迟满足的可接受成本。
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-white mb-2">长视频</div>
            <div className="text-xs text-muted leading-relaxed">
              用户与剧集签的是 <span className="grad-echo font-semibold">"沉浸契约"</span>：花 40 分钟建立情感投入。
              广告是<span className="text-danger">暴力撕毁契约</span>的介入者。
            </div>
          </div>
        </div>
        <div className="mt-5 p-5 glass rounded-lg">
          <div className="text-sm text-white/90 leading-relaxed">
            → Echo 的根本解法：
            <span className="grad-echo font-semibold">把广告写进契约里</span>（资产耦合）+{' '}
            <span className="text-accent font-semibold">把广告变成契约的延展</span>（叙事延展包）。
          </div>
        </div>
        <div className="mt-4 text-xs text-muted italic">
          这个视角把方案从"广告优化"升维到"<span className="text-white">沉浸经济学</span>"。
        </div>
      </section>

      {/* 结语 */}
      <section className="text-center py-10">
        <div
          className="font-serif font-semibold"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          <span className="grad-echo">广告是剧集的回声，不是打断。</span>
        </div>
        <div className="text-muted text-sm mt-3 font-mono tracking-widest">
          ECHO · PCG AI 2026 · TASTE GUARDIAN
        </div>
      </section>
    </div>
  );
}

function CoefSlider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  color,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-white/8 bg-white/2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div
          className="font-mono text-xl font-bold"
          style={{ color }}
        >
          ×{value.toFixed(2)}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-3 accent-echo"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-muted/60 font-mono mt-1">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
      <div className="text-[11px] text-muted mt-2 leading-relaxed">{hint}</div>
    </div>
  );
}

function ValueCard({
  party,
  tone,
  kpis,
  note,
}: {
  party: string;
  tone: 'echo' | 'accent' | 'ok';
  kpis: Array<{ label: string; delta: string; mono: boolean }>;
  note: string;
}) {
  const color = tone === 'echo' ? '#7c5cff' : tone === 'accent' ? '#ff6b35' : '#22c55e';
  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        borderColor: color + '44',
        background: `linear-gradient(180deg, ${color}08, rgba(10,10,15,0.8))`,
      }}
    >
      <div className="text-xs text-muted font-mono tracking-wider">{party}</div>
      <div className="space-y-2 mt-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-baseline justify-between">
            <span className="text-xs text-muted">{k.label}</span>
            <span
              className={cn('text-lg font-bold', k.mono && 'font-mono')}
              style={{ color }}
            >
              {k.delta}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 text-[12px] text-white/80 leading-relaxed">
        {note}
      </div>
    </div>
  );
}
