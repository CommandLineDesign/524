import { Title } from 'react-admin';

const Dashboard = () => (
  <div style={{ padding: '20px' }}>
    <Title title="Dashboard" />
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Welcome to 524 Admin Dashboard</h2>
      <p>Select a menu item to get started:</p>
      <ul style={{ lineHeight: '1.8' }}>
        <li>
          <strong>Pending Artists</strong> - Review and approve artist applications
        </li>
        <li>
          <strong>Bookings</strong> - View and manage bookings
        </li>
        <li>
          <strong>Users</strong> - Manage user accounts
        </li>
      </ul>
    </div>
  </div>
);

export default Dashboard;
