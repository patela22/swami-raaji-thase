"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  totalQueries: number;
  avgResponseTime: number;
  successRate: number;
  topQueries: Array<{ query: string; count: number }>;
  recentActivity: Array<{
    timestamp: string;
    query: string;
    responseTime: number;
    citations: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your analytics API
      // For now, we'll simulate some data
      const mockData: AnalyticsData = {
        totalQueries: 1247,
        avgResponseTime: 2.3,
        successRate: 94.2,
        topQueries: [
          { query: "What is BAPS Satsang?", count: 156 },
          { query: "Who is Swaminarayan?", count: 89 },
          { query: "Tell me the about Vachanamrut", count: 67 },
          { query: "What is spiritual guidance?", count: 45 },
          { query: "Who is Bapa?", count: 34 },
        ],
        recentActivity: [
          {
            timestamp: new Date().toISOString(),
            query: "What is the importance of satsang?",
            responseTime: 2.1,
            citations: 3,
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            query: "Tell me about spiritual practices",
            responseTime: 1.8,
            citations: 2,
          },
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            query: "Who is the guru in BAPS?",
            responseTime: 2.5,
            citations: 4,
          },
        ],
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50"
        aria-label="Open Analytics Dashboard"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-2xl font-bold text-text-primary">
                Analytics Dashboard
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-primary-900 to-primary-800">
                      <div className="text-3xl font-bold text-primary-400">
                        {analytics.totalQueries.toLocaleString()}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Total Queries
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-success-900 to-success-800">
                      <div className="text-3xl font-bold text-success-400">
                        {analytics.avgResponseTime}s
                      </div>
                      <div className="text-sm text-text-secondary">
                        Avg Response Time
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-warning-900 to-warning-800">
                      <div className="text-3xl font-bold text-warning-400">
                        {analytics.successRate}%
                      </div>
                      <div className="text-sm text-text-secondary">
                        Success Rate
                      </div>
                    </div>
                  </div>

                  {/* Top Queries */}
                  <div className="bg-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Top Queries
                    </h3>
                    <div className="space-y-3">
                      {analytics.topQueries.map((query, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </div>
                            <span className="text-sm text-text-primary">
                              {query.query}
                            </span>
                          </div>
                          <span className="text-sm text-text-secondary">
                            {query.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {analytics.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-surface rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm text-text-primary font-medium">
                              {activity.query}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {new Date(
                                activity.timestamp
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary">
                            <span>{activity.responseTime}s</span>
                            <span>{activity.citations} citations</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  No analytics data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
