# Add Internationalization Support for Review Submission Messages

**Epic**: [Review System](../epics/review-system.md)
**Role**: Developer
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer  
**I want** to extract hardcoded Korean strings from the review submission screen  
**So that** the app can support multiple languages and follow i18n best practices

## Detailed Description

Currently, the review submission screen contains Alert.alert messages that are hardcoded in Korean, making the feature unusable for non-Korean speakers and violating internationalization best practices. The application needs to support multiple languages to reach a global audience. This involves setting up a proper internationalization framework and extracting all user-facing strings from the review submission components.

## Acceptance Criteria

### Functional Requirements

- **Given** the review submission screen loads - **When** a user interacts with photo upload features - **Then** all alert messages and UI text display in the user's preferred language
- **Given** the app supports Korean and English languages - **When** the user changes language settings - **Then** all review submission messages update immediately without app restart
- **Given** new alert messages need to be added - **When** a developer adds a message - **Then** it automatically supports all configured languages

### Non-Functional Requirements

- **Performance**: Language switching should be instant without significant performance impact
- **Usability**: Language detection should default to device locale or user preference
- **Security**: No sensitive data should be exposed through localization keys

## User Experience Flow

1. User opens review submission screen in any language
2. System detects user's language preference (device locale or app setting)
3. All alert messages and UI text display in the detected language
4. User can change language in app settings and see immediate updates
5. Photo upload errors and success messages appear in correct language

## Technical Context

- **Epic Integration**: This story is part of the review photo upload feature, ensuring the complete feature is accessible globally
- **System Components**: Mobile app React Native components, localization framework
- **Data Requirements**: Language preference settings, localized string resources
- **Integration Points**: App settings, device locale detection, photo upload service

## Definition of Done

- [ ] All hardcoded Korean strings extracted from ReviewSubmissionScreen.tsx
- [ ] Internationalization framework (react-i18next) configured in mobile app
- [ ] Localization files created for Korean and English languages
- [ ] Language switching tested and working
- [ ] All review submission alerts display in correct language
- [ ] Code reviewed and approved
- [ ] Documentation updated for i18n setup

## Notes

This implementation will establish the foundation for full app internationalization. The focus should be on the review submission screen first, but the framework should be designed to easily extend to other screens in the future.