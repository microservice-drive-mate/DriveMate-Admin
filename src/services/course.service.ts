import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  CourseLesson,
  CourseResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
  AddLessonPayload,
  UpdateLessonPayload,
  AddMaterialPayload,
  CourseSchedule,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  AddCourseInstructorPayload,
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

  listSchedules: withErrorHandling((courseId: string) =>
    apiService.get<ApiResponse<CourseSchedule[]>>(
      `/admin/courses/${courseId}/schedules`,
    ),
  ),

  createSchedule: withErrorHandling((courseId: string, payload: CreateSchedulePayload) =>
    apiService.post<ApiResponse<CourseSchedule>>(
      `/admin/courses/${courseId}/schedules`,
      payload,
    ),
  ),

  updateSchedule: withErrorHandling((courseId: string, scheduleId: string, payload: UpdateSchedulePayload) =>
    apiService.patch<ApiResponse<CourseSchedule>>(
      `/admin/courses/${courseId}/schedules/${scheduleId}`,
      payload,
    ),
  ),

  deleteSchedule: withErrorHandling((courseId: string, scheduleId: string) =>
    apiService.delete<ApiResponse<void>>(
      `/admin/courses/${courseId}/schedules/${scheduleId}`,
    ),
  ),

  getLesson: withErrorHandling((courseId: string, lessonId: string) =>
    apiService.get<ApiResponse<CourseLesson>>(
      `/courses/${courseId}/lessons/${lessonId}`,
    ),
  ),

  updateLesson: withErrorHandling((courseId: string, lessonId: string, payload: UpdateLessonPayload) =>
    apiService.patch<ApiResponse<CourseResponse>>(
      `/admin/courses/${courseId}/lessons/${lessonId}`,
      payload,
    ),
  ),

  assignInstructor: withErrorHandling((courseId: string, payload: AddCourseInstructorPayload) =>
    apiService.post<ApiResponse<CourseResponse>>(
      `/admin/courses/${courseId}/instructors`,
      payload,
    ),
  ),

  removeInstructor: withErrorHandling((courseId: string, userId: string) =>
    apiService.delete<ApiResponse<CourseResponse>>(
      `/admin/courses/${courseId}/instructors/${userId}`,
    ),
  ),
};
