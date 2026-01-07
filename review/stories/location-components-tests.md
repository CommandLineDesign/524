# Add Unit Tests for Location Components

**Role**: Developer
**Priority**: Medium
**Status**: ✅ Tests Written (Pending Jest Config)
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** comprehensive unit tests for the location components
**So that** we can confidently refactor and modify the components without introducing regressions

## Detailed Description

The new location components (`LocationPicker`, `InteractiveKakaoMap`, `AddressSearchBar`, etc.) currently lack unit tests. Key behaviors that should be tested include:

1. **Search debouncing**: Verify that search requests are properly debounced
2. **Coordinate validation**: Ensure latitude/longitude values are validated correctly
3. **Error states**: Test error handling and recovery UI
4. **Platform-specific rendering**: Verify web vs native implementations
5. **State management**: Test map center, selected location, and pin mode state transitions

Without tests, changes to these components carry risk of undetected regressions.

## Acceptance Criteria

### Functional Requirements

- **Given** AddressSearchBar component - **When** user types - **Then** search is debounced by 300ms
- **Given** LocationPicker component - **When** invalid coordinates provided - **Then** defaults to Seoul City Hall
- **Given** InteractiveKakaoMap - **When** API key missing - **Then** error state is displayed
- **Given** location selection - **When** user confirms - **Then** onLocationChange callback receives valid data

### Non-Functional Requirements

- **Coverage**: Minimum 70% code coverage for location components
- **Performance**: Tests execute in < 30 seconds total
- **Maintainability**: Tests are clear and well-documented

## User Experience Flow

1. Developer modifies location component code
2. Developer runs test suite
3. Tests verify all critical behaviors
4. Developer receives immediate feedback on any regressions
5. CI/CD pipeline prevents merging failing tests

## Technical Context

- **Epic Integration**: Test coverage and code quality
- **System Components**: `packages/mobile/src/components/location/`
- **Data Requirements**: Mock data for Kakao API responses
- **Integration Points**: Jest testing framework, React Native Testing Library

## Definition of Done

- [x] Unit tests for AddressSearchBar (debouncing, result selection, clear)
- [x] Unit tests for LocationPicker (initialization, GPS, pin mode, radius selection)
- [x] Unit tests for InteractiveKakaoMap (error states, message handling via useMapState hook)
- [x] Unit tests for MapAddressPicker (address display, confirmation)
- [x] Mock implementations for Kakao service calls
- [ ] Minimum 70% coverage achieved (blocked by Jest config)
- [ ] Tests integrated into CI pipeline (blocked by Jest config)

## Notes

Originated from code review of Kakao Maps integration (code-review-1.md). Testing React Native components with maps can be challenging due to WebView dependencies. Consider:
- Mocking WebView for native tests
- Using JSDOM for web-specific tests
- Snapshot tests for UI consistency

### Implementation Notes (2026-01-08)

Test files created in `packages/mobile/src/components/location/__tests__/`:
- `AddressSearchBar.test.tsx` - Tests for debouncing, minimum query length, result selection, clear, location biasing, error handling
- `LocationPicker.test.tsx` - Tests for coordinate validation, GPS fallback, radius selection, custom radius options, pin move mode, reverse geocoding, error states
- `InteractiveKakaoMap.test.tsx` - Tests for useMapState hook (ready/error/centerChanged messages, retry, refs), map utility functions (getZoomLevelForRadius, areCentersEqual)
- `MapAddressPicker.test.tsx` - Tests for initialization, address display, confirm button, pin move mode, GPS location, search result selection, radius overlay

**Blocking Issue**: The Jest configuration has compatibility issues with react-native-web and React 19:
1. `react-test-renderer` deprecation warnings
2. `expo` packages not being transformed properly (`transformIgnorePatterns` needs updating)
3. Invalid container errors when rendering react-native-web components

**Required to unblock**:
1. Update `jest.config.js` transformIgnorePatterns to include all expo packages
2. Consider using `@testing-library/react` for web-specific tests instead of react-native testing library
3. May need to configure separate test environments for web vs native

## Related Stories

- [Kakao Maps Integration](../reviews/code-review-1.md): Source review identifying this issue
- [Refactor InteractiveKakaoMap](./refactor-interactive-kakao-map.md): Tests would make refactoring safer
