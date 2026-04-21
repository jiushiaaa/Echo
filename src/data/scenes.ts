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
  id: 'qingyunian' | 'santi' | 'fanhua';
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
  videoSrc?: string;              // 视频路径（如 Day 3 产出）
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
    videoSrc: '/ads/qingyunian-hero.mp4', // Day 3 产出，未产出则用 fallbackFrames
    duration: 7,
    brandName: '星骁 X3 Pro',
    brandCategory: '3C 手机',
    sellingPoint: '快充 · 30 秒充电 10 小时续航',
    fallbackFrames: [
      {
        bgGradient: 'linear-gradient(135deg, #1a120a 0%, #3f2e1a 100%)',
        headline: '这世上本无快慢',
        footline: '只是等不了的人太多',
      },
      {
        bgGradient: 'linear-gradient(135deg, #3f2e1a 0%, #caa45d 100%)',
        headline: '三十秒，续上十个时辰',
        footline: '比我当年跑过京都城还快',
      },
      {
        bgGradient: 'linear-gradient(135deg, #2a1a08 0%, #e8c987 100%)',
        headline: '星骁 X3 Pro · 快充系列',
        footline: '鉴查院 · 范闲推荐',
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

// ============================================================
// 场景 2：三体
// ============================================================
const SANTI: SceneDefinition = {
  id: 'santi',
  title: '三体',
  subtitle: '黑暗森林，文明对视',
  genre: '硬核科幻 · 宇宙悲悯',
  eraLabel: '当代地球',
  roleToneId: 'luoji',
  poster: {
    mainColor: '#3b82f6',
    accentColor: '#7aa7ff',
    bgGradient: 'linear-gradient(135deg, #04081a 0%, #0c1a2b 60%, #0e2647 100%)',
    motif: '三',
    pattern: 'radial-dots',
  },
  tagline: '黑暗森林 · 宇宙尺度 · 冷峻悲悯',
  signatureDialogue: '给岁月以文明，不给文明以岁月。',
  emotionCurve: [
    { t: 0,   tension: 0.24, label: '深夜独坐' },
    { t: 20,  tension: 0.35, label: '接到警告' },
    { t: 42,  tension: 0.68, label: '物理学不存在了' },
    { t: 66,  tension: 0.88, label: '坐标暴露' },
    { t: 88,  tension: 0.56, label: '冷静下来' },
    { t: 110, tension: 0.29, label: '望向星空' },
    { t: 130, tension: 0.25, label: '决心面壁' },
  ],
  duration: 150,
  tightMoment:   { t: 66, label: '坐标暴露 · 1:06 紧张峰值' },
  relaxedMoment: { t: 110, label: '望向星空 · 1:50 情绪谷底' },
  reusableAssets: ['黑暗森林法则', '智子', '面壁者', '光年', '三体文明警告'],
  heroAd: {
    kind: 'fallback-card',
    duration: 7,
    brandName: '星骁 X3 Pro',
    brandCategory: '3C 手机',
    sellingPoint: '快充 · 30 秒充电 10 小时续航',
    fallbackFrames: [
      {
        bgGradient: 'linear-gradient(135deg, #04081a 0%, #0c1a2b 100%)',
        headline: '黑暗森林里',
        footline: '每一个文明都在隐藏自己',
      },
      {
        bgGradient: 'linear-gradient(135deg, #0c1a2b 0%, #0e2647 100%)',
        headline: '电量是文明的底气',
        footline: '三十秒，一个夜晚的安全区',
      },
      {
        bgGradient: 'linear-gradient(135deg, #0e2647 0%, #3b82f6 100%)',
        headline: '星骁 X3 Pro · 续航系列',
        footline: '坐标可以隐藏 · 电量不必',
      },
    ],
  },
  narrativePack: {
    title: '罗辑独白 · 关于沉默',
    subtitle: '品牌定制 · 30 秒平行剧情',
    monologue:
      '在四光年之外，有人在倾听。人类所有的语言，最终都会被翻译成一个坐标。我们能做的，是选择什么时候沉默。沉默不是放弃，是对这个宇宙最大的尊重。有些东西必须留在身边——比如电量，比如警惕，比如不说出口的那句话。',
    voiceHint: '男声 · 低沉克制，语速偏慢，每句有停顿',
    unlockHint: '罗辑独白 · 关于沉默 (00:30)',
  },
  intrinsicFit: {
    '3C 手机':    0.82,
    '快销食品':   0.35,
    '奢侈品':    0.28,
    '汽车':      0.74,
    '母婴':      0.22,
    '游戏':      0.79,
    '文旅':      0.58,
    '教育':      0.72,
    '美妆':      0.24,
    '金融保险':  0.51,
  },
};

// ============================================================
// 场景 3：繁花
// ============================================================
const FANHUA: SceneDefinition = {
  id: 'fanhua',
  title: '繁花',
  subtitle: '黄河路上，做生意的腔调',
  genre: '年代商战 · 沪式腔调',
  eraLabel: '九十年代上海',
  roleToneId: 'baozong',
  poster: {
    mainColor: '#d4405a',
    accentColor: '#ff8aa0',
    bgGradient: 'linear-gradient(135deg, #1a0510 0%, #2b0e15 50%, #4a1320 100%)',
    motif: '花',
    pattern: 'neon-lines',
  },
  tagline: '沪语腔调 · 商海做派 · 霓虹夜色',
  signatureDialogue: '生意是这样——你看起来在谈价钱，其实在谈做人。',
  emotionCurve: [
    { t: 0,   tension: 0.35, label: '和平饭店' },
    { t: 24,  tension: 0.58, label: '谈判开场' },
    { t: 48,  tension: 0.82, label: '底牌翻出' },
    { t: 72,  tension: 0.9,  label: '僵持时刻' },
    { t: 90,  tension: 0.72, label: '敬酒让步' },
    { t: 112, tension: 0.41, label: '夜半独坐' },
    { t: 130, tension: 0.3,  label: '霓虹深处' },
  ],
  duration: 150,
  tightMoment:   { t: 72, label: '谈判僵持 · 1:12 紧张峰值' },
  relaxedMoment: { t: 112, label: '夜半独坐 · 1:52 情绪谷底' },
  reusableAssets: ['和平饭店', '黄河路霓虹', '西装内袋', '钢笔签字', '英文支票簿'],
  heroAd: {
    kind: 'fallback-card',
    duration: 7,
    brandName: '星骁 X3 Pro',
    brandCategory: '3C 手机',
    sellingPoint: '快充 · 30 秒充电 10 小时续航',
    fallbackFrames: [
      {
        bgGradient: 'linear-gradient(135deg, #1a0510 0%, #2b0e15 100%)',
        headline: '做生意讲究个',
        footline: '随时能接电话',
      },
      {
        bgGradient: 'linear-gradient(135deg, #2b0e15 0%, #4a1320 100%)',
        headline: '侬这手机没电',
        footline: '等于把面子关进抽屉',
      },
      {
        bgGradient: 'linear-gradient(135deg, #4a1320 0%, #d4405a 100%)',
        headline: '星骁 X3 Pro · 快充系列',
        footline: '三十秒 · 面子就回来',
      },
    ],
  },
  narrativePack: {
    title: '宝总独白 · 关于面子',
    subtitle: '品牌定制 · 30 秒平行剧情',
    monologue:
      '黄河路上的灯，每一盏都是人情。你今天请我一桌，不是吃饭，是在借我一个人情。生意场上，面子比里子更贵——里子你看不到，面子是别人看到的你。做人要讲究个留白，物件要讲究个妥帖。一只随时能用的手机，就是随时接住别人抛过来的面子。',
    voiceHint: '男声 · 克制温和，尾音带沪式语感，偶尔一声轻笑',
    unlockHint: '宝总独白 · 关于面子 (00:32)',
  },
  intrinsicFit: {
    '3C 手机':    0.74,
    '快销食品':   0.55,
    '奢侈品':    0.86,
    '汽车':      0.81,
    '母婴':      0.32,
    '游戏':      0.28,
    '文旅':      0.78,
    '教育':      0.38,
    '美妆':      0.72,
    '金融保险':  0.83,
  },
};

export const SCENES: SceneDefinition[] = [QINGYUNIAN, SANTI, FANHUA];

export function getScene(id: string) {
  return SCENES.find((s) => s.id === id);
}

/**
 * 硬广（改造前）文案池——刻意平庸、通用、硬塞
 */
export const HARD_AD = {
  brandName: '星骁 X3 Pro',
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
