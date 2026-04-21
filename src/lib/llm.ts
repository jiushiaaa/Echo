/**
 * Echo · LLM 运行时客户端
 * ============================================================
 * 严格基于 OpenAI-compatible 协议，"认接口不认厂商"。
 * 通过环境变量切换：OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL
 *
 * 兼容厂商（任选其一）：
 *   DeepSeek:     https://api.deepseek.com/v1
 *   Kimi:         https://api.moonshot.cn/v1
 *   通义千问:     https://dashscope.aliyuncs.com/compatible-mode/v1
 *   OpenAI:       https://api.openai.com/v1
 *   智谱 GLM-4:   https://open.bigmodel.cn/api/paas/v4
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

const getModel = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * 非流式调用
 */
export async function llmCall(opts: LLMCallOptions): Promise<string> {
  if (isMockMode()) {
    // 被调用方应使用 mock 模块处理
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
