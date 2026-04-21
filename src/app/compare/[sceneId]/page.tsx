import { notFound } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { SCENES, getScene } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';
import CompareClient from './CompareClient';
import Link from 'next/link';
import ScenePoster from '@/components/ScenePoster';

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
    <main className="min-h-screen pt-20">
      <TopNav />
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted font-mono tracking-wider mb-1">SCREEN · 02</div>
            <h1 className="text-2xl font-semibold">核心对比 · {scene.title}</h1>
            <p className="text-muted text-sm mt-1">
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
        <section className="mt-10 bordered-card p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted font-mono tracking-wider mb-1">TONE CONTRAST</div>
              <h3 className="text-lg font-semibold">同一个卖点 · 三种腔调</h3>
              <p className="text-xs text-muted mt-1">
                品牌 <span className="text-white">星骁 X3 Pro · 快充 30 秒续航 10 小时</span> 在三部剧中的原生化改写对比。
              </p>
            </div>
            <span className="chip chip-accent">风格迁移是 LLM 独有能力</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SCENES.map((s) => {
              const r = ROLE_TONES[s.roleToneId];
              const copy = r.exemplars[0].sample;
              const active = s.id === scene.id;
              return (
                <div
                  key={s.id}
                  className={
                    'rounded-xl p-4 border ' +
                    (active
                      ? 'border-echo/50 bg-echo/5'
                      : 'border-white/8 bg-white/2')
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="badge-ip"
                      style={{
                        background: s.poster.mainColor + '22',
                        color: s.poster.accentColor,
                      }}
                    >
                      {r.displayName}
                    </span>
                    <span className="text-[10px] text-muted">{s.title}</span>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-white/90 min-h-[80px]">
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
