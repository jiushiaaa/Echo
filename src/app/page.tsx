import dynamic from 'next/dynamic';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import RevealOnScroll from '@/components/RevealOnScroll';

const CircularGallery = dynamic(
  () => import('@/components/CircularGallery/index.jsx'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopNav />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full z-0 hero-bg-drift"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0c0c0e]" />
        <div className="hero-aura" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-36 md:pt-48 pb-28 md:pb-36">
          <div className="flex flex-col gap-8 max-w-4xl">
            <div className="liquid-glass rounded-full px-1 py-1 inline-flex items-center gap-3 w-fit pr-4">
              <span className="bg-white text-black rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
                v5
              </span>
              <span className="text-[12px] text-white/80 font-body">
                腾讯 PCG 校园 AI 创意大赛 · 方案原型
              </span>
            </div>

            <h1
              className="editorial-italic text-white leading-[0.95] tracking-[-0.03em] text-left"
              style={{ fontSize: 'clamp(40px, 5.5vw, 88px)' }}
            >
              广告，是剧集的<span className="grad-echo">回声</span>
              <br />
              <span className="text-white/60">不是打断。</span>
            </h1>

            <p className="text-white/65 font-body font-light text-base md:text-lg max-w-2xl leading-relaxed">
              Echo 用 AI 上下文感知重新定义广告编排——在对的时间，投放对的品牌，用对的语言过渡。让每一次广告都是剧集的自然延续。
            </p>

            <div className="flex flex-wrap items-center gap-5 mt-4">
              <Link
                href="/compare"
                className="liquid-glass-strong btn-glass"
              >
                进入对比演示
                <ArrowUpRight />
              </Link>
              <Link href="/analyze" className="btn-link">
                AI 预分析
              </Link>
              <Link href="/match" className="btn-link">
                品牌匹配
              </Link>
            </div>

            <div className="mt-16 md:mt-24 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/80 tracking-wider uppercase">
                  Built around
                </span>
                <span className="text-[11px] text-white/40 tracking-wider uppercase">
                  S+ 级国民 IP
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: '500px', position: 'relative' }}>
          <CircularGallery
            items={[
              { image: '/images/qingyunian.png', text: '庆余年' },
              { image: '/images/santi.png', text: '三体' },
              { image: '/images/meiguidguhsi.png', text: '玫瑰的故事' },
              { image: '/images/fanhua.png', text: '繁花' },
              { image: '/images/kuangbiao.png', text: '狂飙' },
              { image: '/images/kaiduan.png', text: '开端' },
            ]}
            bend={3}
            textColor="#d4a574"
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.02}
            autoSpeed={1}
          />
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-20">
        <SectionHeader
          num="How · 01"
          badge="Core Pipeline"
          title={
            <>
              一条链路，三个环节，<br />
              <span className="editorial-italic text-white/70">
                让广告成为剧集的延续
              </span>
              。
            </>
          }
          desc="Echo 做的一件事：AI 上下文感知广告编排。在对的时间，选对的品牌，用对的语言过渡。"
        />

        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            <FeatureCard
              num="01"
              title="AI 预分析"
              desc="平台拥有完整剧集，AI 提前分析每一帧的场景、物体、情绪曲线，找到每集的「情绪呼吸点」——最适合投放的时机窗口。"
              href="/analyze"
              highlight="上下文感知"
            />
            <FeatureCard
              num="02"
              title="品牌匹配"
              desc="从动态广告库中，AI 根据当前场景上下文，实时选出与剧情最契合的品牌。不是随机塞入，是智能匹配。"
              href="/match"
              highlight="广告库选品"
            />
            <FeatureCard
              num="03"
              title="过渡包装"
              desc="AI 实时识别画面场景，生成剧集腔调的「过渡语」衔接广告，播完后再用「回归语」把观众情绪拉回剧情。"
              href="/compare"
              highlight="过渡 + 回归"
            />
          </div>
        </RevealOnScroll>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pt-24 pb-20">
        <RevealOnScroll>
          <div className="liquid-glass rounded-3xl p-10 md:p-14">
            <div className="text-[11px] text-white/50 font-mono tracking-wider mb-3 uppercase">
              Why Echo
            </div>
            <h3
              className="editorial-italic text-white leading-[1.05]"
              style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}
            >
              为什么长视频用户，比短视频用户更恨广告？
            </h3>
            <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed max-w-3xl">
              因为广告撕毁了「沉浸契约」。长视频用户投入数小时建立的情感连接，被一支无关广告瞬间打断。
              Echo 不优化广告本身，它重建契约——让广告借用剧集的情绪和语言，成为剧集的延续而非入侵。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
              <ValueCard
                label="用户"
                value="打扰更少"
                desc="广告在情绪谷底自然出现，而非高潮处硬切。过渡语让切换不再突兀。"
              />
              <ValueCard
                label="平台"
                value="用户不流失"
                desc="用户不再因广告退出。广告完播率提升，广告库价值释放。"
              />
              <ValueCard
                label="广告主"
                value="真正被看进去"
                desc="匹配品牌 + 剧集腔调包装 = 广告不再被跳过，完播率和转化率双升。"
              />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] text-white/40">
          <div className="flex flex-col gap-1">
            <div className="text-white/80 font-medium">Echo · v5</div>
            <div>腾讯 PCG 校园 AI 创意大赛 · 方案原型 · 2026</div>
          </div>
          <div className="font-mono text-[11px] tracking-wide">
            OpenAI-compatible · GLM-4 / DeepSeek / Kimi / Qwen
          </div>
        </div>
      </footer>
    </main>
  );
}

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

function FeatureCard({
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

function ValueCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="bordered-card p-5">
      <div className="text-[10px] text-echo uppercase tracking-wider mb-2">{label}</div>
      <div className="text-xl font-semibold text-white mb-2">{value}</div>
      <p className="text-[13px] text-white/60 font-light leading-relaxed">{desc}</p>
    </div>
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
