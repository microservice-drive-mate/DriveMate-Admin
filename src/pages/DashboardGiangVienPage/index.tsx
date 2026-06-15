import { useCallback } from 'react';
import { analyticsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuthStore } from '@/store/authStore';
import type { InstructorDashboard } from '@/types/analytics.types';
import type {
  InstructorProfile,
  InstructorStatCard,
  WeeklyTeachingData,
  TopicScore,
  ClassProgress,
  TodaySession,
} from '@/types';
import { InstructorHeader } from './InstructorHeader';
import { StatCardsSection } from './StatCardsSection';
import { ChartsSection } from './ChartsSection';
import { ClassProgressSection } from './ClassProgressSection';
import { TodayScheduleSection } from './TodayScheduleSection';
import './index.css';

const EMPTY_DASHBOARD: InstructorDashboard = {
  period: { month: '', weekStart: '', date: '', timezone: '' },
  summary: { activeClassCount: 0, totalStudents: 0, passRate: 0, teachingHoursThisMonth: 0 },
  weeklyTeachingTrend: [],
  topicAverages: [],
  classProgress: [],
  todaySchedule: [],
};

function toStatCards(summary: InstructorDashboard['summary']): InstructorStatCard[] {
  return [
    { title: 'Lớp đang dạy', value: String(summary.activeClassCount), icon: '📖', iconBg: '#f97316' },
    { title: 'Tổng học viên', value: String(summary.totalStudents), icon: '👤', iconBg: '#10b981' },
    { title: 'Tỷ lệ đậu', value: `${Math.round(summary.passRate)}%`, icon: '✅', iconBg: '#3b82f6' },
    { title: 'Giờ dạy tháng này', value: `${summary.teachingHoursThisMonth}h`, icon: '🕐', iconBg: '#8b5cf6' },
  ];
}

function toWeeklyData(trend: InstructorDashboard['weeklyTeachingTrend']): WeeklyTeachingData[] {
  return trend.map((pt) => ({
    day: pt.label,
    gioDay: pt.teachingHours,
    hocVien: pt.studentCount,
  }));
}

function toTopicScores(avgs: InstructorDashboard['topicAverages']): TopicScore[] {
  return avgs.map((t) => ({
    topic: t.topicName,
    score: Math.round(t.averageScore),
  }));
}

function toClassProgress(progress: InstructorDashboard['classProgress']): ClassProgress[] {
  return progress.map((c) => ({
    id: c.courseId,
    name: c.title,
    completed: c.completedStudents,
    total: c.totalStudents,
    percent: Math.round(c.progressPct),
  }));
}

function toTodaySessions(schedule: InstructorDashboard['todaySchedule']): TodaySession[] {
  return schedule.map((s) => ({
    id: s.scheduleId,
    timeRange: `${s.startTime}–${s.endTime}`,
    className: s.title,
    room: s.room,
    studentCount: s.studentCount,
  }));
}

export function DashboardGiangVienPage() {
  const user = useAuthStore((s) => s.user);

  const load = useCallback(() => analyticsService.getInstructorDashboard(), []);
  const { data, loading, error } = useAsyncData(load, { initialData: EMPTY_DASHBOARD });

  const instructor: InstructorProfile = {
    initials: user?.email ? user.email.slice(0, 2).toUpperCase() : 'GV',
    name: user?.email ? user.email.split('@')[0] : 'Giảng viên',
    role: 'Giảng viên',
  };

  if (loading) {
    return (
      <div className="gv-dashboard">
        <InstructorHeader instructor={instructor} />
        <div className="gv-loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gv-dashboard">
        <InstructorHeader instructor={instructor} />
        <div className="gv-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="gv-dashboard">
      <InstructorHeader instructor={instructor} />
      <StatCardsSection cards={toStatCards(data.summary)} />
      <ChartsSection
        weeklyData={toWeeklyData(data.weeklyTeachingTrend)}
        topicScores={toTopicScores(data.topicAverages)}
      />
      <ClassProgressSection classes={toClassProgress(data.classProgress)} />
      <TodayScheduleSection sessions={toTodaySessions(data.todaySchedule)} />
    </div>
  );
}
