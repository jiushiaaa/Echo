/**
 * Echo · 统一业务入口层
 * ============================================================
 * 对外提供"AI 能力 API"；对内根据环境变量在"真实 LLM"和"Mock"之间路由。
 * UI 组件不直接接触 LLM / Mock 任何一方，只调用本层。
 * ============================================================
 */

import { ROLE_TONES, buildToneUserPrompt, TRANSITION_PROMPT, RETURN_PROMPT } from '@/data/prompts';
import type { BrandMaterial } from '@/data/brands';
import type { SceneDefinition } from '@/data/scenes';
import { llmCall, llmStream, llmVisionCall, llmVideoCall, llmMultiFrameCall, mockTextStream, getLLMStatus } from './llm';
import { rankBrandsByEmbedding, cosineSimilarity, embedBrand, embedScene } from './embedding';
import {
  mockToneCopy,
  mockEmotionAggregate,
  mockSceneAnalysis,
  mockFitnessScore,
  mockRepair,
  mockVisionAnalysis,
  type EmotionAggregate,
} from './mock';

export { getLLMStatus };
export type { EmotionAggregate };

// ------------------------------------------------------------
// 1. 腔调改写（流式）— 支持 transition / return / ad-copy 三种模式
// ------------------------------------------------------------

export async function generateToneCopyStream(params: {
  roleId: string;
  brand: string;
  sellingPoint: string;
  sceneContext?: string;
  emotionOverride?: string;
  mode?: 'ad-copy' | 'transition' | 'return';
}): Promise<ReadableStream<Uint8Array>> {
  const role = ROLE_TONES[params.roleId];
  if (!role) throw new Error(`Unknown role: ${params.roleId}`);

  const mode = params.mode ?? 'ad-copy';
  const status = getLLMStatus();

  if (status.mock) {
    const copy = mockToneCopy({
      roleId: params.roleId,
      brand: params.brand,
      sellingPoint: params.sellingPoint,
      emotionOverride: params.emotionOverride,
    });
    return mockTextStream(copy, 32);
  }

  let systemPrompt: string;
  if (mode === 'transition') {
    systemPrompt = TRANSITION_PROMPT.replace('{{roleName}}', role.displayName).replace('{{era}}', role.era);
  } else if (mode === 'return') {
    systemPrompt = RETURN_PROMPT.replace('{{roleName}}', role.displayName).replace('{{era}}', role.era);
  } else {
    systemPrompt = role.systemPrompt;
  }

  const userPrompt = buildToneUserPrompt(params);

  return llmStream({
    systemPrompt,
    userPrompt,
    temperature: 0.9,
    maxTokens: 180,
  });
}

// ------------------------------------------------------------
// 2. 弹幕情绪聚合
// ------------------------------------------------------------

export async function aggregateEmotion(messages: string[]): Promise<EmotionAggregate> {
  const status = getLLMStatus();
  if (status.mock || messages.length === 0) {
    return mockEmotionAggregate(messages);
  }

  const systemPrompt = `你是一个实时弹幕情绪分析器。输入一段弹幕文本列表，严格输出 JSON，包含以下字段：
{
  "dominant": "negative" | "heartache" | "catharsis" | "contemplation",
  "confidence": 0~1,
  "scores": { "negative": 0-1, "heartache": 0-1, "catharsis": 0-1, "contemplation": 0-1 },
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "quotes": ["具代表性的 1-3 条原始弹幕"],
  "sampleCount": number
}
只输出 JSON，不要其他文字。`;

  const userPrompt = `弹幕列表：\n${messages.map((m) => `- ${m}`).join('\n')}`;

  try {
    const raw = await llmCall({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 400,
    });
    const json = JSON.parse(stripJsonFence(raw));
    return {
      ...json,
      sampleCount: messages.length,
    };
  } catch {
    return mockEmotionAggregate(messages);
  }
}

// ------------------------------------------------------------
// 3. 场景分析（视觉模型 / Mock 双模式）
// ------------------------------------------------------------

export function analyzeScene(sceneId: string) {
  return mockSceneAnalysis(sceneId);
}

export async function analyzeSceneVision(imageBase64: string) {
  const status = getLLMStatus();
  if (status.mock) {
    return mockVisionAnalysis();
  }

  const systemPrompt = `你是腾讯视频的 AI 场景分析引擎。给定一帧视频截图，你需要输出以下 JSON：
{
  "sceneType": "场景类型（如：古装权谋/都市情感/科幻悬疑等）",
  "objects": ["检测到的关键物体/角色列表"],
  "emotionTone": "当前帧的情绪基调（如：紧张/温馨/悲伤/激昂等）",
  "recommendedCategory": ["推荐的广告品类（1-3个）"],
  "insertTiming": "建议（此刻/稍后/不建议）",
  "confidence": 0.0-1.0,
  "reasoning": "分析理由（1-2句话）"
}
只输出 JSON，不要其他文字。`;

  try {
    const raw = await llmVisionCall({
      systemPrompt,
      userPrompt: '请分析这一帧视频截图的场景信息，用于智能广告投放决策。',
      imageBase64,
      temperature: 0.3,
      maxTokens: 600,
    });
    return JSON.parse(stripJsonFence(raw));
  } catch {
    return mockVisionAnalysis();
  }
}

