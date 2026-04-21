import Link from 'next/link';
import TopNav from '@/components/TopNav';
import ScenePoster from '@/components/ScenePoster';
import { SCENES } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';

export default function HomePage() {
  return (
    <main className="min-h-screen pt-20">
      <TopNav />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 pt-14 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="chip chip-echo">腾讯 PCG 校园 AI 创意大赛 · 方案原型</span>
            <span className="chip">v4 · Echo</span>
          </div>

          <h1
            className="font-serif font-semibold leading-[1.05]"
            style={{ fontSize: 'clamp(42px, 6vw, 84px)' }}
          >
            广告是剧集的<span className="grad-echo">回声</span>，<br />
            不是<span className="text-muted/90">打断</span>。
          </h1>

          <p className="text-muted text-lg max-w-3xl leading-relaxed">
            Echo 是视频平台的「品味守门人」——让广告从
            <span className="text-white">撕毁沉浸契约的入侵者</span>，变成
            <span className="text-accent">延展剧集叙事的回声</span>。
            用情绪镜像、叙事资产耦合、叙事延展包三大 AI 机制，重构广告与内容的边界。
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Link href="/compare/qingyunian" className="btn btn-primary">
              进入核心对比 Demo
              <ArrowRight />
            </Link>
            <Link href="/mirror/qingyunian" className="btn btn-ghost">
              试试情绪镜像（现场输入）
            </Link>
            <Link href="/governance" className="btn btn-ghost">
              品味守门人仪表盘
            </Link>
          </div>
        </div>
      </section>

      {/* 场景选择 */}
      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs text-muted font-mono tracking-wider mb-2">SCENE · 01</div>
            <h2 className="text-2xl font-semibold">
              选择一个剧集场景，看同一个品牌如何被 AI 改写成三种腔调
            </h2>
            <p className="text-muted text-sm mt-2">
              同一款手机快充广告，在范闲体/罗辑体/宝总体里各有一副面孔 —— AI 做的不是"选广告"，是"生成广告"。
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="chip">共 3 部 S+ 级 IP</span>
            <span className="chip">腔调反差最大化选品</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SCENES.map((scene) => {
            const role = ROLE_TONES[scene.roleToneId];
            const sample = role.exemplars[0];
            return (
              <Link
                key={scene.id}
                href={`/compare/${scene.id}`}
                className="group bordered-card overflow-hidden hover:border-echo/50 transition"
              >
                <ScenePoster scene={scene} size="md" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">{role.displayName}</div>
                    <div className="chip chip-echo text-[10px]">点击进入</div>
                  </div>
                  <p className="font-serif text-[15px] leading-relaxed text-muted line-clamp-3 min-h-[60px]">
                    「{sample.sample}」
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {scene.reusableAssets.slice(0, 3).map((a) => (
                      <span key={a} className="chip text-[11px]">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 核心机制三连 */}
      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="text-xs text-muted font-mono tracking-wider mb-2">MECHANISM · 02</div>
        <h2 className="text-2xl font-semibold mb-6">三大核心机制 · 每一条都能在 Demo 里亲手触发</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MechCard
            num="01"
            title="情绪镜像"
            desc="AI 读弹幕 + 读剧情，广告色调/文案/节奏自动响应。评委可现场输入任意弹幕，负向情绪触发全屏熔断。"
            href="/mirror/qingyunian"
            highlight="现场输入"
          />
          <MechCard
            num="02"
            title="叙事资产耦合"
            desc="AI 继承剧集资产（腰牌/光年/霓虹）改写品牌文案。错误配对自动拦截，AI 修复引擎一键挽救。"
            href="/governance"
            highlight="拦截 + 修复"
          />
          <MechCard
            num="03"
            title="叙事延展包"
            desc={'品牌方付费购买 AI 生成的平行剧情彩蛋（角色独白 + TTS），用户得到「彩蛋馈赠」而非「被剥夺」。'}
            href="/compare/qingyunian"
            highlight="商业闭环"
          />
        </div>
      </section>

      {/* 底部方法论链接 */}
      <section className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="bordered-card-hi p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="text-xs text-muted font-mono tracking-wider mb-2">
              METHODOLOGY
            </div>
            <h3 className="text-xl font-semibold font-serif leading-tight">
              为什么长视频用户比短视频用户更恨广告？<br />
              <span className="text-muted">—— 因为广告撕毁了"沉浸契约"。</span>
            </h3>
          </div>
          <Link href="/value" className="btn btn-primary whitespace-nowrap">
            查看三方价值推导
            <ArrowRight />
          </Link>
        </div>
      </section>

      <footer className="max-w-[1280px] mx-auto px-6 py-12 text-xs text-muted flex items-center justify-between">
        <div>Echo · v4 · 腾讯 PCG 校园 AI 创意大赛方案原型</div>
        <div className="font-mono">
          OpenAI-compatible · DeepSeek / Kimi / Qwen · 认接口不认厂商
        </div>
      </footer>
    </main>
  );
}

function MechCard({
  num,
  title,
  desc,
  href,
  highlight,
}: {
  num: string;
  title: string;
  desc: string;
  href: string;
  highlight: string;
}) {
  return (
    <Link
      href={href}
      className="bordered-card p-6 hover:border-echo/50 transition group block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-xs text-muted">{num}</div>
        <span className="chip chip-accent text-[10px]">{highlight}</span>
      </div>
      <div className="text-lg font-semibold mb-2">{title}</div>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
      <div className="mt-4 text-xs text-echo group-hover:translate-x-1 transition inline-flex items-center gap-1">
        进入体验 <ArrowRight />
      </div>
    </Link>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5">
      <path
        fill="currentColor"
        d="M10.3 4.3l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L12.2 11H4a1 1 0 110-2h8.2L8.9 5.7a1 1 0 011.4-1.4z"
      />
    </svg>
  );
}
