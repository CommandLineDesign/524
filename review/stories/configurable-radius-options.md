# Configurable Radius Options for LocationPicker

**Role**: Developer
**Priority**: Low
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: XS (1-2 hours)

## Story Statement

**As a** Developer
**I want** to make the radius options configurable via props in LocationPicker
**So that** different screens can customize the available radius choices for their use case

## Detailed Description

The `LocationPicker` component currently has hardcoded `RADIUS_OPTIONS`:
```typescript
const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 25, label: '25 km' },
];
```

Different use cases may require different radius options. For example:
- Artist service areas might need larger radii (5-50 km)
- Delivery areas might need smaller radii (1-10 km)
- Event locations might need very precise radii (0.5-5 km)

Making this configurable would improve component reusability.

## Acceptance Criteria

### Functional Requirements

- **Given** no radiusOptions prop - **When** component renders - **Then** default options (5, 10, 15, 25 km) are used
- **Given** custom radiusOptions prop - **When** component renders - **Then** custom options are displayed
- **Given** custom radiusOptions - **When** user selects an option - **Then** onRadiusChange receives correct value

### Non-Functional Requirements

- **Performance**: No impact on rendering performance
- **Compatibility**: Backward compatible - existing usage without prop works unchanged

## User Experience Flow

1. Developer imports LocationPicker component
2. Developer optionally provides custom radiusOptions array
3. Component displays the provided options (or defaults)
4. User selects a radius option
5. onRadiusChange callback fires with selected value

## Technical Context

- **Epic Integration**: Component flexibility and reusability
- **System Components**: `packages/mobile/src/components/location/LocationPicker.tsx`
- **Data Requirements**: Optional prop for radius options array
- **Integration Points**: All screens using LocationPicker

## Definition of Done

- [x] radiusOptions prop added to LocationPickerProps
- [x] Default options preserved as fallback (DEFAULT_RADIUS_OPTIONS exported)
- [x] TypeScript types updated (RadiusOption interface added)
- [x] Existing usage continues to work unchanged

## Notes

Originated from code review of Kakao Maps integration (code-review-1.md). This is a minor enhancement that improves component flexibility. Low priority as current hardcoded values work for existing use cases.

## Related Stories

- [Kakao Maps Integration](../reviews/code-review-1.md): Source review identifying this issue
