'use client';

import { Admin, Resource, defaultTheme } from 'react-admin';

import { adminAuthProvider } from '../lib/adminAuthProvider';
import { adminDataProvider } from '../lib/adminDataProvider';
import AdminLoginPage from './AdminLoginPage';
import ArtistEdit from './artists/ArtistEdit';
import ArtistShow from './artists/ArtistShow';
import ArtistsList from './artists/ArtistsList';
import BookingShow from './bookings/BookingShow';
import BookingsList from './bookings/BookingsList';
import PendingArtistEdit from './pendingArtists/PendingArtistEdit';
import PendingArtistShow from './pendingArtists/PendingArtistShow';
import PendingArtistsList from './pendingArtists/PendingArtistsList';
import ReviewShow from './reviews/ReviewShow';
import ReviewsList from './reviews/ReviewsList';
import UserEdit from './users/UserEdit';
import UserShow from './users/UserShow';
import UsersList from './users/UsersList';

// Custom theme with black focus outlines instead of blue
const customTheme = {
  ...defaultTheme,
  components: {
    ...defaultTheme.components,
    MuiTextField: {
      defaultProps: {
        variant: 'outlined' as const,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#19191b', // Black border on focus
            borderWidth: '2px',
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&:after': {
            borderBottomColor: '#19191b', // Black underline on focus
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          '&:after': {
            borderBottomColor: '#19191b', // Black underline on focus
          },
        },
      },
    },
  },
};

const AdminApp = () => (
  <Admin
    dataProvider={adminDataProvider}
    authProvider={adminAuthProvider}
    requireAuth
    loginPage={AdminLoginPage}
    theme={customTheme}
  >
    <Resource
      name="pending-artists"
      list={PendingArtistsList}
      show={PendingArtistShow}
      edit={PendingArtistEdit}
      options={{ label: 'Pending Artists' }}
    />
    <Resource
      name="artists"
      list={ArtistsList}
      show={ArtistShow}
      edit={ArtistEdit}
      options={{ label: 'Artists' }}
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
    <Resource name="reviews" list={ReviewsList} show={ReviewShow} options={{ label: 'Reviews' }} />
  </Admin>
);

export default AdminApp;
