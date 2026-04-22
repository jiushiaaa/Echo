/**
 * Echo · 向量检索层
 * ============================================================
 * 用智谱 embedding-3 做品牌-场景语义匹配。
 * 内存缓存向量（Demo 规模 <20 条，无需外部向量库）。
 * ============================================================
 */

import { llmEmbed } from './llm';
import { BRANDS, type BrandMaterial } from '@/data/brands';
import { SCENES, type SceneDefinition } from '@/data/scenes';
import { getLLMStatus } from './llm';

const DIMENSIONS = 512;

const vectorCache = new Map<string, number[]>();

function brandText(b: BrandMaterial): string {
  return `${b.name} ${b.category} ${b.styleTags.join(' ')} ${b.rawCopy}`;
}

function sceneText(s: SceneDefinition): string {
  return `${s.title} ${s.genre} ${s.tagline} ${s.signatureDialogue} ${s.reusableAssets.join(' ')}`;
}

async function getVector(key: string, text: string): Promise<number[]> {
  const cached = vectorCache.get(key);
  if (cached) return cached;

  const vec = await llmEmbed(text, DIMENSIONS);
  vectorCache.set(key, vec);
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function embedBrand(brand: BrandMaterial): Promise<number[]> {
  return getVector(`brand:${brand.id}`, brandText(brand));
}

export async function embedScene(scene: SceneDefinition): Promise<number[]> {
  return getVector(`scene:${scene.id}`, sceneText(scene));
}

/**
 * 对所有品牌按场景做向量相似度排序，返回 [{brand, similarity}]
 */
export async function rankBrandsByEmbedding(
  scene: SceneDefinition,
  brands: BrandMaterial[] = BRANDS
): Promise<Array<{ brand: BrandMaterial; similarity: number }>> {
  const status = getLLMStatus();
  if (status.mock) {
    return brands.map((b) => ({
      brand: b,
      similarity: (scene.intrinsicFit[b.category] ?? 0.5) * 0.8 + Math.random() * 0.2,
    })).sort((a, b) => b.similarity - a.similarity);
  }

  try {
    const sceneVec = await embedScene(scene);
    const results = await Promise.all(
      brands.map(async (brand) => {
        const brandVec = await embedBrand(brand);
        const similarity = cosineSimilarity(sceneVec, brandVec);
        return { brand, similarity };
      })
    );
    return results.sort((a, b) => b.similarity - a.similarity);
  } catch {
    return brands.map((b) => ({
      brand: b,
      similarity: (scene.intrinsicFit[b.category] ?? 0.5) * 0.8 + Math.random() * 0.2,
    })).sort((a, b) => b.similarity - a.similarity);
  }
}
