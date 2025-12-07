'use client';

import { Admin, Resource } from 'react-admin';

import { adminAuthProvider } from '../lib/adminAuthProvider';
import { adminDataProvider } from '../lib/adminDataProvider';
import AdminLoginPage from './AdminLoginPage';
import BookingShow from './bookings/BookingShow';
import BookingsList from './bookings/BookingsList';
import PendingArtistEdit from './pendingArtists/PendingArtistEdit';
import PendingArtistShow from './pendingArtists/PendingArtistShow';
import PendingArtistsList from './pendingArtists/PendingArtistsList';
import UserEdit from './users/UserEdit';
import UserShow from './users/UserShow';
import UsersList from './users/UsersList';

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
    <Resource
      name="bookings"
      list={BookingsList}
      show={BookingShow}
      options={{ label: 'Bookings' }}
    />
    <Resource
      name="users"
      list={UsersList}
      show={UserShow}
      edit={UserEdit}
      options={{ label: 'Users' }}
    />
  </Admin>
);

export default AdminApp;
