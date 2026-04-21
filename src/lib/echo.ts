/**
 * Echo · 统一业务入口层
 * ============================================================
 * 对外提供"AI 能力 API"；对内根据环境变量在"真实 LLM"和"Mock"之间路由。
 * UI 组件不直接接触 LLM / Mock 任何一方，只调用本层。
 * ============================================================
 */

import { ROLE_TONES, buildToneUserPrompt } from '@/data/prompts';
import type { BrandMaterial } from '@/data/brands';
import type { SceneDefinition } from '@/data/scenes';
import { llmCall, llmStream, mockTextStream, getLLMStatus } from './llm';
import {
  mockToneCopy,
  mockEmotionAggregate,
  mockSceneAnalysis,
  mockFitnessScore,
  mockRepair,
  type EmotionAggregate,
} from './mock';

export { getLLMStatus };
export type { EmotionAggregate };

// ------------------------------------------------------------
// 1. 腔调改写（流式）
// ------------------------------------------------------------

export async function generateToneCopyStream(params: {
  roleId: string;
  brand: string;
  sellingPoint: string;
  sceneContext?: string;
  emotionOverride?: string;
}): Promise<ReadableStream<Uint8Array>> {
  const role = ROLE_TONES[params.roleId];
  if (!role) throw new Error(`Unknown role: ${params.roleId}`);

  const userPrompt = buildToneUserPrompt(params);
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

  return llmStream({
    systemPrompt: role.systemPrompt,
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
  } catch (e) {
    // LLM 出错时降级 Mock
    return mockEmotionAggregate(messages);
  }
}

// ------------------------------------------------------------
// 3. 场景分析（快速返回，Mock 已经足够精确）
// ------------------------------------------------------------

export function analyzeScene(sceneId: string) {
  return mockSceneAnalysis(sceneId);
}

// ------------------------------------------------------------
// 4. 契合度评分
// ------------------------------------------------------------

export function scoreFitness(brand: BrandMaterial, scene: SceneDefinition) {
  return mockFitnessScore(brand, scene);
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
  } catch (e) {
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
