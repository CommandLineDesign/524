import { create } from 'zustand';

import type { BookedService, CreateBookingPayload, ServicePrices, ServiceType } from '@524/shared';
import { DEV_DEFAULT_LOCATION } from '@524/shared';

import type {
  ArtistSortType,
  BookingMethodType,
  BookingStepKey,
  ExtendedServiceType,
  TreatmentCategory,
} from '../constants/bookingOptions';

// =============================================================================
// TYPES
// =============================================================================

export type EntryPath = 'celebrity' | 'direct' | 'homeEntry';

export interface HomeEntryParams {
  artistId: string;
  location: string;
  locationCoordinates: { lat: number; lng: number };
  locationDetail?: string;
  selectedDate: string;
  selectedTimeSlot: string;
  serviceType: 'hair' | 'makeup' | 'combo';
}

export interface CelebrityData {
  lookalike: string | null; // Step 1: 비슷하다고 들어본
  similarImage: string | null; // Step 2: 비슷한 이미지 원하는
  admire: string | null; // Step 3: 예쁘다고 생각하는
}

export interface SelectedTreatment {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: TreatmentCategory;
}

export interface BookingFlowState {
  // Flow control
  entryPath: EntryPath | null;
  currentStep: BookingStepKey;
  stepHistory: BookingStepKey[];
  isFlowComplete: boolean;

  // Location (celebrity flow entry)
  location: string | null;
  locationCoordinates: { lat: number; lng: number } | null;
  locationDetail: string | null;

  // Celebrity data
  celebrities: CelebrityData;
  resultCelebrity: string | null;

  // Booking data
  serviceType: ExtendedServiceType | null;
  occasion: string | null;
  bookingMethod: BookingMethodType | null;
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  selectedArtistId: string | null;

  // Artist list preferences
  artistSortType: ArtistSortType;
  artistFilterApplied: boolean;

  // Treatments & Style
  selectedCategory: TreatmentCategory | null;
  selectedTreatments: SelectedTreatment[];
  selectedStyles: string[]; // Style image IDs or URLs
  customStyleImage: string | null; // User uploaded image

  // Checkout
  customerNotes: string;
  totalAmount: number;
  estimatedDuration: number; // in minutes

  // Created booking reference
  createdBookingId: string | null;
}

export interface BookingFlowActions {
  // Flow control actions
  setEntryPath: (path: EntryPath) => void;
  setStep: (step: BookingStepKey) => void;
  goBack: () => boolean; // Returns false if can't go back
  canGoBack: () => boolean;
  reset: () => void;
  completeFlow: (bookingId: string) => void;

  // Location actions
  setLocation: (address: string, coordinates?: { lat: number; lng: number }) => void;
  setLocationDetail: (detail: string | null) => void;

  // Celebrity actions
  setCelebrityLookalike: (name: string | null) => void;
  setCelebritySimilarImage: (name: string | null) => void;
  setCelebrityAdmire: (name: string | null) => void;
  setResultCelebrity: (name: string | null) => void;

  // Booking data actions
  setServiceType: (serviceType: ExtendedServiceType) => void;
  setOccasion: (occasion: string) => void;
  setBookingMethod: (method: BookingMethodType) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (slot: string) => void;
  setSelectedArtist: (artistId: string | null) => void;

  // Artist list actions
  setArtistSortType: (sortType: ArtistSortType) => void;
  setArtistFilterApplied: (applied: boolean) => void;

  // Treatment actions
  setSelectedCategory: (category: TreatmentCategory | null) => void;
  addTreatment: (treatment: SelectedTreatment) => void;
  removeTreatment: (treatmentId: string) => void;
  clearTreatments: () => void;

  // Style actions
  addStyle: (styleId: string) => void;
  removeStyle: (styleId: string) => void;
  clearStyles: () => void;
  setCustomStyleImage: (imageUri: string | null) => void;

  // Checkout actions
  setCustomerNotes: (notes: string) => void;

  // Home entry action
  initializeFromHome: (params: HomeEntryParams) => void;

  // Computed getters
  getTotalAmount: () => number;
  getEstimatedDuration: () => number;
  getProgressPercent: () => number;
  isServiceTypeValid: () => boolean;
  buildBookingPayload: (
    customerId: string,
    servicePrices?: ServicePrices | null
  ) => CreateBookingPayload | null;
}

export type BookingFlowStore = BookingFlowState & BookingFlowActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialCelebrities: CelebrityData = {
  lookalike: null,
  similarImage: null,
  admire: null,
};

