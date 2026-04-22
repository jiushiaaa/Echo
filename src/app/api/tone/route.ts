import { NextRequest } from 'next/server';
import { generateToneCopyStream } from '@/lib/echo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stream = await generateToneCopyStream({
      roleId: body.roleId,
      brand: body.brand,
      sellingPoint: body.sellingPoint,
      sceneContext: body.sceneContext,
      emotionOverride: body.emotionOverride,
      mode: body.mode,
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'unknown' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
