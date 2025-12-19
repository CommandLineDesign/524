# Add Real-Time Review Validation

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Customer
**I want** to see validation feedback while filling out the review form
**So that** I can fix errors before attempting submission and have a smoother experience

## Detailed Description

Currently, the review submission form only validates input when the customer taps the submit button. If validation fails (e.g., missing required ratings or review text exceeding 1000 characters), the customer sees an error only after attempting submission, creating a frustrating experience.

By adding real-time validation feedback, customers can see helpful hints as they fill out the form. For example, if they haven't provided all required ratings, a subtle indicator can show which ratings are still needed. If they're approaching the 1000 character limit, they can see a live counter showing remaining characters. This proactive feedback reduces submission errors and improves the overall user experience.

## Acceptance Criteria

### Functional Requirements

- **Given** a customer is filling out the review form - **When** they have not selected all four ratings - **Then** they see a visual indicator showing which ratings are still required
- **Given** a customer is typing review text - **When** they type characters - **Then** they see a live character counter showing characters used out of 1000
- **Given** a customer's review text exceeds 1000 characters - **When** they continue typing - **Then** they see a warning message and the counter turns red
- **Given** all validation requirements are met - **When** the form updates - **Then** the submit button becomes visually enabled/prominent
- **Given** validation requirements are not met - **When** the form updates - **Then** the submit button appears disabled or less prominent

### Non-Functional Requirements

- **Performance**: Validation updates occur instantly without lag as user types
- **Usability**: Validation messages are helpful and non-intrusive
- **Accessibility**: Validation feedback is announced to screen readers
- **UX**: Validation doesn't block user input, only provides guidance

## User Experience Flow

1. Customer opens review submission form
2. System displays form with all rating sections and text input
3. Customer selects first star rating (e.g., overall rating)
4. System updates visual indicator showing 3 more ratings needed
5. Customer continues selecting ratings
6. System updates indicator as each rating is provided
7. Customer begins typing review text
8. System displays live character counter: "42 / 1000 characters"
9. Customer continues typing
10. System updates counter in real-time
11. If customer approaches 1000 characters, counter changes color to warn
12. When all ratings provided, submit button becomes fully enabled
13. Customer can submit with confidence knowing form is valid

## Technical Context

- **Epic Integration**: Enhances the core review submission user experience
- **System Components**:
  - Mobile app: ReviewSubmissionScreen component ([packages/mobile/src/screens/ReviewSubmissionScreen.tsx:42-65](packages/mobile/src/screens/ReviewSubmissionScreen.tsx#L42-L65))
  - React hooks: useMemo or custom hook for validation state
- **Data Requirements**: No backend changes required
- **Integration Points**:
  - Integrates with existing review submission form
  - Works alongside existing submit-time validation

## Definition of Done

- [ ] Character counter displays below review text input
- [ ] Counter updates in real-time as user types
- [ ] Counter shows "X / 1000 characters" format
- [ ] Counter turns red when exceeding 1000 characters
- [ ] Visual indicator shows which ratings are missing (if any)
- [ ] Submit button visual state reflects form validity
- [ ] Validation messages are helpful and non-blocking
- [ ] Validation errors array computed efficiently with useMemo
- [ ] No performance lag when typing quickly
- [ ] Validation feedback works on both iOS and Android
- [ ] Screen readers announce validation state changes
- [ ] Existing submit-time validation still works as backup

## Notes

- Consider using React Native's TextInput `maxLength` prop as additional safeguard
- Validation should be informative, not punitive - guide users to success
- Submit button should remain technically tappable to show error messages for accessibility
- Character counter helps users craft concise, thoughtful reviews
- Missing rating indicators could use subtle UI like unfilled star outlines or "Required" labels
