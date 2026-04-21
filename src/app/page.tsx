import Link from 'next/link';
import TopNav from '@/components/TopNav';
import ScenePoster from '@/components/ScenePoster';
import { SCENES } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopNav />

      {/* Hero · 左重右轻 */}
      <section className="max-w-[1280px] mx-auto px-6 pt-28 md:pt-36 pb-24">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-7">
            <span className="chip w-fit">腾讯 PCG 校园 AI 创意大赛 · 方案原型 · v4</span>

            <h1
              className="font-serif font-semibold tracking-tight text-left"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 58px)',
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              广告是剧集的<span className="grad-echo">回声</span>，<br />
              不是打断。
            </h1>

            <p className="text-muted text-base max-w-xl leading-relaxed">
              让广告继承剧集的腔调与情绪，而非撕毁它。
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-4">
              <Link href="/compare/qingyunian" className="btn btn-primary">
                进入 Demo
                <ArrowRight />
              </Link>
              <Link href="/mirror/qingyunian" className="btn-link">
                试试情绪镜像
              </Link>
              <Link href="/governance" className="btn-link">
                品味守门人
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-sub max-w-[1280px] mx-auto" />

      {/* 场景选择 */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-[11px] text-muted font-mono tracking-wider mb-2 uppercase">Scene · 01</div>
            <h2 className="text-xl md:text-2xl font-semibold leading-snug">
              选一个剧集场景，看同一个品牌被 AI 改写成三种腔调
            </h2>
            <p className="text-muted text-sm mt-2 max-w-xl leading-relaxed">
              同一款手机快充，在范闲体 / 罗辑体 / 宝总体里各有一副面孔。AI 做的不是「选广告」，是「生成广告」。
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="chip">3 部 S+ 级 IP</span>
            <span className="chip">腔调反差最大化</span>
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
                className="group bordered-card overflow-hidden transition hover:brightness-110"
              >
                <ScenePoster scene={scene} size="md" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold">{role.displayName}</div>
                    <div className="text-[10px] text-muted tracking-widest uppercase">进入 →</div>
                  </div>
                  <p className="font-serif text-[14px] leading-relaxed text-muted line-clamp-3 min-h-[60px]">
                    「{sample.sample}」
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {scene.reusableAssets.slice(0, 3).map((a) => (
                      <span key={a} className="chip">
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

      <div className="divider-sub max-w-[1280px] mx-auto" />

      {/* 核心机制三连 */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14">
        <div className="mb-8">
          <div className="text-[11px] text-muted font-mono tracking-wider mb-2 uppercase">Mechanism · 02</div>
          <h2 className="text-xl md:text-2xl font-semibold">三大核心机制 · 每一条都能在 Demo 里亲手触发</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MechCard
            num="01"
            title="情绪镜像"
            desc="AI 读弹幕 + 读剧情，广告色调 / 文案 / 节奏自动响应。评委可现场输入任意弹幕，负向情绪触发全屏熔断。"
            href="/mirror/qingyunian"
            highlight="现场输入"
          />
          <MechCard
            num="02"
            title="叙事资产耦合"
            desc="AI 继承剧集资产（腰牌 / 光年 / 霓虹）改写品牌文案。错误配对自动拦截，AI 修复引擎一键挽救。"
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

      <div className="divider-sub max-w-[1280px] mx-auto" />

      {/* 底部方法论链接 */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-24">
        <div className="bordered-card-hi p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="text-[11px] text-muted font-mono tracking-wider mb-2 uppercase">Methodology</div>
            <h3 className="text-lg md:text-xl font-semibold font-serif leading-snug">
              为什么长视频用户比短视频用户更恨广告？<br />
              <span className="text-muted">—— 因为广告撕毁了「沉浸契约」。</span>
            </h3>
          </div>
          <Link href="/value" className="btn btn-primary whitespace-nowrap">
            查看三方价值推导
            <ArrowRight />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[color:var(--divider)] mt-10">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] text-muted">
          <div className="flex flex-col gap-1">
            <div className="text-text font-medium">Echo · v4</div>
            <div>腾讯 PCG 校园 AI 创意大赛 · 方案原型 · 2026</div>
          </div>
          <div className="font-mono text-[11px] tracking-wide">
            OpenAI-compatible · DeepSeek / Kimi / Qwen · 认接口不认厂商
          </div>
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
      className="bordered-card p-6 transition hover:brightness-110 group block"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[11px] text-muted tracking-wider">{num}</div>
        <span className="chip chip-accent">{highlight}</span>
      </div>
      <div className="text-[17px] font-semibold mb-2">{title}</div>
      <p className="text-[13px] text-muted leading-relaxed">{desc}</p>
      <div className="mt-5 text-[12px] text-amber group-hover:translate-x-1 transition inline-flex items-center gap-1">
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
