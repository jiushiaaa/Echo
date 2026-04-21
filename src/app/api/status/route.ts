import { getLLMStatus } from '@/lib/echo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(getLLMStatus());
}
