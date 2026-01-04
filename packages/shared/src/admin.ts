import type {
  ArtistLocation,
  ArtistProfile,
  ArtistServiceOffering,
  PortfolioImage,
} from './artists.js';

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
  portfolioImages?: PortfolioImage[] | null;
  services?: ArtistServiceOffering[] | null;
  yearsExperience?: number | null;
}

export interface ArtistListItem {
  id: string;
  userId: string;
  stageName: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  verificationStatus: ArtistProfile['verificationStatus'];
  isAcceptingBookings: boolean;
  averageRating: number | null;
  totalReviews: number;
  totalServices: number;
  createdAt: string;
  verifiedAt: string | null;
}

export interface ArtistDetail extends ArtistListItem {
  bio: string | null;
  specialties: string[];
  yearsExperience: number;
  businessVerified: boolean;
  businessRegistrationNumber: string | null;
  serviceRadiusKm: number;
  primaryLocation: ArtistLocation | null;
  portfolioImages: PortfolioImage[];
  services: ArtistServiceOffering[];
  completedServices: number;
  cancelledServices: number;
  profileImageUrl: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
}
