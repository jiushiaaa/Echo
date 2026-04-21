'use client';

import { useEffect, useRef, useState } from 'react';
import type { SceneDefinition } from '@/data/scenes';
import { cn } from '@/lib/utils';

/**
 * 叙事延展包解锁面板
 *   广告播完后触发。用户感受是"多得到一个东西"；商业上是品牌方付费购买的增值内容。
 *   UI 展示独白文本（以"字幕"形式逐段揭示），并提供 TTS 播放按钮（当浏览器支持时）。
 */
export default function NarrativePackUnlock({
  scene,
  show,
  onClose,
}: {
  scene: SceneDefinition;
  show: boolean;
  onClose?: () => void;
}) {
  const [revealIdx, setRevealIdx] = useState(0);
  const [ttsOn, setTtsOn] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentences = splitSentences(scene.narrativePack.monologue);

  useEffect(() => {
    if (!show) return;
    setRevealIdx(0);
    const totalMs = 18000;
    const perMs = totalMs / sentences.length;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setRevealIdx(i);
      if (i >= sentences.length) clearInterval(interval);
    }, perMs);
    return () => clearInterval(interval);
  }, [show, sentences.length]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!show) return null;

  const handleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (ttsOn) {
      window.speechSynthesis.cancel();
      setTtsOn(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(scene.narrativePack.monologue);
    utter.lang = 'zh-CN';
    utter.rate = 0.92;
    utter.pitch = 0.96;
    utter.onend = () => setTtsOn(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setTtsOn(true);
  };

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center p-6 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.78)' }}
    >
      <div
        className="relative max-w-2xl w-full bordered-card-hi overflow-hidden animate-slide-up"
        style={{ background: scene.poster.bgGradient }}
      >
        {/* 顶部意象字 */}
        <div
          className="absolute inset-0 flex items-center justify-center font-serif select-none pointer-events-none"
          style={{
            fontSize: 360,
            color: scene.poster.mainColor,
            opacity: 0.14,
            lineHeight: 1,
          }}
        >
          {scene.poster.motif}
        </div>

        <div className="relative p-7 md:p-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg grid place-items-center"
                style={{ background: scene.poster.mainColor + '33', color: scene.poster.accentColor }}
              >
                <KeyIcon />
              </div>
              <div>
                <div className="text-[11px] text-white/70 font-mono tracking-widest">
                  NARRATIVE EXTENSION PACK · 已解锁
                </div>
                <div className="text-lg font-semibold mt-0.5" style={{ color: scene.poster.accentColor }}>
                  🔑 {scene.narrativePack.unlockHint}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
              关闭 ✕
            </button>
          </div>

          <div className="font-serif font-semibold text-white mb-1" style={{ fontSize: 22 }}>
            {scene.narrativePack.title}
          </div>
          <div className="text-xs text-white/60 mb-5">{scene.narrativePack.subtitle}</div>

          {/* 独白内容（字幕式渐显） */}
          <div className="space-y-2.5 min-h-[180px]">
            {sentences.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'font-serif leading-relaxed transition-all duration-500',
                  i < revealIdx ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-1'
                )}
                style={{
                  color: i < revealIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontSize: 18,
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-white/60">
              TTS 风格：<span className="text-white/80">{scene.narrativePack.voiceHint}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost text-xs" onClick={handleTTS}>
                {ttsOn ? '■ 停止朗读' : '▶ 浏览器 TTS 试听'}
              </button>
              <button className="btn btn-primary text-xs" onClick={onClose}>
                回到观看
              </button>
            </div>
          </div>

          {/* 商业模型提示 */}
          <div className="mt-5 glass rounded-lg p-3 text-[11px] text-white/70 leading-relaxed">
            <div className="text-white/90 font-medium mb-1">📦 商业模型：叙事延展包（品牌方付费）</div>
            用户体感"多得到一个东西"，实则由品牌方出资购买增值叙事。平台抽成 30% / IP 方分成 10% / 品牌获得专属二次传播素材。
            <span className="text-white/50"> —— 不是平台让利，是品牌方定制。</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function splitSentences(text: string) {
  return text
    .split(/([。！？；])/g)
    .reduce<string[]>((arr, piece) => {
      if (!piece) return arr;
      if ('。！？；'.includes(piece)) {
        if (arr.length === 0) return arr;
        arr[arr.length - 1] = arr[arr.length - 1] + piece;
        return arr;
      }
      arr.push(piece);
      return arr;
    }, [])
    .filter((s) => s.trim().length > 0);
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="currentColor"
        d="M12.65 10A5.99 5.99 0 0 0 7 6a6 6 0 1 0 5.65 8H16v3h3v-3h3V10H12.65zM7 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
      />
    </svg>
  );
}
