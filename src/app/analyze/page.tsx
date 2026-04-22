import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import AnalyzeClient from './AnalyzeClient';

export default function Page() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: 'AI 预分析' },
        ]}
      />
      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-16">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
              Scene Analysis
            </span>
          </div>
          <h1
            className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
          >
            AI 预分析 · 上下文感知
          </h1>
          <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
            平台拥有完整剧集内容，AI 可提前预分析每一帧的场景、物体、情绪曲线，找到最适合投放广告的时机窗口。
          </p>
        </div>
        <AnalyzeClient />
      </div>
    </main>
  );
}
