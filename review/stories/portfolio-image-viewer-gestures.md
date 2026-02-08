# Portfolio Image Viewer Gestures

**Role**: Shopper | Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Shopper
**I want** to pinch-to-zoom and swipe through portfolio images in the full-screen viewer
**So that** I can examine artist work in detail and navigate images naturally using familiar mobile gestures

## Detailed Description

The current portfolio image viewer modal displays images in a horizontal ScrollView with basic arrow navigation. While functional, this lacks the gesture support users expect from modern mobile image viewing experiences.

Users viewing an artist's portfolio want to:
- Zoom in on details of makeup work, hairstyles, or other services
- Pan around zoomed images to examine specific areas
- Swipe naturally between images without relying on small arrow buttons
- Double-tap to quickly zoom in/out

This enhancement will significantly improve the portfolio browsing experience, helping shoppers make more informed decisions when selecting an artist.

## Acceptance Criteria

### Functional Requirements

- **Given** the full-screen image modal is open - **When** the user performs a pinch gesture - **Then** the image zooms in/out proportionally to the gesture
- **Given** an image is zoomed in - **When** the user pans with one finger - **Then** the view moves to show different parts of the image
- **Given** the image viewer is at normal zoom - **When** the user swipes horizontally - **Then** the viewer navigates to the next/previous image
- **Given** any zoom level - **When** the user double-taps - **Then** the image toggles between zoomed and normal state

### Non-Functional Requirements

- **Performance**: Gesture response must be < 16ms (60fps) for smooth interaction
- **Usability**: Gestures should feel native and match iOS/Android system gallery behavior
- **Reliability**: Zoom state should reset when navigating between images

## User Experience Flow

1. User taps on a portfolio thumbnail to open full-screen viewer
2. System displays image at fit-to-screen size with gesture hints (optional)
3. User pinch-zooms to examine details
4. System smoothly scales image maintaining touch point as center
5. User pans to view different areas while zoomed
6. User double-taps to reset zoom
7. User swipes to navigate to next image
8. System animates transition and resets zoom for new image

## Technical Context

- **Epic Integration**: Part of the Artist Profile enhancement epic
- **System Components**: `PortfolioImageGrid.tsx` modal viewer section
- **Data Requirements**: No additional data needed; operates on existing `PortfolioImage[]`
- **Integration Points**: May require `react-native-reanimated` and `react-native-gesture-handler` for performant gesture handling; consider `react-native-image-zoom-viewer` as a drop-in solution

## Definition of Done

- [ ] Pinch-to-zoom implemented with smooth 60fps performance
- [ ] Pan gesture works when zoomed in
- [ ] Swipe navigation between images works at normal zoom
- [ ] Double-tap zoom toggle implemented
- [ ] Zoom resets on image navigation
- [ ] Gestures work on both iOS and Android
- [ ] No regression in existing thumbnail grid or modal open/close behavior
- [ ] Code reviewed and approved

## Notes

Consider evaluating these libraries:
- `react-native-image-zoom-viewer` - Full-featured image viewer with gesture support
- `react-native-reanimated` + `react-native-gesture-handler` - For custom gesture implementation
- `@shopify/flash-list` - If performance issues arise with many images

The existing arrow navigation should be retained as an alternative navigation method, especially for accessibility.

---

**Source**: Code Review [code-review-2.md](../reviews/code-review-2.md) - Enhancement item for `PortfolioImageGrid.tsx`
