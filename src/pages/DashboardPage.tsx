import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import type { MonthlyTrend, LicenseDistribution, PassRate, RecentActivity } from '../types';
import './DashboardPage.css';

const monthlyTrend: MonthlyTrend[] = [
  { month: 'T1', hocVien: 300, baiThi: 200, dat: 160 },
  { month: 'T2', hocVien: 350, baiThi: 240, dat: 190 },
  { month: 'T3', hocVien: 380, baiThi: 260, dat: 210 },
  { month: 'T4', hocVien: 420, baiThi: 300, dat: 250 },
  { month: 'T5', hocVien: 480, baiThi: 340, dat: 280 },
  { month: 'T6', hocVien: 550, baiThi: 380, dat: 320 },
];

const licenseDistribution: LicenseDistribution[] = [
  { name: 'Hạng B1', value: 32 },
  { name: 'Hạng B2', value: 25 },
  { name: 'Hạng A1', value: 16 },
  { name: 'Hạng C', value: 13 },
  { name: 'Hạng A2', value: 13 },
];

const PIE_COLORS = ['#f59e0b', '#2563eb', '#10b981', '#8b5cf6', '#ef4444'];

const passRates: PassRate[] = [
  { hang: 'A1', rate: 78 },
  { hang: 'A2', rate: 82 },
  { hang: 'B1', rate: 85 },
  { hang: 'B2', rate: 79 },
  { hang: 'C', rate: 76 },
];

const recentActivities: RecentActivity[] = [
  { id: '1', name: 'Nguyễn Văn A', action: 'Hoàn thành khóa học B1', time: '5 phút trước', status: 'success' },
  { id: '2', name: 'Trần Thị B', action: 'Đăng ký khóa học A2', time: '12 phút trước', status: 'neutral' },
  { id: '3', name: 'Lê Văn C', action: 'Thi lại lần 2 – Đạt', time: '25 phút trước', status: 'success' },
  { id: '4', name: 'Phạm Thị D', action: 'Thi lại lần 1 – Không đạt', time: '1 giờ trước', status: 'fail' },
  { id: '5', name: 'Hoàng Văn E', action: 'Hoàn thành bài thi thử', time: '2 giờ trước', status: 'neutral' },
];

interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  changeType: 'positive' | 'negative';
  icon: string;
  iconBg: string;
}

const statCards: StatCardData[] = [
  {
    title: 'Tổng Học Viên',
    value: '2,847',
    change: '+12.5%',
    changeLabel: 'so với tháng trước',
    changeType: 'positive',
    icon: '👥',
    iconBg: '#f97316',
  },
  {
    title: 'Tổng Khóa Học',
    value: '24',
    change: '+5',
    changeLabel: 'so với tháng trước',
    changeType: 'positive',
    icon: '📚',
    iconBg: '#10b981',
  },
  {
    title: 'Giảng Viên',
    value: '48',
    change: '+8',
    changeLabel: 'so với tháng trước',
    changeType: 'positive',
    icon: '👤',
    iconBg: '#3b82f6',
  },
  {
    title: 'Bài Thi Hoàn Thành',
    value: '1,234',
    change: '-18.2%',
    changeLabel: 'so với tháng trước',
    changeType: 'negative',
    icon: '📄',
    iconBg: '#8b5cf6',
  },
];

export function DashboardPage() {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Dashboard Tổng Quan</h1>
        <p>Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="stat-card__info">
              <div className="stat-card__title">{card.title}</div>
              <div className="stat-card__value">{card.value}</div>
              <div className="stat-card__change">
                <span className={`stat-card__change-badge stat-card__change-badge--${card.changeType}`}>
                  {card.changeType === 'positive' ? '↑' : '↓'} {card.change}
                </span>
                {card.changeLabel}
              </div>
            </div>
            <div className="stat-card__icon" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card__title">Xu Hướng Theo Tháng</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hocVien" name="Học viên" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="baiThi" name="Bài thi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="dat" name="Đạt" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card__title">Phân Bố Theo Hạng Bằng</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={licenseDistribution}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {licenseDistribution.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card__title">Tỷ Lệ Đỗ Theo Hạng Bằng</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={passRates} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="hang" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="rate" name="Tỷ lệ đỗ" fill="#fdb913" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="activity-card">
        <div className="activity-card__title">Hoạt Động Gần Đây</div>
        <div className="activity-list">
          {recentActivities.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-item__avatar">{item.name.charAt(0)}</div>
              <div className="activity-item__info">
                <div className="activity-item__name">{item.name}</div>
                <div className="activity-item__action">{item.action}</div>
              </div>
              <div className={`activity-item__dot activity-item__dot--${item.status}`} />
              <div className="activity-item__time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
