import type { ArtistProfile } from './artists.js';

export interface PendingArtistListItem {
  id: string;
  userId: string;
  stageName: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  signupDate: string;
  verificationStatus: ArtistProfile['verificationStatus'];
}

export interface PendingArtistDetail extends PendingArtistListItem {
  bio?: string | null;
  specialties?: string[] | null;
}
