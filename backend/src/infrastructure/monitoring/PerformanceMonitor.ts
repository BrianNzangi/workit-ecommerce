/**
 * Performance monitoring for API requests and database operations.
 *
 * Tracks:
 * - API latency (p50, p95, p99)
 * - Database query time
 * - Cache hit rates
 * - Event processing time
 *
 * Requirements: 25.6
 */
export class PerformanceMonitor {
  private apiLatencies: number[] = [];
  private dbQueryTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private eventProcessingTimes: number[] = [];

  /**
   * Record an API request latency.
   */
  recordApiLatency(durationMs: number): void {
    this.apiLatencies.push(durationMs);
    // Keep only last 1000 measurements to avoid memory bloat
    if (this.apiLatencies.length > 1000) {
      this.apiLatencies.shift();
    }
  }

  /**
   * Record a database query execution time.
   */
  recordDbQueryTime(durationMs: number): void {
    this.dbQueryTimes.push(durationMs);
    if (this.dbQueryTimes.length > 1000) {
      this.dbQueryTimes.shift();
    }
  }

  /**
   * Record a cache hit.
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record a cache miss.
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Record event processing time.
   */
  recordEventProcessingTime(durationMs: number): void {
    this.eventProcessingTimes.push(durationMs);
    if (this.eventProcessingTimes.length > 1000) {
      this.eventProcessingTimes.shift();
    }
  }

  /**
   * Get API latency percentiles.
   */
  getApiLatencyPercentiles(): { p50: number; p95: number; p99: number } {
    return this.calculatePercentiles(this.apiLatencies);
  }

  /**
   * Get database query time percentiles.
   */
  getDbQueryTimePercentiles(): { p50: number; p95: number; p99: number } {
    return this.calculatePercentiles(this.dbQueryTimes);
  }

  /**
   * Get cache hit rate.
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : (this.cacheHits / total) * 100;
  }

  /**
   * Get event processing time percentiles.
   */
  getEventProcessingTimePercentiles(): { p50: number; p95: number; p99: number } {
    return this.calculatePercentiles(this.eventProcessingTimes);
  }

  /**
   * Get comprehensive metrics report.
   */
  getMetricsReport(): {
    apiLatency: { p50: number; p95: number; p99: number };
    dbQueryTime: { p50: number; p95: number; p99: number };
    cacheHitRate: number;
    eventProcessingTime: { p50: number; p95: number; p99: number };
    timestamp: Date;
  } {
    return {
      apiLatency: this.getApiLatencyPercentiles(),
      dbQueryTime: this.getDbQueryTimePercentiles(),
      cacheHitRate: this.getCacheHitRate(),
      eventProcessingTime: this.getEventProcessingTimePercentiles(),
      timestamp: new Date(),
    };
  }

  /**
   * Reset all metrics.
   */
  reset(): void {
    this.apiLatencies = [];
    this.dbQueryTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.eventProcessingTimes = [];
  }

  /**
   * Calculate percentiles from an array of values.
   */
  private calculatePercentiles(
    values: number[]
  ): { p50: number; p95: number; p99: number } {
    if (values.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    return {
      p50: sorted[p50Index],
      p95: sorted[p95Index],
      p99: sorted[p99Index],
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();
