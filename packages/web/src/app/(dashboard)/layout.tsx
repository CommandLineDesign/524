import type { ReactNode } from 'react';

import { Sidebar } from '../../components/dashboard/Sidebar';
import { TopBar } from '../../components/dashboard/TopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

