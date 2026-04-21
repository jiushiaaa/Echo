import { notFound } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import { SCENES, getScene } from '@/data/scenes';
import MirrorClient from './MirrorClient';

export function generateStaticParams() {
  return SCENES.map((s) => ({ sceneId: s.id }));
}

export default function Page({ params }: { params: { sceneId: string } }) {
  const scene = getScene(params.sceneId);
  if (!scene) notFound();
  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '情绪镜像', href: '/mirror/qingyunian' },
          { label: scene.title },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-6 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-[11px] text-muted font-mono tracking-wider mb-1 uppercase">Screen · 03</div>
            <h1 className="text-2xl font-semibold">情绪镜像 · 真交互（非脚本）</h1>
            <p className="text-muted text-sm mt-1">
              随意往输入框里打字 —— AI 实时聚合弹幕情绪，广告色调、节奏、文案跟着变。输入厌恶情绪将触发全屏情绪熔断。
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            {SCENES.map((s) => (
              <Link
                key={s.id}
                href={`/mirror/${s.id}`}
                className={'chip ' + (s.id === scene.id ? 'chip-echo' : '')}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
        <MirrorClient scene={scene} />
      </div>
    </main>
  );
}
