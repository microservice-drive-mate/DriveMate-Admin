export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'active' | 'retired' | 'deleted';
export type LicenseClass = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F';

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  content: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface QuestionVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface Question {
  id: number;
  content: string;
  imageUrl?: string;
  isCritical: boolean;
  difficulty: QuestionDifficulty;
  licenseClass: LicenseClass;
  topic: string;
  options: QuestionOption[];
  explanation: string;
  status: QuestionStatus;
  version: number;
  versions: QuestionVersion[];
  tags: string[];
}

export interface QuestionFilters {
  search: string;
  licenseClass: string;
  topic: string;
  difficulty: string;
}

export interface QuestionFormData {
  content: string;
  imageUrl: string;
  isCritical: boolean;
  difficulty: QuestionDifficulty | '';
  licenseClass: LicenseClass | '';
  topic: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; content: string; isCorrect: boolean }[];
  explanation: string;
  tags: string[];
}

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Dễ',
  medium: 'TB',
  hard: 'Khó',
};

export const TOPIC_OPTIONS = [
  'Biển báo',
  'Luật giao thông',
  'Tốc độ',
  'Xử lý tình huống',
  'Vạch kẻ đường',
  'Kỹ thuật lái',
];

export const LICENSE_CLASS_OPTIONS: LicenseClass[] = ['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F'];
