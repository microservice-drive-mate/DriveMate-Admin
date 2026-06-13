import type { ApiResponse } from '@/types';
import type {
  AdminAnalyticsOverview,
  ProgressDashboard,
} from '@/types/analytics.types';
import { apiService } from '@/lib';
import { withErrorHandling } from '@/utils';

export const analyticsService = {
  getOverview: withErrorHandling(() =>
    apiService.get<ApiResponse<AdminAnalyticsOverview>>(
      '/admin/analytics/overview',
    ),
  ),

  getStudentProgress: withErrorHandling((studentId: string) =>
    apiService.get<ApiResponse<ProgressDashboard>>(
      `/admin/analytics/students/${studentId}/progress`,
    ),
  ),
};
