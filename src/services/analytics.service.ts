import type { ApiResponse } from '@/types';
import type { ProgressDashboard } from '@/types/analytics.types';
import { apiService } from '@/lib';
import { withErrorHandling } from '@/utils';

export const analyticsService = {
  getStudentProgress: withErrorHandling((studentId: string) =>
    apiService.get<ApiResponse<ProgressDashboard>>(
      `/admin/analytics/students/${studentId}/progress`,
    ),
  ),
};
