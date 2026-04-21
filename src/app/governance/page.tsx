import TopNav from '@/components/TopNav';
import GovernanceClient from './GovernanceClient';

export default function Page() {
  return (
    <main className="min-h-screen pt-20">
      <TopNav />
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="text-xs text-muted font-mono tracking-wider mb-1">SCREEN · 04</div>
          <h1 className="text-2xl font-semibold">品味守门人 · 契合度评分 & AI 修复引擎</h1>
          <p className="text-muted text-sm mt-1 max-w-3xl">
            拖动左侧品牌到右侧剧集 —— Echo 实时评分。低于 50 分直接拦截，50-69 可走"AI 强制改造"一键挽救，{'>='}70 进入正常流量池。
            <span className="text-white/85">不是优化广告，是选择哪些广告配被用户看见。</span>
          </p>
        </div>
        <GovernanceClient />
      </div>
    </main>
  );
}
