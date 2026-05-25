import { FastifyRequest, FastifyReply } from 'fastify';
import { performanceMonitor } from './PerformanceMonitor.js';

/**
 * Fastify middleware for tracking API request latency.
 *
 * Measures the time from request start to response completion
 * and records it in the performance monitor.
 *
 * Requirements: 25.6
 */
export async function apiLatencyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const startTime = Date.now();

  // Attach once per reply so we can record end-to-end latency.
  reply.raw.once('finish', () => {
    const duration = Date.now() - startTime;
    performanceMonitor.recordApiLatency(duration);

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow request: ${request.method} ${request.url} took ${duration}ms`);
    }
  });
}
