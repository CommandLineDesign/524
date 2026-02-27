// Booking flow localized strings and options for i18n support
// Based on Figma designs for the multi-step booking flow

import type { ServiceType } from '@524/shared';

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

export type BookingStepKey =
  // Entry path steps
  | 'locationInput'
  | 'serviceSelection'
  // Common flow steps
  | 'occasionSelection'
  | 'scheduleSelection'
  // Artist steps
  | 'artistList'
  | 'bookmarkedArtists'
  // Treatment steps
  | 'treatmentSelection'
  | 'styleSelection'
  // Checkout steps
  | 'paymentConfirmation'
  | 'bookingComplete';

export const BOOKING_STEP_ORDER: BookingStepKey[] = [
  'locationInput',
  'serviceSelection',
  'occasionSelection',
  'scheduleSelection',
  'artistList',
  'treatmentSelection',
  'styleSelection',
  'paymentConfirmation',
  'bookingComplete',
];

// =============================================================================
// LOCATION INPUT SCREEN
// =============================================================================

export const locationStrings = {
  title: '어디서 서비스를 받으실 건가요?',
  placeholder: '주소를 입력해주세요',
  searchButton: '검색',
  recentAddresses: '최근 주소',
  useCurrentLocation: '현재 위치 사용',
} as const;

// =============================================================================
// CELEBRITY INPUT SCREENS
// =============================================================================

export const celebrityInputStrings = {
  step1: {
    title: '비슷하다고 들어본 연예인이 있나요?',
    subtitle: '주변에서 닮았다고 들어본 연예인이 있다면 알려주세요',
    placeholder: '연예인 이름을 입력해주세요',
    skip: '건너뛰기',
  },
  step2: {
    title: '비슷한 이미지를 원하는 연예인이 있나요?',
    subtitle: '원하는 스타일의 연예인 이름을 알려주세요',
    placeholder: '연예인 이름을 입력해주세요',
    skip: '건너뛰기',
  },
  step3: {
    title: '예쁘다고 생각하는 연예인이 있나요?',
    subtitle: '동경하거나 예쁘다고 생각하는 연예인을 알려주세요',
    placeholder: '연예인 이름을 입력해주세요',
    skip: '건너뛰기',
  },
  result: {
    title: (name: string) => `나는 오늘 ${name}`,
    subtitle: '당신만의 특별한 스타일을 찾아드릴게요',
    continue: '계속하기',
    retry: '다시 선택하기',
  },
} as const;

// =============================================================================
// IDOL INPUT SCREENS (Dropdown Selection Flow)
// =============================================================================

/** Default fallback idol when no selection is made (should not occur in normal flow) */
export const DEFAULT_IDOL = '아이유';

export const idolInputStrings = {
  step1: {
    label: '한 번이라도 비슷하다고 들어본 연예인',
    placeholder: '이름',
  },
  step2: {
    label: '비슷한 이미지의 연예인',
    placeholder: '이름',
  },
  step3: {
    label: '내가 예쁘다고 생각하는 연예인',
    placeholder: '이름',
  },
  result: {
    prefix: '나는 오늘',
    continueButton: '예약 시작하기',
  },
} as const;

// =============================================================================
// SERVICE SELECTION SCREEN
// =============================================================================

export type ExtendedServiceType = ServiceType | 'beautyLesson' | 'nail';

export interface ServiceOption {
  id: ExtendedServiceType;
  label: string;
  /** Description for accessibility and future UI expansion. Empty string if not displayed. */
  description: string;
  icon?: string;
}

// Full service options with descriptions (for future use)
export const serviceOptionsWithDescriptions: ServiceOption[] = [
  {
    id: 'combo',
    label: '헤어 메이크업',
    description: '헤어와 메이크업을 함께 받는 풀 패키지',
  },
  {
    id: 'hair',
    label: '헤어',
    description: '스타일링, 드라이, 업스타일 등 헤어 전문 서비스',
  },
  {
    id: 'makeup',
    label: '메이크업',
    description: '데일리, 데이트, 웨딩 등 맞춤 메이크업',
  },
  {
    id: 'beautyLesson',
    label: '뷰티 레슨',
    description: '나에게 맞는 메이크업 방법을 배워보세요',
  },
  {
    id: 'nail',
    label: '네일아트',
    description: '젤네일, 케어, 아트 등 네일 전문 서비스',
  },
];

