import { getPrometheusContentType, getPrometheusMetrics } from '@/lib/utils/metrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const metrics = await getPrometheusMetrics();

  return new Response(metrics, {
    status: 200,
    headers: {
      'Content-Type': getPrometheusContentType(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
