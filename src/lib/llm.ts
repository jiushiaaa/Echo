/**
 * Echo · LLM 运行时客户端
 * ============================================================
 * 严格基于 OpenAI-compatible 协议，"认接口不认厂商"。
 * 通过环境变量切换：OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL
 *
 * 支持四种模型角色：
 *   OPENAI_MODEL          → 主文本模型 glm-4.7-flashx（过渡语/情绪/修复）
 *   OPENAI_VISION_MODEL   → 视觉模型 glm-5v-turbo（图片+视频分析）
 *   OPENAI_EMBEDDING_MODEL→ 向量模型 embedding-3（品牌匹配）
 *   OPENAI_LONG_MODEL     → 长上下文模型 glm-4-long（整集分析）
 * ============================================================
 */

import OpenAI from 'openai';

export type LLMCallOptions = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

const isMockMode = () => {
  return (
    process.env.ECHO_USE_MOCK === 'true' ||
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'sk-your-key-here'
  );
};

export function getLLMStatus() {
  return {
    mock: isMockMode(),
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

let _client: OpenAI | null = null;
function getClient() {
  if (isMockMode()) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return _client;
}

const getModel = () => process.env.OPENAI_MODEL || 'glm-4.7-flashx';
const getVisionModel = () => process.env.OPENAI_VISION_MODEL || 'glm-5v-turbo';
const getLongModel = () => process.env.OPENAI_LONG_MODEL || 'glm-4-long';
const getEmbeddingModel = () => process.env.OPENAI_EMBEDDING_MODEL || 'embedding-3';

export { getVisionModel, getLongModel, getEmbeddingModel };

/**
 * 非流式调用
 */
export async function llmCall(opts: LLMCallOptions): Promise<string> {
  if (isMockMode()) {
    throw new Error('MOCK_MODE');
  }
  const client = getClient()!;
  const resp = await client.chat.completions.create({
    model: getModel(),
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    temperature: opts.temperature ?? 0.85,
    max_tokens: opts.maxTokens ?? 300,
  });
  return resp.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * 流式调用，返回 ReadableStream（供 API Route 转发）
 */
export async function llmStream(opts: LLMCallOptions) {
  if (isMockMode()) {
    throw new Error('MOCK_MODE');
  }
  const client = getClient()!;
  const stream = await client.chat.completions.create({
    model: getModel(),
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    temperature: opts.temperature ?? 0.85,
    max_tokens: opts.maxTokens ?? 300,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

/**
 * 视觉模型调用：接收 base64 图片 + 文本 prompt
 */
export async function llmVisionCall(opts: {
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  if (isMockMode()) {
    throw new Error('MOCK_MODE');
  }
  const client = getClient()!;
  const resp = await client.chat.completions.create({
    model: getVisionModel(),
    messages: [
      { role: 'system', content: opts.systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: opts.imageBase64.startsWith('data:') ? opts.imageBase64 : `data:image/jpeg;base64,${opts.imageBase64}` },
          },
          { type: 'text', text: opts.userPrompt },
        ],
      },
    ],
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 800,
  });
  return resp.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * 视觉模型调用（视频 URL 输入）：GLM-5V-Turbo 支持直接传入视频 URL 进行分析
 */
export async function llmVideoCall(opts: {
  systemPrompt: string;
  userPrompt: string;
  videoUrl: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  if (isMockMode()) {
    throw new Error('MOCK_MODE');
  }
  const client = getClient()!;
  const resp = await client.chat.completions.create({
    model: getVisionModel(),
    messages: [
      { role: 'system', content: opts.systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'video_url' as any,
            video_url: { url: opts.videoUrl },
          } as any,
          { type: 'text', text: opts.userPrompt },
        ],
      },
    ],
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1200,
  } as any);
  return resp.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * 向量化调用：返回 number[]
 */
export async function llmEmbed(text: string, dimensions = 512): Promise<number[]> {
  if (isMockMode()) {
    throw new Error('MOCK_MODE');
  }
  const client = getClient()!;
  const resp = await client.embeddings.create({
    model: getEmbeddingModel(),
    input: text,
    dimensions,
  } as any);
  return (resp.data[0] as any).embedding;
}

/**
 * 把字符串按字符切片后以流的形式逐步发出，用于 Mock 场景模拟 LLM 流式输出
 */
export function mockTextStream(text: string, baseDelay = 28) {
  const encoder = new TextEncoder();
  const chars = Array.from(text);
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const c of chars) {
        controller.enqueue(encoder.encode(c));
        await new Promise((r) => setTimeout(r, baseDelay + Math.random() * 30));
      }
      controller.close();
    },
  });
}
