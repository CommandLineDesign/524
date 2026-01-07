# Consolidate Geocoding Types to Shared Package

**Role**: Developer
**Priority**: Medium
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer
**I want** to consolidate duplicate geocoding type definitions into the `@524/shared` package
**So that** there is a single source of truth for types and changes propagate consistently across packages

## Detailed Description

Currently, the Kakao Maps integration has duplicate type definitions for geocoding-related interfaces:
- `GeocodingResult`
- `KeywordSearchResult`
- `ReverseGeocodeResult`

These types are defined in both:
- `packages/mobile/src/types/kakao.ts`
- `packages/api/src/services/geocodeService.ts`

This duplication creates maintenance overhead and risk of type drift between packages. Moving these shared types to `@524/shared` will ensure type consistency across the mobile and API packages.

## Acceptance Criteria

### Functional Requirements

- **Given** the shared package - **When** geocoding types are exported - **Then** both mobile and API packages can import and use them
- **Given** a type change in shared - **When** packages are rebuilt - **Then** TypeScript catches any incompatibilities
- **Given** existing code using local types - **When** migrated to shared types - **Then** no runtime behavior changes

### Non-Functional Requirements

- **Performance**: No impact on runtime performance (types are compile-time only)
- **Maintainability**: Single source of truth reduces maintenance burden
- **Compatibility**: Ensure backward compatibility during migration

## User Experience Flow

1. Developer identifies all usages of duplicate types in mobile and API packages
2. Developer creates consolidated type definitions in `@524/shared`
3. Developer updates imports in mobile package to use shared types
4. Developer updates imports in API package to use shared types
5. Developer removes duplicate local type definitions
6. Developer verifies TypeScript compilation passes in all packages

## Technical Context

- **Epic Integration**: Part of overall code quality and maintainability improvements
- **System Components**: `@524/shared`, `@524/mobile`, `@524/api`
- **Data Requirements**: Type definitions only (no runtime data changes)
- **Integration Points**: Both packages currently import from local definitions

## Definition of Done

- [x] Shared types exported from `@524/shared`
- [x] Mobile package imports types from shared
- [x] API package imports types from shared
- [x] Local duplicate definitions removed (re-exported for backward compatibility)
- [x] All packages pass TypeScript type checking
- [x] No runtime behavior changes verified

## Notes

Originated from code review of Kakao Maps integration (code-review-1.md). The current duplication works but creates technical debt. This refactoring should be done when convenient, not blocking any feature work.

## Related Stories

- [Kakao Maps Integration](../reviews/code-review-1.md): Source review identifying this issue
