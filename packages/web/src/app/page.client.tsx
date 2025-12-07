'use client';

import dynamic from 'next/dynamic';

const AdminApp = dynamic(() => import('../components/AdminApp'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f5f5f5',
        color: '#555',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      Loading admin…
    </div>
  ),
});

export default function Home() {
  return <AdminApp />;
}
