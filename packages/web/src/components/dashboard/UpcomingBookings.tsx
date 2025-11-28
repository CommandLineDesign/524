interface BookingItem {
  id: string;
  customerName: string;
  time: string;
  service: string;
  status: 'confirmed' | 'pending';
}

const demoBookings: BookingItem[] = [
  { id: 'BK-2401', customerName: '김지수', time: '오늘 · 14:00', service: '메이크업 – 소개팅', status: 'confirmed' },
  { id: 'BK-2402', customerName: '이서연', time: '오늘 · 17:30', service: '헤어 + 메이크업 – 웨딩', status: 'pending' },
  { id: 'BK-2403', customerName: '박민주', time: '내일 · 09:00', service: '헤어 – 사진촬영', status: 'confirmed' }
];

export function UpcomingBookings() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">다가오는 예약</h2>
        <button className="text-sm font-medium text-primary">전체 보기</button>
      </div>
      <ul className="mt-6 space-y-4">
        {demoBookings.map((booking) => (
          <li key={booking.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{booking.customerName}</p>
              <p className="text-xs text-slate-500">{booking.service}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{booking.time}</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {booking.status === 'confirmed' ? '확정' : '대기'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

