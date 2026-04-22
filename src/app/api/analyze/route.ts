import { NextRequest, NextResponse } from 'next/server';
import { analyzeScene, analyzeSceneVision } from '@/lib/echo';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.imageBase64) {
      const result = await analyzeSceneVision(body.imageBase64);
      return NextResponse.json(result);
    }

    const sceneId = body.sceneId || 'qingyunian';
    const result = analyzeScene(sceneId);
    if (!result) {
      return NextResponse.json({ error: 'Unknown scene' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