// Current service options (simple, no descriptions - matches Figma design)
export const serviceOptions: ServiceOption[] = [
  {
    id: 'combo',
    label: '헤어 메이크업',
    description: '', // No description in current design
  },
  {
    id: 'hair',
    label: '헤어',
    description: '',
  },
  {
    id: 'makeup',
    label: '메이크업',
    description: '',
  },
];

export const serviceSelectionStrings = {
  title: '어떤 서비스를 받고 싶으세요?',
  subtitle: '서비스 유형을 선택하시면 맞춤 아티스트를 추천해 드립니다.', // Not used in current design
  continueButton: '다음',
} as const;

// =============================================================================
// OCCASION SELECTION SCREEN
// =============================================================================

export interface OccasionCategory {
  id: string;
  title: string;
  occasions: string[];
}

export const occasionCategories: OccasionCategory[] = [
  {
    id: 'wedding',
    title: '웨딩',
    occasions: ['결혼식', '신부화장', '전날제', '본식'],
  },
  {
    id: 'family',
    title: '가족 행사',
    occasions: ['상견례', '돌잔치', '환갑/고희'],
  },
  {
    id: 'social',
    title: '소셜 & 데이트',
    occasions: ['소개팅', '데이트', '미팅', '동창회'],
  },
  {
    id: 'professional',
    title: '프로페셔널',
    occasions: ['면접', '비즈니스 미팅', '승무원'],
  },
  {
    id: 'photo',
    title: '사진 촬영',
    occasions: ['프로필 사진', '바디프로필', '증명사진', '화보'],
  },
  {
    id: 'performance',
    title: '공연 & 행사',
    occasions: ['미인대회', '발표회', '무대', '방송출연'],
  },
  {
    id: 'daily',
    title: '데일리',
    occasions: ['출근룩', '일상', '여행'],
  },
];

export const occasionSelectionStrings = {
  title: '오늘의 일정은 무엇인가요?',
  subtitle: '일정을 선택하면 맞춤 아티스트와 서비스 추천을 도와드릴게요.',
} as const;

// =============================================================================
// BOOKING METHOD SCREEN
// =============================================================================

export type BookingMethodType = 'byDateTime' | 'byArtist' | 'bookmarked' | 'nearby';

export interface BookingMethodOption {
  id: BookingMethodType;
  label: string;
  description: string;
  icon?: string;
}

// 2-option variant (for celebrity flow)
export const bookingMethodOptions2: BookingMethodOption[] = [
  {
    id: 'byDateTime',
    label: '날짜·시간으로 찾기',
    description: '원하는 날짜와 시간에 가능한 아티스트를 찾아요',
  },
  {
    id: 'byArtist',
    label: '아티스트로 찾기',
    description: '마음에 드는 아티스트를 먼저 선택해요',
  },
];

// 3-option variant (for direct flow)
export const bookingMethodOptions3: BookingMethodOption[] = [
  {
    id: 'bookmarked',
    label: '북마크한 아티스트',
    description: '저장해둔 아티스트 목록에서 선택해요',
  },
  {
    id: 'nearby',
    label: '근처 아티스트',
    description: '내 위치 기준 가까운 아티스트를 찾아요',
  },
  {
    id: 'byDateTime',
    label: '날짜·시간으로 찾기',
    description: '원하는 날짜와 시간에 가능한 아티스트를 찾아요',
  },
];

export const bookingMethodStrings = {
  title: '어떻게 찾으시겠어요?',
  subtitle: '편한 방법으로 아티스트를 찾아보세요.',
} as const;

// =============================================================================
// SCHEDULE SELECTION SCREEN
// =============================================================================

