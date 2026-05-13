import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { DARK_TOOLTIP } from '../../data/dashboardGiangVienData';
import type { WeeklyTeachingData, TopicScore } from '../../types';

interface ChartsSectionProps {
  weeklyData: WeeklyTeachingData[];
  topicScores: TopicScore[];
}

export function ChartsSection({ weeklyData, topicScores }: ChartsSectionProps) {
  return (
    <div className="gv-charts-row">
      <ChartCard title="Teaching Hours & Students per Week" variant="dark">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={weeklyData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#888888' }} />
            <YAxis domain={[0, 60]} tick={{ fontSize: 12, fill: '#888888' }} />
            <Tooltip {...DARK_TOOLTIP} />
            <Legend wrapperStyle={{ color: '#888888', fontSize: 12 }} />
            <Line type="monotone" dataKey="gioDay" name="Teaching hours" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="hocVien" name="Students" stroke="#fdb913" strokeWidth={2} dot={{ r: 4, fill: '#fdb913' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average Score by Topic" variant="dark">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={topicScores} cx="50%" cy="50%" outerRadius={90} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: '#888888' }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} tickCount={4} />
            <Radar name="Avg. Score" dataKey="score" stroke="#fdb913" fill="#fdb913" fillOpacity={0.35} dot={{ r: 4, fill: '#fdb913' } as object} />
            <Tooltip {...DARK_TOOLTIP} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
