// Re-export shared geocoding types for backward compatibility
export type {
  GeocodingResult,
  KeywordSearchResult,
  ReverseGeocodeResult,
  MapAddressPickerResult,
} from '@524/shared';

/**
 * Result from the Daum Postcode service when a user selects an address.
 * This type is specific to the mobile package (Daum Postcode widget).
 */
export interface DaumPostcodeResult {
  /** Postal code (5-digit) */
  zonecode: string;
  /** Primary address (either road or jibun based on addressType) */
  address: string;
  /** Address type: R = road-based, J = jibun (lot-number) based */
  addressType: 'R' | 'J';
  /** Road-based address (e.g., "서울특별시 강남구 테헤란로 123") */
  roadAddress: string;
  /** Lot-number based address (e.g., "서울특별시 강남구 역삼동 123-45") */
  jibunAddress: string;
  /** Building name if available */
  buildingName: string;
  /** Province/Metropolitan city (e.g., "서울특별시") */
  sido: string;
  /** City/District (e.g., "강남구") */
  sigungu: string;
  /** Neighborhood name (e.g., "역삼동") */
  bname: string;
  /** Road name (e.g., "테헤란로") */
  roadname: string;
  /** Building main number */
  buildingCode: string;
  /** User-selected type: 'R' for road, 'J' for jibun */
  userSelectedType: 'R' | 'J';
  /** English address */
  addressEnglish: string;
  /** English road address */
  roadAddressEnglish: string;
  /** English jibun address */
  jibunAddressEnglish: string;
}