export const scheduleStrings = {
  title: '일정 선택',
  subtitle: '',
  dateLabel: '',
  timeLabel: '',
  amLabel: '오전',
  pmLabel: '오후',
  noAvailableSlots: '선택한 날짜에 가능한 시간이 없습니다',
  selectAnotherDate: '다른 날짜를 선택해주세요',
} as const;

export const timeSlots = {
  am: [
    '00:00',
    '00:30',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
  ],
  pm: [
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
  ],
} as const;

export const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'] as const;
export const monthNames = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
] as const;

// =============================================================================
// ARTIST LIST SCREEN
// =============================================================================

export type ArtistSortType = 'popular' | 'reviews' | 'priceLow' | 'priceHigh' | 'distance';

export interface ArtistSortOption {
  id: ArtistSortType;
  label: string;
}

export const artistSortOptions: ArtistSortOption[] = [
  { id: 'popular', label: '인기순' },
  { id: 'reviews', label: '리뷰순' },
  { id: 'priceLow', label: '가격 낮은순' },
  { id: 'priceHigh', label: '가격 높은순' },
  { id: 'distance', label: '거리순' },
];

export const artistListStrings = {
  title: '아티스트 선택',
  subtitle: '마음에 드는 아티스트를 선택해주세요',
  sortButton: '정렬',
  filterButton: '필터',
  noResults: '조건에 맞는 아티스트가 없습니다',
  adjustFilters: '필터를 조정해주세요',
  reviewCount: (count: number) => `리뷰 ${count}개`,
  distance: (km: number) => `${km}km`,
  priceFrom: (price: number) => `${price.toLocaleString()}원~`,
  bookmarkedTitle: '북마크한 아티스트',
  bookmarkedEmpty: '북마크한 아티스트가 없습니다',
  nearbyTitle: '근처 아티스트',
} as const;

// =============================================================================
// TREATMENT SELECTION SCREEN
// =============================================================================

export type TreatmentCategory = 'cut' | 'perm' | 'dry' | 'color' | 'clinic';

export interface TreatmentCategoryOption {
  id: TreatmentCategory;
  label: string;
}

export const treatmentCategories: TreatmentCategoryOption[] = [
  { id: 'cut', label: '컷' },
  { id: 'perm', label: '펌' },
  { id: 'dry', label: '드라이' },
  { id: 'color', label: '염색' },
  { id: 'clinic', label: '클리닉' },
];

export interface TreatmentItem {
  id: string;
  category: TreatmentCategory;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

// Sample treatment items - these would come from API in production
export const sampleTreatments: TreatmentItem[] = [
  { id: 'cut-basic', category: 'cut', name: '기본 커트', price: 30000, durationMinutes: 30 },
  { id: 'cut-designer', category: 'cut', name: '디자이너 커트', price: 50000, durationMinutes: 45 },
  { id: 'perm-basic', category: 'perm', name: '기본 펌', price: 80000, durationMinutes: 90 },
  { id: 'perm-digital', category: 'perm', name: '디지털 펌', price: 120000, durationMinutes: 120 },
  { id: 'dry-basic', category: 'dry', name: '기본 드라이', price: 20000, durationMinutes: 20 },
  {
    id: 'dry-styling',
    category: 'dry',
    name: '스타일링 드라이',
    price: 35000,
    durationMinutes: 30,
  },
  { id: 'color-basic', category: 'color', name: '기본 염색', price: 60000, durationMinutes: 60 },
  {
    id: 'color-highlight',
    category: 'color',
    name: '하이라이트',
    price: 100000,
    durationMinutes: 90,
  },
  {
    id: 'clinic-basic',
    category: 'clinic',
    name: '기본 클리닉',
    price: 40000,
    durationMinutes: 30,
  },
  {
    id: 'clinic-premium',
    category: 'clinic',
    name: '프리미엄 클리닉',
    price: 80000,
    durationMinutes: 45,
  },
];

export const treatmentSelectionStrings = {
  title: '시술을 선택해주세요',
  subtitle: '받으실 시술을 선택해주세요',
  selectedCount: (count: number) => `${count}개 선택됨`,
  totalPrice: (price: number) => `총 ${price.toLocaleString()}원`,
  estimatedTime: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `예상 ${hours}시간 ${mins}분`;
    if (hours > 0) return `예상 ${hours}시간`;
    return `예상 ${mins}분`;
  },
} as const;

