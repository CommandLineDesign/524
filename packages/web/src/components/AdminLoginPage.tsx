import { FormEvent, useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

const ADMIN_TEST_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'password@1234',
};

const AdminLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Admin login failed', error);
      notify('Invalid admin email or password', { type: 'warning' });
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
      <form onSubmit={handleLogin}>
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
            Sign in with your admin credentials. Use the test account to autofill.
          </p>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 6, color: '#333' }}>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #d0d7de',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 6, color: '#333' }}>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password@1234"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #d0d7de',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                setEmail(ADMIN_TEST_CREDENTIALS.email);
                setPassword(ADMIN_TEST_CREDENTIALS.password);
              }}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #d0d7de',
                borderRadius: 8,
                background: '#f7f7f7',
                color: '#111',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Use admin test account
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: 8,
                background: '#1976d2',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;
