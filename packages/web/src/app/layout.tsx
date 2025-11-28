import type { Metadata } from 'next';
import './globals.css';

import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: '524 – Beauty Services Marketplace',
  description: 'Korean beauty services marketplace connecting customers with professional artists.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