const initialState: BookingFlowState = {
  // Flow control
  entryPath: null,
  currentStep: 'locationInput',
  stepHistory: [],
  isFlowComplete: false,

  // Location
  location: null,
  locationCoordinates: null,
  locationDetail: null,

  // Celebrity data
  celebrities: { ...initialCelebrities },
  resultCelebrity: null,

  // Booking data
  serviceType: null,
  occasion: null,
  bookingMethod: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedArtistId: null,

  // Artist list preferences
  artistSortType: 'popular',
  artistFilterApplied: false,

  // Treatments & Style
  selectedCategory: null,
  selectedTreatments: [],
  selectedStyles: [],
  customStyleImage: null,

  // Checkout
  customerNotes: '',
  totalAmount: 0,
  estimatedDuration: 0,

  // Created booking reference
  createdBookingId: null,
};

// =============================================================================
// STEP FLOW MAPS
// =============================================================================

// Define valid next steps for each step
const STEP_FLOW: Record<BookingStepKey, BookingStepKey[]> = {
  // Entry path steps
  locationInput: ['serviceSelection'],
  serviceSelection: ['scheduleSelection'],

  // Common flow (occasionSelection removed - now handled on payment confirmation screen)
  occasionSelection: ['scheduleSelection'], // Kept for backward compatibility
  scheduleSelection: ['artistList'],

  // Artist steps - go directly to styleSelection (treatmentSelection is skipped)
  artistList: ['styleSelection'],
  bookmarkedArtists: ['styleSelection'],

  // Treatment steps - kept for backward compatibility but treatmentSelection is skipped
  treatmentSelection: ['styleSelection'],
  styleSelection: ['paymentConfirmation'],

  // Checkout
  paymentConfirmation: ['bookingComplete'],
  bookingComplete: [],
};

// Steps specific to celebrity flow (now just includes location input)
const CELEBRITY_FLOW_STEPS: BookingStepKey[] = ['locationInput'];

// Steps specific to direct flow
const DIRECT_FLOW_ENTRY: BookingStepKey = 'serviceSelection';

// =============================================================================
// STORE
// =============================================================================

