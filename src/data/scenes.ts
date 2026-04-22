/**
 * Echo · 剧集场景数据
 * ============================================================
 * 由于版权合规，Demo 不直接使用真实剧集视频/画面。
 * 本文件定义三部剧的"视觉占位规范"：颜色、关键词、代表对白、
 * 情绪曲线、可复用虚拟资产、叙事延展包独白脚本。
 *
 * 视频占位（video stub）说明：
 *   - 使用 CSS/Canvas 合成风格化画面（颜色+文字+粒子）
 *   - 不侵犯任何 IP 方版权
 *   - Demo 演示重点在 AI 决策逻辑，不依赖真实片源
 * ============================================================
 */

import { ROLE_TONES } from './prompts';

export type EmotionCurvePoint = {
  t: number;      // 时间（秒）
  tension: number; // 张力值 0-1
  label?: string;
};

export type SceneDefinition = {
  id: 'qingyunian';
  title: string;
  subtitle: string;
  genre: string;
  eraLabel: string;
  roleToneId: keyof typeof ROLE_TONES;
  poster: {
    mainColor: string;      // 主色
    accentColor: string;    // 辅色
    bgGradient: string;     // CSS 渐变
    motif: string;          // 主视觉意象（一个字或短语）
    pattern: 'vertical-lines' | 'radial-dots' | 'neon-lines'; // 背景纹理
  };
  tagline: string;          // 剧集特质标签
  signatureDialogue: string;// 代表对白（非真实台词，风格化致敬）
  emotionCurve: EmotionCurvePoint[];
  duration: number;         // 片段总时长（秒）
  tightMoment: { t: number; label: string };       // 改造前·强插广告的紧张时刻
  relaxedMoment: { t: number; label: string };     // 改造后·插广告的舒缓时刻
  reusableAssets: string[]; // 可复用虚拟资产
  heroAd: HeroAdAsset;
  narrativePack: NarrativePack;
  intrinsicFit: {           // 此剧集对不同品类品牌的"内在契合度"
    [brandCategory: string]: number;
  };
};

export type HeroAdAsset = {
  kind: 'video' | 'fallback-card';
  videoSrc?: string;              // Echo 原生广告视频路径
  realAdSrc?: string;             // 真实硬广视频路径（左屏用）
  fallbackFrames: Array<{
    bgGradient: string;
    headline: string;
    footline?: string;
  }>;
  duration: number;
  brandName: string;
  brandCategory: string;
  sellingPoint: string;
};

export type NarrativePack = {
  title: string;
  subtitle: string;
  monologue: string;        // 30s TTS 独白脚本
  voiceHint: string;        // TTS 语音风格提示
  unlockHint: string;       // "🔑 已解锁：xxx" 展示
};

// ============================================================
// 场景 1：庆余年 2
// ============================================================
const QINGYUNIAN: SceneDefinition = {
  id: 'qingyunian',
  title: '庆余年 2',
  subtitle: '范闲回京，朝堂风起',
  genre: '古装权谋 · 现代灵魂',
  eraLabel: '架空古装',
  roleToneId: 'fanxian',
  poster: {
    mainColor: '#caa45d',
    accentColor: '#e8c987',
    bgGradient: 'linear-gradient(135deg, #1a120a 0%, #3f2e1a 60%, #5c4220 100%)',
    motif: '余',
    pattern: 'vertical-lines',
  },
  tagline: '半文半白 · 吐槽反转 · 京都朝堂',
  signatureDialogue: '这世上规矩是死的，但人是活的。活法，才是答案。',
  emotionCurve: [
    { t: 0,   tension: 0.32, label: '回京路上' },
    { t: 18,  tension: 0.48, label: '街市偶遇' },
    { t: 36,  tension: 0.71, label: '朝堂风向' },
    { t: 58,  tension: 0.84, label: '暗流涌现' },
    { t: 78,  tension: 0.62, label: '范闲自嘲' },
    { t: 102, tension: 0.31, label: '回府独白' },
    { t: 120, tension: 0.28, label: '夜深独坐' },
  ],
  duration: 150,
  tightMoment:   { t: 58, label: '朝堂暗流 · 0:58 紧张峰值' },
  relaxedMoment: { t: 102, label: '回府独白 · 1:42 情绪谷底' },
  reusableAssets: ['范闲独白', '鉴查院腰牌', '京都城门', '庆帝的冷笑', '监察使令牌'],
  heroAd: {
    kind: 'video',
    videoSrc: '/ads/qingyunian-hero.mp4',
    realAdSrc: '/ads/qingyunian.mp4',     // 真实硬广：飞鹤卓睿奶粉
    duration: 30,
    brandName: '飞鹤卓睿',
    brandCategory: '母婴',
    sellingPoint: '0-36月专研配方 · 卓睿系列婴幼儿奶粉',
    fallbackFrames: [
      {
        bgGradient: 'linear-gradient(135deg, #1a120a 0%, #3f2e1a 100%)',
        headline: '飞鹤卓睿',
        footline: '专为中国宝宝研制',
      },
      {
        bgGradient: 'linear-gradient(135deg, #3f2e1a 0%, #caa45d 100%)',
        headline: '0-36月黄金营养方案',
        footline: '卓睿三段 · 科学喂养',
      },
    ],
  },
  narrativePack: {
    title: '范闲独白 · 关于承诺',
    subtitle: '品牌定制 · 30 秒平行剧情',
    monologue:
      '京都的灯，一盏盏都是人情。答应过的事，就得扛到底。这道理我懂得晚，可也不算太晚。人活一世，总要有几样东西——腰间的牌，手里的物件，心里的话。它们会替你说，会替你记。该给出去的，给出去；该留下的，就留一辈子。',
    voiceHint: '男声 · 慵懒带三分讽刺，尾音略扬',
    unlockHint: '范闲独白 · 关于承诺 (00:28)',
  },
  intrinsicFit: {
    '3C 手机':    0.86,
    '快销食品':   0.62,
    '奢侈品':    0.41,
    '汽车':      0.58,
    '母婴':      0.33,
    '游戏':      0.72,
    '文旅':      0.78,
    '教育':      0.55,
    '美妆':      0.46,
    '金融保险':  0.48,
  },
};

export const SCENES: SceneDefinition[] = [QINGYUNIAN];

export function getScene(id: string) {
  return SCENES.find((s) => s.id === id);
}

/**
 * 硬广（改造前）文案池——刻意平庸、通用、硬塞
 */
export const MISMATCH_AD = {
  brandName: '护舒宝',
  videoSrc: '/ads/fanhua.mp4',
  duration: 30,
  brandCategory: '个护',
  sellingPoint: '液体卫生巾 · 零感护理',
};

export const HARD_AD = {
  brandName: '星骁 X3 Pro',
  videoSrc: '/ads/hard-ad.mp4',
  duration: 15,
  frames: [
    {
      bgGradient: 'linear-gradient(135deg, #111111 0%, #1f1f1f 100%)',
      headline: '星骁 X3 Pro',
      footline: '超快闪充 · 超长续航',
    },
    {
      bgGradient: 'linear-gradient(135deg, #1f1f1f 0%, #c8102e 100%)',
      headline: '充电 30 秒，畅享 10 小时',
      footline: '全新旗舰，全面上市',
    },
    {
      bgGradient: 'linear-gradient(135deg, #c8102e 0%, #ff3860 100%)',
      headline: '星骁 X3 Pro',
      footline: '等你一句"我选它"',
    },
  ],
};
