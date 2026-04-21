import { notFound } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import { SCENES, getScene } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';
import CompareClient from './CompareClient';
import Link from 'next/link';

export function generateStaticParams() {
  return SCENES.map((s) => ({ sceneId: s.id }));
}

export default function Page({ params }: { params: { sceneId: string } }) {
  const scene = getScene(params.sceneId);
  if (!scene) notFound();
  const role = ROLE_TONES[scene.roleToneId];
  const analysis = {
    genre: scene.genre,
    tone: role.displayName,
    tension_peak: Math.max(...scene.emotionCurve.map((p) => p.tension)),
    tension_end: scene.emotionCurve[scene.emotionCurve.length - 1].tension,
    relaxed_window_sec: scene.relaxedMoment.t,
    reusable_assets: scene.reusableAssets,
    signature_dialogue: scene.signatureDialogue,
  };

  return (
    <main className="min-h-screen">
      <TopNav />
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '核心对比', href: '/compare/qingyunian' },
          { label: scene.title },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
                Core Comparison
              </span>
              <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
                Screen · 02
              </span>
            </div>
            <h1
              className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
            >
              核心对比 · <span className="text-white/70">{scene.title}</span>
            </h1>
            <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
              左屏是现状（硬广强插），右屏是 Echo（在情绪谷底自然过渡 + 腔调原生化）。观察底部的 AI 决策流。
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            {SCENES.map((s) => (
              <Link
                key={s.id}
                href={`/compare/${s.id}`}
                className={
                  'chip ' +
                  (s.id === scene.id ? 'chip-echo' : '')
                }
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>

        <CompareClient scene={scene} analysis={analysis} />

        {/* 腔调反差展示 */}
        <section className="mt-12 liquid-glass rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
                Tone Contrast
              </span>
              <h3 className="editorial-italic text-3xl md:text-4xl mt-4 text-white leading-[1.05]">
                同一个卖点 · 三种腔调
              </h3>
              <p className="text-[13px] text-white/60 font-light mt-3">
                品牌 <span className="text-white">星骁 X3 Pro · 快充 30 秒续航 10 小时</span> 在三部剧中的原生化改写对比。
              </p>
            </div>
            <span className="chip chip-accent">风格迁移 · LLM 独有能力</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENES.map((s) => {
              const r = ROLE_TONES[s.roleToneId];
              const copy = r.exemplars[0].sample;
              const active = s.id === scene.id;
              return (
                <div
                  key={s.id}
                  className={
                    active
                      ? 'liquid-glass-strong rounded-2xl p-5'
                      : 'liquid-glass rounded-2xl p-5'
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="badge-ip"
                      style={{
                        borderColor: s.poster.accentColor + '66',
                        color: s.poster.accentColor,
                      }}
                    >
                      {r.displayName}
                    </span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                      {s.title}
                    </span>
                  </div>
                  <p className="editorial-italic text-[17px] leading-relaxed text-white/90 min-h-[90px]">
                    「{copy}」
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