/**
 * 视频 URL 分析：GLM-5V-Turbo 直接理解视频内容，输出场景+情绪+广告位推荐
 */
export async function analyzeVideoUrl(videoUrl: string) {
  const status = getLLMStatus();
  if (status.mock) {
    return mockVisionAnalysis();
  }

  const systemPrompt = `你是腾讯视频的 AI 视频场景分析引擎。给定一段视频，你需要分析其内容并输出以下 JSON：
{
  "sceneType": "场景类型（如：古装权谋/都市情感/科幻悬疑等）",
  "objects": ["检测到的关键物体/角色/场景元素列表，5-8个"],
  "emotionTone": "视频整体情绪基调变化（如：紧张→释然→温馨）",
  "emotionCurve": [
    {"t": 0, "tension": 0.3, "label": "开场"},
    {"t": 10, "tension": 0.6, "label": "冲突"},
    ...最多8个时间点
  ],
  "recommendedCategory": ["推荐的广告品类（1-3个）"],
  "adWindows": [
    {"startSec": 秒数, "endSec": 秒数, "reason": "为什么这个时间段适合插入广告"}
  ],
  "insertTiming": "最佳插入时机描述",
  "confidence": 0.0-1.0,
  "reasoning": "分析理由（2-3句话）"
}
只输出 JSON，不要其他文字。`;

  try {
    const raw = await llmVideoCall({
      systemPrompt,
      userPrompt: '请深度分析这段视频的场景、情绪变化和最佳广告插入时机，用于智能广告编排决策。',
      videoUrl,
      temperature: 0.3,
      maxTokens: 1200,
    });
    return JSON.parse(stripJsonFence(raw));
  } catch {
    return mockVisionAnalysis();
  }
}

/**
 * 本地视频 base64 分析：
 * 策略 1：尝试用 data URI 直接传给视觉模型（GLM-5V-Turbo 可能支持）
 * 策略 2：如果策略 1 失败，将 base64 视频中提取的关键帧图片传给视觉模型做多帧分析
 */
export async function analyzeVideoBase64(videoBase64: string, keyFrames?: string[]) {
  const status = getLLMStatus();
  if (status.mock) {
    return { ...mockVisionAnalysis(), _method: 'mock' };
  }

  const systemPrompt = `你是腾讯视频的 AI 视频场景分析引擎。给定一段视频或视频关键帧，你需要分析其内容并输出以下 JSON：
{
  "sceneType": "场景类型（如：古装权谋/都市情感/科幻悬疑等）",
  "objects": ["检测到的关键物体/角色/场景元素列表，5-8个"],
  "emotionTone": "视频整体情绪基调变化（如：紧张→释然→温馨）",
  "emotionCurve": [
    {"t": 0, "tension": 0.3, "label": "开场"},
    {"t": 10, "tension": 0.6, "label": "冲突"}
  ],
  "recommendedCategory": ["推荐的广告品类（1-3个）"],
  "adWindows": [
    {"startSec": 秒数, "endSec": 秒数, "reason": "为什么这个时间段适合插入广告"}
  ],
  "insertTiming": "最佳插入时机描述",
  "confidence": 0.0-1.0,
  "reasoning": "分析理由（2-3句话）"
}
只输出 JSON，不要其他文字。`;

  const userPrompt = '请深度分析这段视频的场景、情绪变化和最佳广告插入时机，用于智能广告编排决策。';

  // 策略 1：尝试 data URI 直接传视频
  try {
    const dataUri = videoBase64.startsWith('data:')
      ? videoBase64
      : `data:video/mp4;base64,${videoBase64}`;

    const raw = await llmVideoCall({
      systemPrompt,
      userPrompt,
      videoUrl: dataUri,
      temperature: 0.3,
      maxTokens: 1200,
    });
    return { ...JSON.parse(stripJsonFence(raw)), _method: 'video-base64' };
  } catch {
    // 策略 1 失败，尝试策略 2
  }

  // 策略 2：多关键帧图片分析
  if (keyFrames && keyFrames.length > 0) {
    try {
      const raw = await llmMultiFrameCall({
        systemPrompt: systemPrompt.replace('给定一段视频或视频关键帧', '给定一组视频关键帧截图（按时间顺序排列）'),
        userPrompt: `这是视频中提取的 ${keyFrames.length} 张关键帧截图（按时间顺序），请综合分析视频内容。`,
        framesBase64: keyFrames,
        temperature: 0.3,
        maxTokens: 1200,
      });
      return { ...JSON.parse(stripJsonFence(raw)), _method: 'multi-frame' };
    } catch {
      // 策略 2 也失败
    }
  }

  // 所有策略失败，降级为 mock
  return { ...mockVisionAnalysis(), _method: 'fallback' };
}

// ------------------------------------------------------------
// 4. 契合度评分 — 向量召回 + LLM 重排混合链路
// ------------------------------------------------------------

