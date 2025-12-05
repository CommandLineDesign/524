'use client';

import { Admin, Resource } from 'react-admin';

import { adminAuthProvider } from '../lib/adminAuthProvider.js';
import { adminDataProvider } from '../lib/adminDataProvider.js';
import AdminLoginPage from './AdminLoginPage.js';
import PendingArtistShow from './pendingArtists/PendingArtistShow.js';
import PendingArtistsList from './pendingArtists/PendingArtistsList.js';

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
      options={{ label: 'Pending Artists' }}
    />
  </Admin>
);

export default AdminApp;
