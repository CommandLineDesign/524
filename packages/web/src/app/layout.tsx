import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '524 Admin',
  description: '524 Beauty Marketplace Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
