import { NextRequest, NextResponse } from "next/server";
import { analyticsManager } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24");
    const query = searchParams.get("query") || "";

    const systemMetrics = analyticsManager.getSystemMetrics();
    const recentMetrics = analyticsManager.getRecentMetrics(hours);

    let queryMetrics = [];
    if (query) {
      queryMetrics = analyticsManager.getQueryPerformance(query);
    }

    const lowSimilarityQueries = analyticsManager.getLowSimilarityQueries(0.5);
    const slowQueries = analyticsManager.getSlowQueries(5000);

    return NextResponse.json({
      systemMetrics,
      recentMetrics: recentMetrics.length,
      queryMetrics: queryMetrics.length,
      lowSimilarityQueries: lowSimilarityQueries.length,
      slowQueries: slowQueries.length,
      performance: {
        averageResponseTime: systemMetrics.averageResponseTime,
        averageSimilarity: systemMetrics.averageSimilarity,
        successRate:
          ((systemMetrics.totalQueries - systemMetrics.failedQueries) /
            systemMetrics.totalQueries) *
          100,
      },
      topQueries: systemMetrics.topQueries.slice(0, 5),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    analyticsManager.clearMetrics();
    return NextResponse.json({ message: "Analytics cleared successfully" });
  } catch (error) {
    console.error("Analytics clear error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
