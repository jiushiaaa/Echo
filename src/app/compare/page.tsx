import TopNav from '@/components/TopNav';
import Breadcrumb from '@/components/Breadcrumb';
import { SCENES } from '@/data/scenes';
import { ROLE_TONES } from '@/data/prompts';
import CompareClient from './CompareClient';

export default function Page() {
  const scene = SCENES[0];
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
          { label: '对比演示' },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-6">
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] text-white/85 tracking-wider uppercase">
              Core Comparison
            </span>
          </div>
          <h1
            className="editorial-italic text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(34px, 4.6vw, 60px)' }}
          >
            传统投放 vs Echo 投放
          </h1>
          <p className="text-white/60 font-body font-light text-sm md:text-base mt-4 leading-relaxed">
            左屏：传统投放——高潮处硬切不相关品牌，无过渡。右屏：Echo 投放——情绪谷底切入匹配品牌，AI 生成过渡语与回归语。
          </p>
        </div>

        <CompareClient scene={scene} analysis={analysis} />
      </div>
    </main>
  );
}