// =============================================================================
// STYLE SELECTION SCREEN
// =============================================================================

export const styleSelectionStrings = {
  title: '원하는 스타일을 선택해주세요',
  subtitle: '참고할 스타일 이미지를 선택하거나 직접 업로드해주세요',
  uploadFromCamera: '카메라로 촬영',
  uploadFromGallery: '갤러리에서 선택',
  maxSelection: (max: number) => `최대 ${max}개까지 선택 가능`,
  selectedCount: (count: number, max: number) => `${count}/${max}개 선택됨`,
} as const;

export interface StyleOption {
  id: string;
  imageUrl: string;
  label: string;
}

/**
 * Default style options for style selection screen.
 * NOTE: This is placeholder data. In production, these should be fetched from
 * an API endpoint that returns artist-specific or global style catalog data.
 */
export const defaultStyleOptions: StyleOption[] = [
  { id: 'style-1', imageUrl: 'https://placeholder.com/style1.jpg', label: '내추럴' },
  { id: 'style-2', imageUrl: 'https://placeholder.com/style2.jpg', label: '글래머' },
  { id: 'style-3', imageUrl: 'https://placeholder.com/style3.jpg', label: '청순' },
  { id: 'style-4', imageUrl: 'https://placeholder.com/style4.jpg', label: '섹시' },
  { id: 'style-5', imageUrl: 'https://placeholder.com/style5.jpg', label: '러블리' },
  { id: 'style-6', imageUrl: 'https://placeholder.com/style6.jpg', label: '시크' },
];

// =============================================================================
// PAYMENT CONFIRMATION SCREEN
// =============================================================================

export const paymentStrings = {
  title: '예약 확인',
  subtitle: '예약 정보를 확인해주세요',
  sections: {
    artist: '아티스트',
    dateTime: '날짜 및 시간',
    services: '선택한 시술',
    location: '장소',
    occasion: '일정',
    notes: '요청사항',
  },
  notesPlaceholder: '아티스트에게 전달할 요청사항을 입력해주세요',
  priceBreakdown: {
    subtotal: '시술 금액',
    discount: '할인',
    total: '총 결제 금액',
  },
  confirmButton: '예약하기',
  termsNotice: '예약하기 버튼을 누르면 이용약관에 동의하는 것으로 간주됩니다.',
} as const;

// =============================================================================
// BOOKING COMPLETE SCREEN
// =============================================================================

export const bookingCompleteStrings = {
  title: '예약이 완료되었습니다!',
  subtitle: '아티스트가 예약을 확인하면 알림을 보내드릴게요',
  bookingNumber: (id: string) => `예약번호: ${id}`,
  viewDetails: '예약 상세 보기',
  goHome: '홈으로 가기',
  addToCalendar: '캘린더에 추가',
} as const;

// =============================================================================
// COMMON UI STRINGS
// =============================================================================

export const commonStrings = {
  continue: '계속',
  back: '뒤로',
  skip: '건너뛰기',
  cancel: '취소',
  confirm: '확인',
  save: '저장',
  select: '선택',
  search: '검색',
  loading: '로딩 중...',
  error: '오류가 발생했습니다',
  retry: '다시 시도',
  noResults: '결과가 없습니다',
  required: '필수',
  optional: '선택',
  priceUnit: '원',
} as const;

// =============================================================================
// FLOW CONFIGURATION
// =============================================================================

export const flowConfig = {
  // Total steps shown in progress bar for each flow
  celebrityFlowSteps: 8,
  directFlowSteps: 7,

  // Max selections
  maxStyleSelections: 3,
  maxTreatmentSelections: 5,

  // Default values
  defaultSortType: 'popular' as ArtistSortType,
} as const;
