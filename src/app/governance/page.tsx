import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import GovernanceClient from './GovernanceClient';

export default function Page() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '品味守门人' },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-6">
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
              Taste Guardian
            </span>
            <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
              Screen · 04
            </span>
          </div>
          <h1
            className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
          >
            品味守门人 ·<br />
            <span className="text-white/70">契合度评分 </span>
            <span className="text-white/40">&amp; </span>
            <span className="text-white/70">AI 修复引擎</span>
          </h1>
          <p className="text-white/60 font-body font-light text-sm md:text-base mt-5 leading-relaxed">
            拖动左侧品牌到右侧剧集 —— Echo 实时评分。低于 50 分直接拦截，50-69 可走「AI 强制改造」一键挽救，{'>='}70 进入正常流量池。
            <span className="text-white/85"> 不是优化广告，是选择哪些广告配被用户看见。</span>
          </p>
        </div>
        <GovernanceClient />
      </div>
    </main>
  );
}
