import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  CourseResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
  AddLessonPayload,
  AddMaterialPayload,
} from '@/types/course.types';

import { apiService } from '@/lib';
import { withErrorHandling } from '@/utils';

export interface CourseListParams {
  page?: number;
  size?: number;
  licenseCategory?: string;
  status?: string;
}

export const courseService = {
  list: withErrorHandling((params?: CourseListParams) =>
    apiService.get<ApiResponse<PaginatedResponse<CourseResponse>>>(
      '/admin/courses',
      { params },
    ),
  ),

  listPublic: withErrorHandling((params?: CourseListParams) =>
    apiService.get<ApiResponse<PaginatedResponse<CourseResponse>>>(
      '/courses',
      { params },
    ),
  ),

  getById: withErrorHandling((id: string) =>
    apiService.get<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}`,
    ),
  ),

  getPublicById: withErrorHandling((id: string) =>
    apiService.get<ApiResponse<CourseResponse>>(
      `/courses/${id}`,
    ),
  ),

  create: withErrorHandling((payload: CreateCoursePayload) =>
    apiService.post<ApiResponse<CourseResponse>>(
      '/admin/courses',
      payload,
    ),
  ),

  update: withErrorHandling((id: string, payload: UpdateCoursePayload) =>
    apiService.patch<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}`,
      payload,
    ),
  ),

  activate: withErrorHandling((id: string) =>
    apiService.patch<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}/activate`,
    ),
  ),

  addLesson: withErrorHandling((id: string, payload: AddLessonPayload) =>
    apiService.post<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}/lessons`,
      payload,
    ),
  ),

  deleteLesson: withErrorHandling((id: string, lessonId: string) =>
    apiService.delete<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}/lessons/${lessonId}`,
    ),
  ),

  addMaterial: withErrorHandling((id: string, payload: AddMaterialPayload) =>
    apiService.post<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}/materials`,
      payload,
    ),
  ),

  archive: withErrorHandling((id: string) =>
    apiService.delete<ApiResponse<CourseResponse>>(
      `/admin/courses/${id}`,
    ),
  ),
};
