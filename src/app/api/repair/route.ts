import { NextRequest } from 'next/server';
import { repairCopyStream } from '@/lib/echo';
import { getBrand } from '@/data/brands';
import { getScene } from '@/data/scenes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { brandId, sceneId, originalScore } = await req.json();
    const brand = getBrand(brandId);
    const scene = getScene(sceneId);
    if (!brand || !scene) {
      return Response.json({ error: 'unknown brand or scene' }, { status: 400 });
    }
    const { stream, newScore, verdict, strategy } = await repairCopyStream({
      brand,
      scene,
      originalScore: originalScore ?? 40,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'X-Repair-New-Score': String(newScore),
        'X-Repair-Verdict': verdict,
        'X-Repair-Strategy': encodeURIComponent(JSON.stringify(strategy)),
      },
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
