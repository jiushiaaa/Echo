import { NextRequest } from 'next/server';
import { scoreFitness } from '@/lib/echo';
import { getBrand } from '@/data/brands';
import { getScene } from '@/data/scenes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { brandId, sceneId } = await req.json();
    const brand = getBrand(brandId);
    const scene = getScene(sceneId);
    if (!brand || !scene) {
      return Response.json({ error: 'unknown brand or scene' }, { status: 400 });
    }
    const result = scoreFitness(brand, scene);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
