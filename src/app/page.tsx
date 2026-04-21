import Link from 'next/link';
import TopNav from '@/components/TopNav';
import ScenePoster from '@/components/ScenePoster';
import { SCENES } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopNav />

      {/* ========= HERO · 编辑体斜体 + 光晕 ========= */}
      <section className="relative overflow-hidden">
        <div className="hero-aura" />

        <div className="relative max-w-[1280px] mx-auto px-6 pt-36 md:pt-48 pb-28 md:pb-36">
          <div className="flex flex-col gap-8 max-w-4xl">
            {/* 参考里的「Introducing」pill：liquid-glass 外壳包一颗白色小 badge */}
            <div className="liquid-glass rounded-full px-1 py-1 inline-flex items-center gap-3 w-fit pr-4">
              <span className="bg-white text-black rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
                v4
              </span>
              <span className="text-[12px] text-white/80 font-body">
                腾讯 PCG 校园 AI 创意大赛 · 方案原型
              </span>
            </div>

            {/* 编辑体大标题 */}
            <h1
              className="editorial-italic text-white leading-[0.92] tracking-[-0.03em] text-left"
              style={{ fontSize: 'clamp(52px, 8.5vw, 120px)' }}
            >
              广告，是剧集的
              <br />
              <span className="grad-echo">回声</span>
              <span className="text-white/60">，不是</span>
              <span className="text-white/30">打断</span>
              <span className="text-white/60">。</span>
            </h1>

            {/* 副标 */}
            <p className="text-white/65 font-body font-light text-base md:text-lg max-w-2xl leading-relaxed">
              让广告继承剧集的腔调与情绪，而非撕毁它。Echo 是视频平台的「品味守门人」。
            </p>

            {/* CTA 组：主液态玻璃 + 两个文字链 */}
            <div className="flex flex-wrap items-center gap-5 mt-4">
              <Link
                href="/compare/qingyunian"
                className="liquid-glass-strong btn-glass"
              >
                进入 Demo
                <ArrowUpRight />
              </Link>
              <Link href="/mirror/qingyunian" className="btn-link">
                <Play /> 情绪镜像现场试
              </Link>
              <Link href="/governance" className="btn-link">
                品味守门人仪表盘
              </Link>
            </div>

            {/* 合作伙伴行 · 编辑体斜体字 */}
            <div className="mt-16 md:mt-24 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/80 tracking-wider uppercase">
                  Built around
                </span>
                <span className="text-[11px] text-white/40 tracking-wider uppercase">
                  S+ 级国民 IP
                </span>
              </div>
              <div className="flex items-center gap-x-10 md:gap-x-16 gap-y-3 flex-wrap">
                {['庆余年', '三体', '繁花', '狂飙', '开端'].map((name) => (
                  <span
                    key={name}
                    className="editorial-italic text-2xl md:text-3xl text-white/75 hover:text-white transition"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= SCENE · 01 ========= */}
      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-20">
        <SectionHeader
          num="Scene · 01"
          badge="Choose Your Stage"
          title={
            <>
              选一个剧集，看同一款产品被 AI<br />
              <span className="editorial-italic text-white/70">
                改写成三种腔调
              </span>
              。
            </>
          }
          desc="同一款手机快充，在范闲体 / 罗辑体 / 宝总体里各有一副面孔。AI 做的不是「选广告」，是「生成广告」。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
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
                    <div className="text-[13px] font-medium">{role.displayName}</div>
                    <div className="text-[10px] text-white/40 tracking-widest uppercase">
                      进入 →
                    </div>
                  </div>
                  <p className="editorial-italic text-[16px] leading-relaxed text-white/70 line-clamp-3 min-h-[70px]">
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

      {/* ========= MECHANISM · 02 ========= */}
      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-20">
        <SectionHeader
          num="Mechanism · 02"
          badge="Capabilities"
          title={
            <>
              三大核心机制，<br />
              <span className="editorial-italic text-white/70">
                每一条都能在 Demo 里亲手触发
              </span>
              。
            </>
          }
          desc="不是讲概念，是点开就动。评委的手指决定屏幕要发生什么。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          <MechCard
            num="01"
            title="情绪镜像"
            desc="AI 读弹幕 + 读剧情，广告色调 / 文案 / 节奏自动响应。负向情绪主导时触发全屏熔断。"
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

      {/* ========= METHODOLOGY ========= */}
      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-32">
        <div className="liquid-glass rounded-3xl p-10 md:p-14 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] text-white/50 font-mono tracking-wider mb-3 uppercase">
              Methodology
            </div>
            <h3
              className="editorial-italic text-white leading-[1.05]"
              style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}
            >
              为什么长视频用户，
              <br />
              比短视频用户更恨广告？
            </h3>
            <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
              因为广告撕毁了「沉浸契约」。Echo 不优化广告，它重建契约。
            </p>
          </div>
          <Link
            href="/value"
            className="liquid-glass-strong btn-glass whitespace-nowrap"
          >
            查看三方价值推导
            <ArrowUpRight />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] text-white/40">
          <div className="flex flex-col gap-1">
            <div className="text-white/80 font-medium">Echo · v4</div>
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

/* ---------- 通用：节标题（数字 + pill + 编辑斜体标题 + 副文案） ---------- */
function SectionHeader({
  num,
  badge,
  title,
  desc,
}: {
  num: string;
  badge: string;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
          {badge}
        </span>
        <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
          {num}
        </span>
      </div>
      <h2
        className="text-white tracking-tight leading-[1.08]"
        style={{ fontSize: 'clamp(30px, 4.4vw, 56px)' }}
      >
        {title}
      </h2>
      <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed">
        {desc}
      </p>
    </div>
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
      className="liquid-glass rounded-2xl p-6 transition hover:brightness-110 group block"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="font-mono text-[11px] text-white/45 tracking-wider">
          {num}
        </div>
        <span className="chip chip-accent">{highlight}</span>
      </div>
      <div className="editorial-italic text-2xl mb-3 text-white">{title}</div>
      <p className="text-[13px] text-white/60 font-light leading-relaxed font-body">
        {desc}
      </p>
      <div className="mt-6 text-[12px] text-white/70 group-hover:text-white group-hover:translate-x-1 transition inline-flex items-center gap-1.5">
        进入体验 <ArrowUpRight />
      </div>
    </Link>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5">
      <path
        fill="currentColor"
        d="M6 4a1 1 0 100 2h5.586L4.293 13.293a1 1 0 101.414 1.414L13 7.414V13a1 1 0 102 0V5a1 1 0 00-1-1H6z"
      />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 20 20" className="w-3 h-3">
      <path fill="currentColor" d="M6 4l10 6-10 6V4z" />
    </svg>
  );
}
