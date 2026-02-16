import type { ServiceType } from './constants';

export interface ArtistLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ArtistProfile {
  /**
   * Artist profile ID (artistProfiles.id)
   * Primary identifier for artist profiles in public APIs
   */
  id: string;
  /**
   * User ID (users.id)
   * References the user account that owns this artist profile
   * Used for authenticated operations via /api/v1/artists/me/* endpoints
   */
  userId: string;
  stageName: string;
  bio: string;
  specialties: ServiceType[] | string[];
  yearsExperience: number;
  businessVerified: boolean;
  businessRegistrationNumber?: string | null;
  serviceRadiusKm: number;
  primaryLocation: ArtistLocation;
  isAcceptingBookings: boolean;
  verificationStatus: 'pending_review' | 'in_review' | 'verified' | 'rejected' | 'suspended';
  averageRating: number;
  totalReviews: number;
  totalServices: number;
  portfolioImages?: PortfolioImage[];
  services?: ArtistServiceOffering[];
  profileImageUrl?: string;
}

export interface ArtistSearchFilters {
  query?: string;
  occasion?: string;
  serviceType?: ServiceType | string;
}

export interface ArtistSearchResult {
  /**
   * Artist profile ID (artistProfiles.id)
   * Use this ID for navigation and public API calls like GET /api/v1/artists/:artistId
   * NOTE: This is NOT the user ID - it's the artist profile ID
   */
  id: string;
  stageName: string;
  specialties: string[];
  averageRating: number;
  reviewCount: number;
  priceRange: [number, number];
  profileImageUrl?: string | null;
}

export interface PortfolioImage {
  url: string;
  caption?: string;
  serviceCategory?: ServiceType;
}

export interface ArtistServiceOffering {
  name: string;
  description?: string;
  price: number;
}
