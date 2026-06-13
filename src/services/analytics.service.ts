import type { ApiResponse } from '@/types';
import type { AdminDashboard, ProgressDashboard } from '@/types/analytics.types';
import { apiService } from '@/lib';
import { withErrorHandling } from '@/utils';

export const analyticsService = {
  getStudentProgress: withErrorHandling((studentId: string) =>
    apiService.get<ApiResponse<ProgressDashboard>>(
      `/admin/analytics/students/${studentId}/progress`,
    ),
  ),

  getDashboard: withErrorHandling((month?: string) =>
    apiService.get<ApiResponse<AdminDashboard>>(
      '/admin/analytics/dashboard',
      { params: month ? { month } : undefined },
    ),
  ),
};
