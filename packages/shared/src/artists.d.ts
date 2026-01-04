import type { ServiceType } from './constants';
export interface ArtistLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
export interface ArtistProfile {
  id: string;
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
}
export interface ArtistServiceOffering {
  name: string;
  description?: string;
  price: number;
}
//# sourceMappingURL=artists.d.ts.map
