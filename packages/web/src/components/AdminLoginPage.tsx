import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

const AdminLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({});
    } catch (error) {
      notify('Failed to sign in as admin', { type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          width: 420,
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          background: '#fff',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Admin Dashboard</h2>
        <p style={{ marginTop: 0, color: '#555' }}>
          This environment uses mock authentication. Click below to sign in as a mock admin.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#1976d2',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in as Admin'}
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
