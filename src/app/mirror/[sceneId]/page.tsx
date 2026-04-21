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
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
                Emotion Mirror
              </span>
              <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
                Screen · 03
              </span>
            </div>
            <h1
              className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
            >
              情绪镜像 · <span className="text-white/70">真交互</span>
              <span className="text-white/30">（非脚本）</span>
            </h1>
            <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
              随意往输入框里打字 —— AI 实时聚合弹幕情绪，广告色调、节奏、文案跟着变。负向情绪将触发全屏熔断。
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
