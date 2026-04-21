import TopNav from '@/components/TopNav';
import ValueClient from './ValueClient';

export default function Page() {
  return (
    <main className="min-h-screen pt-20">
      <TopNav />
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="text-xs text-muted font-mono tracking-wider mb-1">SCREEN · 05</div>
          <h1 className="text-2xl font-semibold">三方价值 · CPM 公式 · 冲突 Q&A</h1>
          <p className="text-muted text-sm mt-1 max-w-3xl">
            把"三方共赢"从口号转化为可推导的定价权。把"冲突如何决策"从空话转化为公开的产品原则。
          </p>
        </div>
        <ValueClient />
      </div>
    </main>
  );
}
