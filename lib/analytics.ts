export interface QueryMetrics {
  query: string;
  timestamp: Date;
  responseTime: number;
  contextChunks: number;
  averageSimilarity: number;
  citationsUsed: number;
  userSatisfaction?: number; // Optional user feedback
}

export interface SystemMetrics {
  totalQueries: number;
  averageResponseTime: number;
  averageContextChunks: number;
  averageSimilarity: number;
  topQueries: string[];
  failedQueries: number;
}

class AnalyticsManager {
  private metrics: QueryMetrics[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 queries

  addQueryMetric(metric: Omit<QueryMetrics, "timestamp">): void {
    const fullMetric: QueryMetrics = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Maintain size limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getSystemMetrics(): SystemMetrics {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        averageContextChunks: 0,
        averageSimilarity: 0,
        topQueries: [],
        failedQueries: 0,
      };
    }

    const totalQueries = this.metrics.length;
    const averageResponseTime =
      this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalQueries;
    const averageContextChunks =
      this.metrics.reduce((sum, m) => sum + m.contextChunks, 0) / totalQueries;
    const averageSimilarity =
      this.metrics.reduce((sum, m) => sum + m.averageSimilarity, 0) /
      totalQueries;
    const failedQueries = this.metrics.filter(
      (m) => m.contextChunks === 0
    ).length;

    // Get top queries (most frequent)
    const queryCounts: { [key: string]: number } = {};
    this.metrics.forEach((m) => {
      queryCounts[m.query] = (queryCounts[m.query] || 0) + 1;
    });

    const topQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);

    return {
      totalQueries,
      averageResponseTime,
      averageContextChunks,
      averageSimilarity,
      topQueries,
      failedQueries,
    };
  }

  getRecentMetrics(hours: number = 24): QueryMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }

  getQueryPerformance(query: string): QueryMetrics[] {
    return this.metrics.filter((m) =>
      m.query.toLowerCase().includes(query.toLowerCase())
    );
  }

  getLowSimilarityQueries(threshold: number = 0.5): QueryMetrics[] {
    return this.metrics.filter((m) => m.averageSimilarity < threshold);
  }

  getSlowQueries(threshold: number = 5000): QueryMetrics[] {
    return this.metrics.filter((m) => m.responseTime > threshold);
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const analyticsManager = new AnalyticsManager();

// Helper function to track query performance
export function trackQueryPerformance(
  query: string,
  responseTime: number,
  contextChunks: any[],
  citationsUsed: number
): void {
  const averageSimilarity =
    contextChunks.length > 0
      ? contextChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) /
        contextChunks.length
      : 0;

  analyticsManager.addQueryMetric({
    query,
    responseTime,
    contextChunks: contextChunks.length,
    averageSimilarity,
    citationsUsed,
  });
}