export async function scoreFitness(brand: BrandMaterial, scene: SceneDefinition) {
  const status = getLLMStatus();
  if (status.mock) {
    return mockFitnessScore(brand, scene);
  }

  try {
    const [brandVec, sceneVec] = await Promise.all([
      embedBrand(brand),
      embedScene(scene),
    ]);
    const semanticSim = cosineSimilarity(brandVec, sceneVec);
    const categoryFit = scene.intrinsicFit[brand.category] ?? 0.5;

    let llmScore = 0.5;
    let llmReason = '';
    try {
      const raw = await llmCall({
        systemPrompt: `你是广告-剧集契合度评估专家。给定一个品牌和一部剧集的信息，评估它们的匹配程度。
输出严格 JSON：{ "score": 0.0-1.0, "reason": "一句话理由" }
只输出 JSON。`,
        userPrompt: `品牌：${brand.name}（${brand.category}）
风格标签：${brand.styleTags.join('、')}
广告文案：${brand.rawCopy}

剧集：${scene.title}
类型：${scene.genre}
精神母题：${scene.signatureDialogue}
可复用资产：${scene.reusableAssets.join('、')}

请评估匹配度。`,
        temperature: 0.2,
        maxTokens: 200,
      });
      const parsed = JSON.parse(stripJsonFence(raw));
      llmScore = parsed.score ?? 0.5;
      llmReason = parsed.reason ?? '';
    } catch {
      llmScore = 0.5;
    }

    const finalScore = Math.round(100 * (semanticSim * 0.5 + categoryFit * 0.3 + llmScore * 0.2));
    const score = Math.max(0, Math.min(100, finalScore));

    let verdict: 'approved' | 'refactor' | 'rejected';
    if (score >= 70) verdict = 'approved';
    else if (score >= 50) verdict = 'refactor';
    else verdict = 'rejected';

    const reasons: string[] = [];
    reasons.push(`语义相似度：${(semanticSim * 100).toFixed(0)}/100（向量检索）`);
    reasons.push(`品类契合度：${(categoryFit * 100).toFixed(0)}/100`);
    reasons.push(`LLM 精排：${(llmScore * 100).toFixed(0)}/100`);
    if (llmReason) reasons.push(`AI 理由：${llmReason}`);
    if (verdict === 'rejected') {
      reasons.push('建议：走「AI 强制改造引擎」尝试挽救');
    } else if (verdict === 'refactor') {
      reasons.push('处于灰色区间：需强制 AI 二次剧情化改造');
    } else {
      reasons.push('达标，进入正常流量池');
    }

    return { score, verdict, reasons, categoryFit, styleFit: semanticSim, llmScore, llmReason };
  } catch {
    return mockFitnessScore(brand, scene);
  }
}

/**
 * 向量召回排序所有品牌
 */
export async function rankBrands(scene: SceneDefinition) {
  return rankBrandsByEmbedding(scene);
}

// ------------------------------------------------------------
// 5. AI 修复（改造引擎）—— 流式展示
// ------------------------------------------------------------

export async function repairCopyStream(params: {
  brand: BrandMaterial;
  scene: SceneDefinition;
  originalScore: number;
}): Promise<{ stream: ReadableStream<Uint8Array>; newScore: number; verdict: string; strategy: string[] }> {
  const repair = mockRepair(params);
  const status = getLLMStatus();

  if (status.mock) {
    return {
      stream: mockTextStream(repair.repairedCopy, 30),
      newScore: repair.newScore,
      verdict: repair.verdict,
      strategy: repair.strategy,
    };
  }

  const role = ROLE_TONES[params.scene.roleToneId];
  const systemPrompt = `你是 Echo 平台的"AI 强制改造引擎"。任务：将一段品类/风格与剧集不匹配的广告文案，改造为既保留品牌卖点、又与剧集"精神母题"兼容的软化版本。
  
改造原则：
1. 提取剧集的精神母题（不是简单抄腔调，而是抓住剧集气质）
2. 把品牌卖点嫁接到母题上，避免生硬贴合
3. 保留品牌识别度但弱化直白推销
4. 不超过 60 字

剧集风格参考：${role.displayName}（${role.era}）
改造意图：把品类为「${params.brand.category}」的广告改到「${params.scene.genre}」语境下可接受。`;

  const userPrompt = `品牌：${params.brand.name}
品类：${params.brand.category}
原始硬广文案：${params.brand.rawCopy}
目标剧集：${params.scene.title}
剧集精神母题：${params.scene.signatureDialogue}

输出改造后的文案正文（不超过 60 字，只输出文案）：`;

  try {
    const stream = await llmStream({
      systemPrompt,
      userPrompt,
      temperature: 0.85,
      maxTokens: 180,
    });
    return {
      stream,
      newScore: repair.newScore,
      verdict: repair.verdict,
      strategy: repair.strategy,
    };
  } catch {
    return {
      stream: mockTextStream(repair.repairedCopy, 30),
      newScore: repair.newScore,
      verdict: repair.verdict,
      strategy: repair.strategy,
    };
  }
}

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function stripJsonFence(s: string) {
  return s.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
}
