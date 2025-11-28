import { StatCard } from '../../../components/ui/StatCard';
import { UpcomingBookings } from '../../../components/dashboard/UpcomingBookings';

const stats = [
  { title: '오늘 예약', value: '5건', delta: '+2.4% vs 어제' },
  { title: '이번 달 매출', value: '₩4,320,000', delta: '+12.8% vs 지난달' },
  { title: '평균 리뷰', value: '4.9 / 5' }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <UpcomingBookings />
    </div>
  );
}