export const useBookingFlowStore = create<BookingFlowStore>((set, get) => ({
  ...initialState,

  // ===========================================================================
  // Flow Control Actions
  // ===========================================================================

  setEntryPath: (path) => {
    // Each path starts at a different step
    // celebrity: locationInput -> serviceSelection -> ...
    // direct: serviceSelection -> ...
    // homeEntry: styleSelection (with pre-populated data via initializeFromHome)
    let initialStep: BookingStepKey;
    if (path === 'celebrity') {
      initialStep = 'locationInput';
    } else if (path === 'homeEntry') {
      // homeEntry starts at styleSelection since location, service, date, time, and artist are pre-selected
      // treatmentSelection is skipped - using simplified artist pricing model
      // Occasion selection is handled on the payment confirmation screen
      initialStep = 'styleSelection';
    } else {
      // 'direct' starts at serviceSelection
      initialStep = 'serviceSelection';
    }
    set({
      entryPath: path,
      currentStep: initialStep,
      stepHistory: [],
    });
  },

  setStep: (step) => {
    const { currentStep, stepHistory } = get();

    // Don't add duplicate to history
    if (step === currentStep) return;

    set({
      currentStep: step,
      stepHistory: [...stepHistory, currentStep],
    });
  },

  goBack: () => {
    const { stepHistory } = get();
    if (stepHistory.length === 0) return false;

    const previousStep = stepHistory[stepHistory.length - 1];
    set({
      currentStep: previousStep,
      stepHistory: stepHistory.slice(0, -1),
    });
    return true;
  },

  canGoBack: () => {
    const { stepHistory } = get();
    return stepHistory.length > 0;
  },

  reset: () => {
    set({ ...initialState, celebrities: { ...initialCelebrities } });
  },

  completeFlow: (bookingId) => {
    set({
      isFlowComplete: true,
      createdBookingId: bookingId,
      currentStep: 'bookingComplete',
    });
  },

  // ===========================================================================
  // Location Actions
  // ===========================================================================

  setLocation: (address, coordinates) => {
    set({
      location: address,
      locationCoordinates: coordinates ?? null,
    });
  },

  setLocationDetail: (detail) => {
    set({ locationDetail: detail });
  },

  // ===========================================================================
  // Celebrity Actions
  // ===========================================================================

  setCelebrityLookalike: (name) => {
    set((state) => ({
      celebrities: { ...state.celebrities, lookalike: name },
    }));
  },

  setCelebritySimilarImage: (name) => {
    set((state) => ({
      celebrities: { ...state.celebrities, similarImage: name },
    }));
  },

  setCelebrityAdmire: (name) => {
    set((state) => ({
      celebrities: { ...state.celebrities, admire: name },
    }));
  },

  setResultCelebrity: (name) => {
    set({ resultCelebrity: name });
  },

  // ===========================================================================
  // Booking Data Actions
  // ===========================================================================

  setServiceType: (serviceType) => {
    set({ serviceType });
  },

  setOccasion: (occasion) => {
    set({ occasion });
  },

  setBookingMethod: (method) => {
    set({ bookingMethod: method });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  setSelectedTimeSlot: (slot) => {
    set({ selectedTimeSlot: slot });
  },

  setSelectedArtist: (artistId) => {
    set({ selectedArtistId: artistId });
  },

  // ===========================================================================
  // Artist List Actions
  // ===========================================================================

  setArtistSortType: (sortType) => {
    set({ artistSortType: sortType });
  },

  setArtistFilterApplied: (applied) => {
    set({ artistFilterApplied: applied });
  },

  // ===========================================================================
  // Treatment Actions
  // ===========================================================================

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  addTreatment: (treatment) => {
    set((state) => {
      // Prevent duplicates
      if (state.selectedTreatments.some((t) => t.id === treatment.id)) {
        return state;
      }
      const newTreatments = [...state.selectedTreatments, treatment];
      return {
        selectedTreatments: newTreatments,
        totalAmount: newTreatments.reduce((sum, t) => sum + t.price, 0),
        estimatedDuration: newTreatments.reduce((sum, t) => sum + t.durationMinutes, 0),
      };
    });
  },

  removeTreatment: (treatmentId) => {
    set((state) => {
      const newTreatments = state.selectedTreatments.filter((t) => t.id !== treatmentId);
      return {
        selectedTreatments: newTreatments,
        totalAmount: newTreatments.reduce((sum, t) => sum + t.price, 0),
        estimatedDuration: newTreatments.reduce((sum, t) => sum + t.durationMinutes, 0),
      };
    });
  },

  clearTreatments: () => {
    set({
      selectedTreatments: [],
      totalAmount: 0,
      estimatedDuration: 0,
    });
  },

  // ===========================================================================
  // Style Actions
  // ===========================================================================

  addStyle: (styleId) => {
    set((state) => {
      if (state.selectedStyles.includes(styleId)) return state;
      // Max 3 styles
      if (state.selectedStyles.length >= 3) return state;
      return {
        selectedStyles: [...state.selectedStyles, styleId],
      };
    });
  },

  removeStyle: (styleId) => {
    set((state) => ({
      selectedStyles: state.selectedStyles.filter((id) => id !== styleId),
    }));
  },

  clearStyles: () => {
    set({ selectedStyles: [], customStyleImage: null });
  },

  setCustomStyleImage: (imageUri) => {
    set({ customStyleImage: imageUri });
  },

  // ===========================================================================
  // Checkout Actions
  // ===========================================================================

  setCustomerNotes: (notes) => {
    set({ customerNotes: notes });
  },

  // ===========================================================================
  // Home Entry Action
  // ===========================================================================

  initializeFromHome: (params) => {
    // Initialize the store with pre-selected values from home screen
    // This starts the flow at styleSelection with artist, location, time, and service already set
    // treatmentSelection is skipped - using simplified artist pricing model
    // Occasion selection is handled on the payment confirmation screen
    set({
      ...initialState,
      celebrities: { ...initialCelebrities },
      entryPath: 'homeEntry',
      currentStep: 'styleSelection',
      stepHistory: [],
      selectedArtistId: params.artistId,
      location: params.location,
      locationCoordinates: params.locationCoordinates,
      locationDetail: params.locationDetail ?? null,
      selectedDate: params.selectedDate,
      selectedTimeSlot: params.selectedTimeSlot,
      serviceType: params.serviceType,
    });
  },

  // ===========================================================================
  // Computed Getters
  // ===========================================================================

  getTotalAmount: () => {
    const { selectedTreatments } = get();
    return selectedTreatments.reduce((sum, t) => sum + t.price, 0);
  },

  getEstimatedDuration: () => {
    const { selectedTreatments } = get();
    return selectedTreatments.reduce((sum, t) => sum + t.durationMinutes, 0);
  },

  getProgressPercent: () => {
    const { entryPath, currentStep } = get();

    // Define step indices for progress calculation
    // treatmentSelection is skipped - using simplified artist pricing model
    // Occasion selection is handled on the payment confirmation screen
    const celebritySteps: BookingStepKey[] = [
      'locationInput',
      'serviceSelection',
      'scheduleSelection',
      'artistList',
      // 'treatmentSelection', // SKIP - using simplified artist pricing
      'styleSelection',
      'paymentConfirmation',
      'bookingComplete',
    ];

    const directSteps: BookingStepKey[] = [
      'serviceSelection',
      'scheduleSelection',
      'artistList',
      // 'treatmentSelection', // SKIP - using simplified artist pricing
      'styleSelection',
      'paymentConfirmation',
      'bookingComplete',
    ];

    // Home entry flow skips location/service/schedule/artist selection since those are pre-set
    // treatmentSelection is skipped - using simplified artist pricing model
    // Occasion selection is handled on the payment confirmation screen
    const homeEntrySteps: BookingStepKey[] = [
      // 'treatmentSelection', // SKIP - using simplified artist pricing
      'styleSelection',
      'paymentConfirmation',
      'bookingComplete',
    ];

    let steps: BookingStepKey[];
    if (entryPath === 'celebrity') {
      steps = celebritySteps;
    } else if (entryPath === 'homeEntry') {
      steps = homeEntrySteps;
    } else {
      steps = directSteps;
    }

    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / steps.length) * 100;
  },

  isServiceTypeValid: () => {
    const { serviceType } = get();
    return serviceType !== null;
  },

  buildBookingPayload: (customerId: string, servicePrices?: ServicePrices | null) => {
    const state = get();
    const {
      selectedArtistId,
      serviceType,
      occasion,
      selectedDate,
      selectedTimeSlot,
      selectedTreatments,
      location,
      customerNotes,
    } = state;

    // Validate required fields
    if (!selectedArtistId || !serviceType || !selectedDate) {
      return null;
    }

    // Convert ExtendedServiceType to ServiceType for API compatibility
    // ExtendedServiceType includes UI-only options like 'beautyLesson' and 'nail'
    // ServiceType is the API contract: 'hair' | 'makeup' | 'combo'
    // Non-standard service types default to 'combo'
    const validServiceType: ServiceType =
      serviceType === 'hair' || serviceType === 'makeup' || serviceType === 'combo'
        ? serviceType
        : 'combo';

    // Build services from artist service prices (simplified pricing model)
    // If service prices provided, use them; otherwise fall back to selectedTreatments
    let services: BookedService[];

    if (servicePrices) {
      services = [];
      if ((serviceType === 'hair' || serviceType === 'combo') && servicePrices.hair) {
        services.push({
          id: 'hair',
          name: '헤어',
          durationMinutes: 60,
          price: servicePrices.hair,
        });
      }
      if ((serviceType === 'makeup' || serviceType === 'combo') && servicePrices.makeup) {
        services.push({
          id: 'makeup',
          name: '메이크업',
          durationMinutes: 60,
          price: servicePrices.makeup,
        });
      }
    } else {
      // Fall back to selectedTreatments (legacy behavior)
      services = selectedTreatments.map((treatment) => ({
        id: treatment.id,
        name: treatment.name,
        durationMinutes: treatment.durationMinutes,
        price: treatment.price,
      }));
    }

    // Require at least one service
    if (services.length === 0) {
      return null;
    }

    // Calculate totals from services
    const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
    const estimatedDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

    // Build correct start time by combining selectedDate with selectedTimeSlot
    // This ensures the booking uses the user's current time selection, not a stale time
    // embedded in the date string from when it was originally set
    const startTime = new Date(selectedDate);
    if (selectedTimeSlot) {
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
    }
    const endTime = new Date(startTime.getTime() + estimatedDuration * 60 * 1000);

    return {
      customerId,
      artistId: selectedArtistId,
      serviceType: validServiceType,
      occasion,
      scheduledDate: selectedDate,
      scheduledStartTime: startTime.toISOString(),
      scheduledEndTime: endTime.toISOString(),
      totalAmount,
      services,
      // Use provided location coordinates or fallback to default location
      // DEV_DEFAULT_LOCATION is a shared constant used as a fallback when no location is provided
      // In production, this ensures the booking can still be created while prompting user to update
      location: state.locationCoordinates
        ? {
            latitude: state.locationCoordinates.lat,
            longitude: state.locationCoordinates.lng,
            addressLine: location || DEV_DEFAULT_LOCATION.addressLine,
            detailAddress: state.locationDetail || undefined,
          }
        : DEV_DEFAULT_LOCATION,
      notes: customerNotes || undefined,
    };
  },
}));

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

export const selectCurrentStep = (state: BookingFlowStore) => state.currentStep;
export const selectEntryPath = (state: BookingFlowStore) => state.entryPath;
export const selectCanGoBack = (state: BookingFlowStore) => state.stepHistory.length > 0;
export const selectSelectedTreatments = (state: BookingFlowStore) => state.selectedTreatments;
export const selectTotalAmount = (state: BookingFlowStore) => state.totalAmount;
export const selectSelectedArtist = (state: BookingFlowStore) => state.selectedArtistId;
export const selectIsFlowComplete = (state: BookingFlowStore) => state.isFlowComplete;
