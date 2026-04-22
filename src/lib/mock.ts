/**
 * Echo · Mock 层
 * ============================================================
 * 当无 OPENAI_API_KEY 时自动启用。所有 LLM 调用会从本模块返回
 * 精心预写的降级响应，保证 Demo 在无网络/无密钥场景下仍可完整演示。
 *
 * 使用 Mock 时 UI 会显示"🛈 Mock Mode"提示，告知评委/用户当前状态。
 * ============================================================
 */

import { ROLE_TONES } from '@/data/prompts';
import { DANMAKU_PACKS } from '@/data/danmaku';
import { SCENES } from '@/data/scenes';

// ------------------------------------------------------------
// 腔调改写 Mock
// ------------------------------------------------------------

export function mockToneCopy(params: {
  roleId: string;
  brand: string;
  sellingPoint: string;
  emotionOverride?: string;
}) {
  const role = ROLE_TONES[params.roleId];
  if (!role) return `${params.brand}：${params.sellingPoint}`;

  // 尝试从 exemplars 取一个贴近的
  const bySelling = role.exemplars.find((e) => params.sellingPoint.includes('快充') || params.sellingPoint.includes('续航'));
  const sample = bySelling ?? role.exemplars[0];
  let text = sample.sample;

  // 情绪覆盖——简单替换温度
  if (params.emotionOverride === 'heartache') {
    const endings: Record<string, string> = {
      fanxian: '但有些等待，值得被好好兑现。',
    };
    text = text.replace(/[。！]$/, '。') + endings[params.roleId] ?? '';
  } else if (params.emotionOverride === 'catharsis') {
    const endings: Record<string, string> = {
      fanxian: '这一回，换我追风。',
    };
    text = text.replace(/[。！]$/, '。') + endings[params.roleId] ?? '';
  }

  return text;
}

// ------------------------------------------------------------
// 弹幕情绪聚合 Mock
// ------------------------------------------------------------

const NEGATIVE_LEXICON = [
  '烂', '差', '退', '弃剧', '注水', '降智', '浪费', '看不下',
  '无聊', '拖', '脑子', '退钱', '烦', '垃圾', '劝退', '眼疼',
  '强行', '降级', '亏', '骗', '智商', '演技是负', '别看',
];

const HEARTACHE_LEXICON = ['心疼', '哭', '难', '扎心', '好难', '破防', '懂了', '委屈', '抱抱', '封神'];
const CATHARSIS_LEXICON = ['爽', '解气', '打脸', '翻盘', '反杀', '燃', '过瘾', '舒坦', '格局', '牛', '漂亮'];
const CONTEMPLATION_LEXICON = ['宇宙', '文明', '光年', '孤独', '寂静', '寒冷', '震撼', '深渊', '沉默', '尺度'];

export type EmotionDominantKey = 'negative' | 'heartache' | 'catharsis' | 'contemplation';

export function mockEmotionAggregate(messages: string[]): {
  dominant: EmotionDominantKey;
  confidence: number;
  scores: Record<EmotionDominantKey, number>;
  keywords: string[];
  quotes: string[];
  sampleCount: number;
} {
  const concat = messages.join(' ');
  const countIn = (lex: string[]) => lex.reduce((sum, w) => sum + (concat.includes(w) ? 1 : 0), 0);

  const hits = {
    negative: countIn(NEGATIVE_LEXICON),
    heartache: countIn(HEARTACHE_LEXICON),
    catharsis: countIn(CATHARSIS_LEXICON),
    contemplation: countIn(CONTEMPLATION_LEXICON),
  };

  const total = hits.negative + hits.heartache + hits.catharsis + hits.contemplation || 1;
  const scores = {
    negative: hits.negative / total,
    heartache: hits.heartache / total,
    catharsis: hits.catharsis / total,
    contemplation: hits.contemplation / total,
  };

  let dominant: keyof typeof scores = 'heartache';
  let maxScore = 0;
  (Object.keys(scores) as Array<keyof typeof scores>).forEach((k) => {
    if (scores[k] > maxScore) {
      maxScore = scores[k];
      dominant = k;
    }
  });

  const confidence = Math.min(0.97, 0.55 + maxScore * 0.45);

  const keywordsPool: Record<string, string[]> = {
    negative: ['厌恶', '失望', '抱怨', '退订'],
    heartache: ['心疼', '共情', '柔软', '成长痛'],
    catharsis: ['爽感', '反杀', '解气', '燃点'],
    contemplation: ['哲思', '宇宙感', '冷峻', '震撼'],
  };

  // 从真实弹幕中抽 3 条作为"代表性引用"
  const quoteCandidates = messages.filter((m) =>
    (dominant === 'negative' ? NEGATIVE_LEXICON :
     dominant === 'heartache' ? HEARTACHE_LEXICON :
     dominant === 'catharsis' ? CATHARSIS_LEXICON :
     CONTEMPLATION_LEXICON).some((w) => m.includes(w))
  );
  const quotes = quoteCandidates.slice(0, 3);

  return {
    dominant,
    confidence: Number(confidence.toFixed(2)),
    scores: {
      negative: Number(scores.negative.toFixed(2)),
      heartache: Number(scores.heartache.toFixed(2)),
      catharsis: Number(scores.catharsis.toFixed(2)),
      contemplation: Number(scores.contemplation.toFixed(2)),
    },
    keywords: keywordsPool[dominant],
    quotes,
    sampleCount: messages.length,
  };
}

