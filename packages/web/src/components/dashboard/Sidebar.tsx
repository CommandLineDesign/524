'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'classnames';

const navItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/dashboard/bookings', label: '예약 관리' },
  { href: '/dashboard/artists', label: '아티스트 관리' },
  { href: '/dashboard/messages', label: '메시지' },
  { href: '/dashboard/payouts', label: '정산' }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white/90 px-6 py-10 shadow-sm lg:block">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">524</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">아티스트 센터</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

