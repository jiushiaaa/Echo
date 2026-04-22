import { NextRequest, NextResponse } from 'next/server';
import { analyzeScene } from '@/lib/echo';

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
