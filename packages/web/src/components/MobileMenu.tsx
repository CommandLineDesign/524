'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'classnames';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: '대시보드' },
  { href: '/dashboard/bookings', label: '예약 관리' },
  { href: '/dashboard/artists', label: '아티스트 관리' },
  { href: '/dashboard/messages', label: '메시지' },
  { href: '/dashboard/payouts', label: '정산' },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl bg-white shadow-md transition hover:shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        <span
          className={clsx(
            'h-0.5 w-6 bg-slate-900 transition-all duration-300',
            isOpen && 'translate-y-2 rotate-45'
          )}
        />
        <span className={clsx('h-0.5 w-6 bg-slate-900 transition-all duration-300', isOpen && 'opacity-0')} />
        <span
          className={clsx(
            'h-0.5 w-6 bg-slate-900 transition-all duration-300',
            isOpen && '-translate-y-2 -rotate-45'
          )}
        />
      </button>

      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">524</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Navigation</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <span>{item.label}</span>
                    <svg
                      className={clsx('h-5 w-5', isActive ? 'text-white' : 'text-slate-400')}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>

            {/* Account Section */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Account</p>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span>My Profile</span>
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span>Settings</span>
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span>Help & Support</span>
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6">
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

