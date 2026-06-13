export interface ProgressTrend {
  date: string;
  attempts: number;
  correctAnswers: number;
  questionsAnswered: number;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  incorrectCount: number;
  accuracyRate: number;
}

export interface ProgressDashboard {
  studentId: string;
  completionPct: number;
  studiedCount: number;
  attemptCount: number;
  passRate: number;
  totalStudyMinutes: number;
  avgExamScore: number;
  trend: ProgressTrend[];
  weakTopics: WeakTopic[];
  lastActivityAt: string | null;
}

export interface AdminAnalyticsOverview {
  monthlyActiveUsers: number;
  passRate: number;
  activeCourses: number;
  [key: string]: unknown;
}