export type EmotionAggregate = ReturnType<typeof mockEmotionAggregate>;

// ------------------------------------------------------------
// 场景分析 Mock
// ------------------------------------------------------------

export function mockSceneAnalysis(sceneId: string) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return null;
  const role = ROLE_TONES[scene.roleToneId];
  return {
    genre: scene.genre,
    era: scene.eraLabel,
    emotion_curve: '紧张→释然',
    tone: role.displayName + ' · ' + role.era,
    tension_peak: Math.max(...scene.emotionCurve.map((p) => p.tension)),
    tension_end: scene.emotionCurve[scene.emotionCurve.length - 1].tension,
    relaxed_window_sec: scene.relaxedMoment.t,
    reusable_assets: scene.reusableAssets,
    signature_dialogue: scene.signatureDialogue,
  };
}

// ------------------------------------------------------------
// 契合度评分 Mock
// ------------------------------------------------------------

import type { BrandMaterial } from '@/data/brands';
import type { SceneDefinition } from '@/data/scenes';

export function mockFitnessScore(brand: BrandMaterial, scene: SceneDefinition) {
  const categoryFit = scene.intrinsicFit[brand.category] ?? 0.5;

  // 风格 tag 契合度：粗略根据剧集"标签库"打分
  const sceneStyleMap: Record<string, string[]> = {
    qingyunian: ['古装', '吐槽', '现代', '理性', '文化', '权谋', '成长'],
  };
  const sceneTags = sceneStyleMap[scene.id] ?? [];
  let styleHit = 0;
  brand.styleTags.forEach((t) => {
    if (sceneTags.some((st) => st.includes(t) || t.includes(st))) styleHit += 1;
  });
  const styleFit = brand.styleTags.length ? styleHit / brand.styleTags.length : 0.3;

  const score = Math.round(100 * (0.62 * categoryFit + 0.38 * styleFit));

  let verdict: 'approved' | 'refactor' | 'rejected';
  if (score >= 70) verdict = 'approved';
  else if (score >= 50) verdict = 'refactor';
  else verdict = 'rejected';

  const reasons: string[] = [];
  reasons.push(`品类契合度：${(categoryFit * 100).toFixed(0)}/100`);
  reasons.push(`风格契合度：${(styleFit * 100).toFixed(0)}/100`);
  if (verdict === 'rejected') {
    reasons.push(`触发拒绝条件：<${50}`);
    reasons.push(`建议：走「AI 强制改造引擎」尝试挽救`);
  } else if (verdict === 'refactor') {
    reasons.push('处于灰色区间：需强制 AI 二次剧情化改造');
  } else {
    reasons.push('达标，进入正常流量池');
  }

  return { score, verdict, reasons, categoryFit, styleFit };
}

// ------------------------------------------------------------
// AI 修复（改造引擎）Mock
// ------------------------------------------------------------

export function mockRepair(params: {
  brand: BrandMaterial;
  scene: SceneDefinition;
  originalScore: number;
}) {
  const role = ROLE_TONES[params.scene.roleToneId];

  // 根据剧集 + 品牌生成"软化后"的改造文案
  const REPAIR_COPIES: Record<string, string> = {
    'qingyunian-vermeer':
      '世上讲究"合身"——玉佩合人，衣袖合袖。Vermeer 之作，不过是一件真正合你的物件。',
    'qingyunian-glowup':
      '京都的晨光，照见的不过是一张真实的脸。GlowUp 不添墨，只让光按它该来的样子来。',
  };

  const key = `${params.scene.id}-${params.brand.id}`;
  const fallbackCopy =
    `【${role.displayName}·软化版】原素材过于张扬——改为"${params.scene.genre}语境下的"${params.brand.category}"视角"。`;
  const copy = REPAIR_COPIES[key] ?? fallbackCopy;

  // 改造后评分：加一个 25-45 的增量，但封顶 85
  const bonus = 28 + Math.floor(Math.random() * 16);
  const newScore = Math.min(85, params.originalScore + bonus);
  const verdict = newScore >= 70 ? 'approved' : 'refactor-again';

  return {
    repairedCopy: copy,
    newScore,
    verdict,
    deltaScore: newScore - params.originalScore,
    strategy: [
      '提取剧集的"精神母题"（而非表层腔调）',
      '将品牌卖点嫁接到母题上，避免生硬贴合',
      '保留品牌识别度但弱化直白推销',
    ],
  };
}
