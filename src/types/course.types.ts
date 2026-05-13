export type LicenseClass = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F';
export type CourseStatus = 'active' | 'draft' | 'inactive';

export interface Lesson {
  id: string;
  title: string;
  duration: number; // minutes
  completions: number;
}

export interface Material {
  id: string;
  name: string;
  size: string;
  downloads: number;
  type: 'pdf' | 'video' | 'doc';
}

export interface Exam {
  id: string;
  type: 'midterm' | 'final' | 'practice';
  totalQuestions: number;
  duration: number; // minutes
  minScore: number;
}

export interface Course {
  id: string;
  name: string;
  licenseClass: LicenseClass;
  duration: string;
  lessonCount: number;
  studentCount: number;
  tuitionFee: number;
  status: CourseStatus;
  description: string;
  capacity: number;
  minAge: number;
  prerequisite: string;
  attendanceRate: number;
  minPassScore: number;
  requiredExams: number;
  instructors: string[];
  lessons: Lesson[];
  materials: Material[];
  exams: Exam[];
}

export interface CourseFilters {
  search: string;
  licenseClass: string;
  status: string;
}

export interface CourseFormData {
  name: string;
  licenseClass: string;
  duration: string;
  tuitionFee: number;
  capacity: number;
  description: string;
  status: string;
  instructors: string[];
  lessons: { title: string }[];
  materials: { name: string; url: string }[];
  minAge: number;
  prerequisite: string;
  attendanceRate: number;
  minPassScore: number;
  requiredExams: number;
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  active: 'Hoạt động',
  draft: 'Bản nháp',
  inactive: 'Ngừng hoạt động',
};

export const COURSE_LICENSE_CLASSES: LicenseClass[] = ['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F'];

export const COURSE_STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];
