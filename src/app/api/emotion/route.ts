import { NextRequest } from 'next/server';
import { aggregateEmotion } from '@/lib/echo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const result = await aggregateEmotion(messages ?? []);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
