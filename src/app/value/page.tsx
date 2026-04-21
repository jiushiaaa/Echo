import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import ValueClient from './ValueClient';

export default function Page() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '三方价值' },
        ]}
      />
      <div className="max-w-[1280px] mx-auto px-6 pt-6 pb-6">
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
              Three-Way Value
            </span>
            <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
              Screen · 05
            </span>
          </div>
          <h1
            className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
          >
            三方价值 ·<br />
            <span className="text-white/70">CPM 公式</span>
            <span className="text-white/40"> & </span>
            <span className="text-white/70">冲突 Q&amp;A</span>
          </h1>
          <p className="text-white/60 font-body font-light text-sm md:text-base mt-5 leading-relaxed">
            把「三方共赢」从口号转化为可推导的定价权。把「冲突如何决策」从空话转化为公开的产品原则。
          </p>
        </div>
        <ValueClient />
      </div>
    </main>
  );
}
