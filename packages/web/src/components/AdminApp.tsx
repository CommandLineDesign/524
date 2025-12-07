'use client';

import { Admin, Resource } from 'react-admin';

import { adminAuthProvider } from '../lib/adminAuthProvider';
import { adminDataProvider } from '../lib/adminDataProvider';
import AdminLoginPage from './AdminLoginPage';
import PendingArtistEdit from './pendingArtists/PendingArtistEdit';
import PendingArtistShow from './pendingArtists/PendingArtistShow';
import PendingArtistsList from './pendingArtists/PendingArtistsList';

const AdminApp = () => (
  <Admin
    dataProvider={adminDataProvider}
    authProvider={adminAuthProvider}
    requireAuth
    loginPage={AdminLoginPage}
  >
    <Resource
      name="pending-artists"
      list={PendingArtistsList}
      show={PendingArtistShow}
      edit={PendingArtistEdit}
      options={{ label: 'Pending Artists' }}
    />
  </Admin>
);

export default AdminApp;
