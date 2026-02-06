# Home Booking Fallback UX Feedback

**Role**: Shopper
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Shopper
**I want** to see clear feedback when my pre-selected booking details are incomplete
**So that** I understand why I'm entering the standard booking flow instead of a streamlined one

## Detailed Description

When a user navigates to an artist's profile from the home screen and taps "Book with this artist," the app attempts to use pre-selected location, date, and time from the home screen context. If any of this data is missing (e.g., reverse geocoding failed, or there was a race condition), the system silently falls back to the regular booking flow starting from the beginning.

This silent fallback can confuse users who expected their selections to carry over. They may wonder why they need to re-enter information they thought they already provided. Providing clear feedback about the fallback would improve the user experience and reduce confusion.

## Acceptance Criteria

### Functional Requirements

- **Given** a user navigates to ArtistDetailScreen from home with incomplete pre-selection data - **When** they tap the "Book with this artist" button - **Then** a toast or inline message appears explaining that they'll start from the beginning
- **Given** pre-selection data is complete (location, date, time all present) - **When** the user taps "Book with this artist" - **Then** they proceed directly to the streamlined flow with no fallback message
- **Given** the book button is displayed - **When** pre-selection data is incomplete - **Then** the button should either be disabled with explanatory text OR remain active with fallback messaging

### Non-Functional Requirements

- **Performance**: Toast or message should appear within 100ms of button press
- **Usability**: Message should be clear and in Korean, consistent with app tone
- **Accessibility**: Fallback message should be announced by screen readers

## User Experience Flow

1. User selects location and time on home screen
2. User browses artist carousel and taps an artist card
3. User views artist profile and taps "이 아티스트와 예약하기"
4. If data is complete: User proceeds to streamlined booking flow
5. If data is incomplete: System shows toast "선택 정보가 누락되어 처음부터 시작합니다" and navigates to standard flow

## Technical Context

- **Epic Integration**: Part of the Home Screen Booking Flow feature
- **System Components**: `ArtistDetailScreen.tsx`, potentially a toast/snackbar component
- **Data Requirements**: Check for `preselectedCoordinates`, `preselectedDate`, `preselectedTimeSlot` presence
- **Integration Points**: Connects to `BookingFlowScreen.tsx` navigation and `bookingFlowStore.ts`

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] User experience flows tested with real users
- [ ] Integration with related stories validated
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

- Consider whether to disable the button entirely when data is incomplete, showing a subtle "위치와 시간을 먼저 선택해주세요" message instead
- Alternative: Always allow booking but show the toast on fallback
- This story originated from code review feedback on the home booking flow PR
