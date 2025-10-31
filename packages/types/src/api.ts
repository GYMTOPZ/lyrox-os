// API Response Types

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: {
    timestamp: string;
  };
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface DashboardMetrics {
  period: 'today' | 'week' | 'month' | 'year';
  metrics: {
    totalMessages: number;
    totalConversations: number;
    newCustomers: number;
    totalSales: number;
    revenue: number;
    conversionRate: number;
    avgResponseTime: number;
  };
  trend: {
    messages: string;
    sales: string;
    revenue: string;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  breakdown: Array<{
    date: string;
    revenue: number;
    salesCount: number;
  }>;
}
