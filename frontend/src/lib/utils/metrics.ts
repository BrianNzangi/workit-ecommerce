import client from 'prom-client';

type MetricsStore = {
  register: client.Registry;
  ssrRenderTime: client.Gauge<'route'>;
  ssrRenderDuration: client.Histogram<'route'>;
  apiRequestDuration: client.Histogram<'route' | 'method' | 'status'>;
};

declare global {
  var __workitMetrics: MetricsStore | undefined;
}

function createMetricsStore(): MetricsStore {
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const ssrRenderTime = new client.Gauge({
    name: 'ssr_render_time_ms',
    help: 'SSR render time in milliseconds per page',
    labelNames: ['route'],
    registers: [register],
  });

  const ssrRenderDuration = new client.Histogram({
    name: 'ssr_render_duration_ms',
    help: 'SSR render duration distribution in milliseconds per page',
    labelNames: ['route'],
    buckets: [50, 100, 200, 500, 1000, 2000, 5000],
    registers: [register],
  });

  const apiRequestDuration = new client.Histogram({
    name: 'api_request_duration_ms',
    help: 'API request duration in milliseconds',
    labelNames: ['route', 'method', 'status'],
    buckets: [50, 100, 200, 500, 1000, 2000, 5000],
    registers: [register],
  });

  return {
    register,
    ssrRenderTime,
    ssrRenderDuration,
    apiRequestDuration,
  };
}

const metricsStore = globalThis.__workitMetrics ?? createMetricsStore();

if (!globalThis.__workitMetrics) {
  globalThis.__workitMetrics = metricsStore;
}

export function recordSsrRenderTime(route: string, durationMs: number) {
  metricsStore.ssrRenderTime.labels(route).set(durationMs);
  metricsStore.ssrRenderDuration.labels(route).observe(durationMs);
}

export function observeApiRequestDuration(
  route: string,
  method: string,
  status: number | string,
  durationMs: number,
) {
  metricsStore.apiRequestDuration
    .labels(route, method.toUpperCase(), String(status))
    .observe(durationMs);
}

export async function getPrometheusMetrics() {
  return metricsStore.register.metrics();
}

export function getPrometheusContentType() {
  return metricsStore.register.contentType;
}
