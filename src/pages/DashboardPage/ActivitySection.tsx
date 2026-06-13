import { SectionCard } from '../../components/ui/SectionCard';
import { Avatar } from '../../components/ui/Avatar';
import type { AdminRecentActivity } from '@/types/analytics.types';

interface ActivitySectionProps {
  activities: AdminRecentActivity[];
}

export function ActivitySection({ activities }: ActivitySectionProps) {
  return (
    <SectionCard title="Hoạt Động Gần Đây" variant="dark">
      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <Avatar initials={item.type.charAt(0).toUpperCase()} size="md" />
            <div className="activity-item__info">
              <div className="activity-item__name">{item.title}</div>
              <div className="activity-item__action">{item.description}</div>
            </div>
            <div className="activity-item__time">
              {new Date(item.occurredAt).toLocaleString('vi-VN')}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
