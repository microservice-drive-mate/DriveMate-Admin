import type {
  InstructorProfile,
  InstructorStatCard,
  WeeklyTeachingData,
  TopicScore,
  ClassProgress,
  TodaySession,
} from '../types';

export const INSTRUCTOR: InstructorProfile = {
  initials: 'NV',
  name: 'Nguyen Van A',
  role: 'Instructor',
};

export const STAT_CARDS: InstructorStatCard[] = [
  { title: 'Active Classes',             value: '8',    icon: '📖', iconBg: '#f97316' },
  { title: 'Total Students',             value: '156',  icon: '👤', iconBg: '#10b981' },
  { title: 'Pass Rate',                  value: '89%',  icon: '✅', iconBg: '#3b82f6' },
  { title: 'Teaching Hours This Month',  value: '124h', icon: '🕐', iconBg: '#8b5cf6' },
];

export const WEEKLY_DATA: WeeklyTeachingData[] = [
  { day: 'Mon', gioDay: 8,  hocVien: 42 },
  { day: 'Tue', gioDay: 6,  hocVien: 35 },
  { day: 'Wed', gioDay: 8,  hocVien: 44 },
  { day: 'Thu', gioDay: 4,  hocVien: 22 },
  { day: 'Fri', gioDay: 8,  hocVien: 48 },
  { day: 'Sat', gioDay: 6,  hocVien: 38 },
  { day: 'Sun', gioDay: 2,  hocVien: 15 },
];

export const TOPIC_SCORES: TopicScore[] = [
  { topic: 'Road Signs',       score: 85 },
  { topic: 'Traffic Laws',     score: 78 },
  { topic: 'Driving Technique', score: 90 },
  { topic: 'Hazard Handling',  score: 72 },
  { topic: 'Driving Safety',   score: 88 },
];

export const CLASS_PROGRESS: ClassProgress[] = [
  { id: '1', name: 'B1 - Morning Mon,Wed,Fri',    completed: 18, total: 24, percent: 75 },
  { id: '2', name: 'B2 - Afternoon Tue,Thu,Sat',  completed: 12, total: 20, percent: 60 },
  { id: '3', name: 'A2 - Evening Mon,Wed',         completed: 14, total: 15, percent: 93 },
  { id: '4', name: 'C - Morning Tue,Thu',          completed: 9,  total: 18, percent: 50 },
  { id: '5', name: 'B1 - Afternoon Mon,Wed',       completed: 19, total: 22, percent: 86 },
];

export const TODAY_SESSIONS: TodaySession[] = [
  { id: '1', timeRange: '07:00–09:00', className: 'B1 - Morning Mon,Wed,Fri',   room: 'Room 101', studentCount: 24 },
  { id: '2', timeRange: '14:00–16:00', className: 'B2 - Afternoon Tue,Thu,Sat', room: 'Room 102', studentCount: 20 },
  { id: '3', timeRange: '18:00–20:00', className: 'A2 - Evening Mon,Wed',        room: 'Room 103', studentCount: 15 },
];

export const DARK_TOOLTIP = {
  contentStyle: {
    background: '#242424',
    border: '1px solid #333333',
    borderRadius: 8,
    color: '#f0f0f0',
    fontSize: 13,
  },
  labelStyle: { color: '#f0f0f0' },
};
