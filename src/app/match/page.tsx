import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import MatchClient from './MatchClient';

export default function Page() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '品牌匹配' },
        ]}
      />
      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-16">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
              Brand Matching
            </span>
          </div>
          <h1
            className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
          >
            动态品牌匹配 · 广告库智能选品
          </h1>
          <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
            AI 从动态广告库中逐一评估候选品牌，基于品类契合度与风格标签匹配度，为当前剧集场景实时筛选最佳投放品牌。
          </p>
        </div>
        <MatchClient />
      </div>
    </main>
  );
}
