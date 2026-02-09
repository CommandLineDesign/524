# Code Review

**Date:** 2026-02-09
**Base Ref:** `origin/main`
**Feature Ref:** `jl/artist-profile-page`

---

## High-Level Summary

**Product impact:** This change enables artists to edit their profile directly from the ArtistDetailScreen, including updating bio, services with pricing, location/radius, and portfolio images. It also adds a new portfolio step to the artist onboarding flow, allowing artists to showcase their work before completing registration.

**Engineering approach:** The implementation extends `ArtistProfileTab` with an `isEditing` mode using a draft pattern for optimistic UI updates. New reusable components (`PortfolioImageGrid`, `ServiceEditor`) are extracted into a dedicated `components/artist` module. Image uploads reuse the existing presigned URL flow via `presignProfilePhoto`.

---

## Prioritized Issues

### Critical

*None identified.*

### Major

- [status:done] File: `packages/mobile/src/components/artist/PortfolioImageGrid.tsx:217-230`
  - Issue: The horizontal ScrollView with `pagingEnabled` uses `contentOffset` prop to set initial scroll position, but this doesn't update when `selectedImageIndex` changes programmatically via arrow navigation. Users tapping prev/next arrows won't see the view scroll.
  - Fix: Use a `ref` with `scrollTo()` in a `useEffect` that responds to `selectedImageIndex` changes, or switch to `FlatList` with `initialScrollIndex` and `scrollToIndex` methods.
  - Applied: Added `scrollViewRef` and `useEffect` to programmatically scroll when `selectedImageIndex` changes.

- [status:done] File: `packages/mobile/src/screens/ArtistOnboardingFlowScreen.tsx:231-268`
  - Issue: Portfolio image upload errors are caught but the successfully uploaded images up to that point are discarded. If 3 of 5 images upload successfully before one fails, none are saved.
  - Fix: Call `updateField` with partial results before throwing, or accumulate successful uploads and only show error for failed ones while keeping successful uploads in state.
  - Applied: Wrapped individual uploads in try-catch, save successful uploads even on partial failure, show appropriate message with success/fail counts. Also fixed same pattern in PortfolioImageGrid.tsx.

### Minor

- [status:done] File: `packages/mobile/src/components/booking/ArtistProfileTab.tsx:162-163`
  - Issue: Using array index as `key` for service items. If services are reordered or deleted, React may incorrectly reconcile components, causing input state issues in edit mode.
  - Fix: Use a stable identifier such as `service.name + index` or add an `id` field to `ArtistServiceOffering`.
  - Applied: Changed key to `${serviceName}-${index}` for stable identification.

- [status:done] File: `packages/mobile/src/components/artist/PortfolioImageGrid.tsx:161-181`
  - Issue: Using array index as `key` for portfolio images. Same reconciliation concern when images are removed in edit mode.
  - Fix: Use the image URL as key since it should be unique, e.g., `key={image.url}`.
  - Applied: Changed key to `image.url` in both thumbnail grid and full image scrollview.

- [status:done] File: `packages/mobile/src/screens/booking/artist/ArtistDetailScreen.tsx:135-147`
  - Issue: `handleSave` doesn't validate that required fields are present before saving. An artist could potentially save an incomplete profile.
  - Fix: Add validation for required fields (e.g., `stageName`, `bio`) before calling `updateProfile`, and show appropriate error messages.
  - Applied: Added validation for stageName and bio fields with user-friendly error alert.

- [status:done] File: `packages/mobile/src/components/artist/ServiceEditor.tsx:41`
  - Issue: Using array index as `key` for service cards. This can cause input focus issues when services are added/removed mid-list.
  - Fix: Generate a temporary unique ID when adding services (e.g., `Date.now()` or `uuid`), or use a combination of fields.
  - Applied: Changed key to `${service.name || 'new'}-${service.price}-${index}` for more stable identification.

- [status:done] File: `packages/mobile/src/components/booking/ArtistProfileTab.tsx:57-89`
  - Issue: Multiple `const display*` variables computed inline create repetitive conditional logic. This pattern is repeated 5+ times.
  - Fix: Consider extracting a helper function like `getDisplayValue(editDraft, props, field)` or use a derived state object.
  - Applied: Extracted `getDisplayValue<K>` generic helper function that handles the edit/prop logic in one place.

### Enhancement

- [status:done] File: `packages/mobile/src/components/artist/PortfolioImageGrid.tsx:64-136`
  - Issue: The `handleAddImages` function is ~70 lines and handles permission request, image picking, and upload loop. This reduces testability and readability.
  - Fix: Extract upload logic into a separate hook (e.g., `usePortfolioUpload`) or utility function.
  - Applied: Created `usePortfolioUpload` hook in `hooks/usePortfolioUpload.ts` and refactored PortfolioImageGrid to use it.

- [status:done] File: `packages/mobile/src/screens/ArtistOnboardingFlowScreen.tsx:201-268`
  - Issue: `pickPortfolioImages` duplicates almost identical logic to `PortfolioImageGrid.handleAddImages`. Both handle permissions, picking, and sequential uploads.
  - Fix: Extract shared upload logic into a reusable hook or utility that both can consume.
  - Applied: Refactored to use the shared `usePortfolioUpload` hook, removed ~90 lines of duplicate code.

- [status:story] File: `packages/mobile/src/components/artist/PortfolioImageGrid.tsx`
  - Issue: The full-screen image viewer modal could benefit from pinch-to-zoom and swipe gestures for better UX.
  - Fix: Consider integrating `react-native-image-zoom-viewer` or `react-native-reanimated` for gesture support in a future iteration.
  - Story: [portfolio-image-viewer-gestures.md](../stories/portfolio-image-viewer-gestures.md)

- [status:done] File: `packages/mobile/src/components/booking/ArtistProfileTab.tsx:103-117`
  - Issue: The "Studio Name" section label is in English while other labels ("소개", "전문 분야", etc.) are in Korean, creating an inconsistent localization experience.
  - Fix: Use Korean label "스튜디오 이름" or extract all strings into a localization file.
  - Applied: Changed label from "Studio Name" to "스튜디오 이름" for consistency with other Korean labels.

---

## Highlights

- **Clean component extraction**: `PortfolioImageGrid` and `ServiceEditor` are well-encapsulated, reusable components with clear prop interfaces and proper TypeScript typing.
- **Draft pattern for editing**: Using `editDraft` state separate from props allows clean cancel/save semantics without mutating original data.
- **Consistent accessibility**: All interactive elements include `accessibilityRole` and `accessibilityLabel` props throughout the new components.
- **Backward compatibility**: `ArtistProfileTab.services` accepts both `string[]` and `ArtistServiceOffering[]` to maintain compatibility with existing data.
- **Upload progress feedback**: Portfolio image uploads show progress indicators (`Uploading 2/5...`) giving users visibility into long operations.
- **Proper permission handling**: Image picker requests permissions with user-friendly error messages when denied.
- **Query invalidation on save**: `ArtistDetailScreen` correctly invalidates the artist query after saving to ensure fresh data is displayed.
