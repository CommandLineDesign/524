# Add Review Form Accessibility

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Customer with visual impairments
**I want** the review submission form to have proper accessibility labels
**So that** I can use screen readers to leave reviews independently

## Detailed Description

The review submission form currently lacks accessibility labels on interactive elements including star ratings, the submit button, and other touchable components. This creates significant barriers for customers who rely on screen readers (VoiceOver on iOS, TalkBack on Android) to navigate and interact with the app.

Without proper accessibility labels, screen reader users cannot understand what each interactive element does, which star rating they're selecting, or whether their review has been successfully submitted. Adding `accessibilityLabel` and `accessibilityHint` props to all interactive elements ensures that the review submission experience is inclusive and usable by all customers, regardless of visual ability.

## Acceptance Criteria

### Functional Requirements

- **Given** a screen reader user focuses on a star rating component - **When** VoiceOver/TalkBack reads the element - **Then** it announces the rating dimension (e.g., "Overall Rating, 3 out of 5 stars selected")
- **Given** a screen reader user focuses on an unselected star - **When** they interact with it - **Then** the screen reader announces "Tap to select [number] stars for [dimension]"
- **Given** a screen reader user focuses on the review text input - **When** VoiceOver/TalkBack reads the element - **Then** it announces "Review text, optional, text field"
- **Given** a screen reader user focuses on the submit button - **When** VoiceOver/TalkBack reads the element - **Then** it announces "Submit Review" and its enabled/disabled state
- **Given** a screen reader user submits a review - **When** submission succeeds - **Then** VoiceOver/TalkBack announces "Review submitted successfully"

### Non-Functional Requirements

- **Accessibility**: All interactive elements have meaningful accessibilityLabel
- **Accessibility**: Complex interactions have accessibilityHint for guidance
- **Accessibility**: State changes (selected stars, loading) are announced
- **Usability**: Labels are concise and clear, not verbose

## User Experience Flow

VoiceOver/TalkBack user submitting a review:

1. User navigates to completed booking detail screen
2. User swipes to "Leave Review" button
3. Screen reader announces "Leave Review, button"
4. User double-taps to activate
5. User swipes to first star rating section
6. Screen reader announces "Overall Rating, 0 of 5 stars selected"
7. User swipes through star options
8. Screen reader announces "1 star", "2 stars", "3 stars", etc.
9. User double-taps to select 4 stars
10. Screen reader announces "4 out of 5 stars selected"
11. User swipes to next rating dimension
12. Process repeats for Quality, Professionalism, Timeliness ratings
13. User swipes to review text field
14. Screen reader announces "Review text, optional, text field"
15. User dictates or types optional review text
16. User swipes to submit button
17. Screen reader announces "Submit Review, button, enabled"
18. User double-taps to submit
19. Screen reader announces "Submitting review..."
20. After success, screen reader announces "Review submitted successfully"

## Technical Context

- **Epic Integration**: Makes the review system accessible to all customers
- **System Components**:
  - Mobile app: ReviewSubmissionScreen and StarRating components ([packages/mobile/src/screens/ReviewSubmissionScreen.tsx:1-236](packages/mobile/src/screens/ReviewSubmissionScreen.tsx#L1-L236))
  - React Native: accessibilityLabel, accessibilityHint, accessibilityRole props
- **Data Requirements**: No backend changes required
- **Integration Points**:
  - Affects all interactive elements in review submission flow
  - Integrates with platform screen readers (VoiceOver/TalkBack)

## Definition of Done

- [ ] All TouchableOpacity components have accessibilityLabel prop
- [ ] Star rating components announce current selection state
- [ ] Star rating components have accessibilityHint for interaction guidance
- [ ] Submit button has accessibilityLabel and accessibilityRole="button"
- [ ] Submit button announces enabled/disabled state
- [ ] Review text input has accessibilityLabel indicating it's optional
- [ ] Loading states are announced to screen readers
- [ ] Success/error messages are announced to screen readers
- [ ] Testing completed with VoiceOver on iOS
- [ ] Testing completed with TalkBack on Android
- [ ] Accessibility labels are in Korean (app's primary language)
- [ ] Documentation includes accessibility testing checklist

## Notes

- Use `accessibilityLabel` for what the element is (e.g., "Overall Rating")
- Use `accessibilityHint` for what the element does (e.g., "Tap to rate")
- Use `accessibilityRole` to indicate element type (button, text, adjustable)
- For star ratings, consider `accessibilityRole="adjustable"` with increment/decrement actions
- Screen reader announcements should be concise - avoid redundant "button" when accessibilityRole is set
- Test with actual screen reader users if possible, not just enabling VoiceOver/TalkBack
- Consider using React Native's `accessibilityState` for selected/disabled states
- Future enhancement: add haptic feedback when stars are selected for additional feedback
