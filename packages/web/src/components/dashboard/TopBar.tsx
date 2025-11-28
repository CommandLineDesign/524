'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MobileMenu } from '../MobileMenu';

const todayLabel = format(new Date(), 'PPP EEEE', { locale: ko });

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <MobileMenu />
        <div>
          <p className="text-sm text-slate-500">오늘은</p>
          <h1 className="text-xl font-semibold text-slate-900">{todayLabel}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary sm:block">
          새로운 예약 만들기
        </button>
        <div className="h-10 w-10 rounded-full bg-primary/90 text-center text-white">
          <span className="leading-10">SY</span>
        </div>
      </div>
    </header>
  );
}

