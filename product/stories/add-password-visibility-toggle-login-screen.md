# Add Password Visibility Toggle to Login Screen

**Role**: Shopper
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Shopper  
**I want** to toggle password visibility on the login screen  
**So that** I can verify I entered my password correctly and feel more confident about my input

## Detailed Description

When users are entering their password on the login screen, they currently have no way to see what they've typed. This can lead to uncertainty about whether they entered the password correctly, especially for complex passwords. Adding a password visibility toggle (eye icon) will allow users to temporarily show their password as plain text to verify their input, then hide it again for security.

This is a common UX pattern in modern login forms and provides better usability without compromising security, as users can control when their password is visible.

## Acceptance Criteria

### Functional Requirements

- **Given** the login screen is displayed - **When** user taps the password field - **Then** an eye icon appears at the right edge of the password field
- **Given** the password field has focus - **When** user taps the eye icon - **Then** the password text becomes visible (secureTextEntry is toggled off)
- **Given** password is visible - **When** user taps the eye icon again - **Then** the password text becomes hidden (secureTextEntry is toggled on)
- **Given** user enters text in password field - **When** visibility is toggled - **Then** cursor position is maintained
- **Given** password field loses focus - **When** field regains focus - **Then** password visibility state is preserved

### Non-Functional Requirements

- **Usability**: Eye icon should be clearly distinguishable and accessible
- **Accessibility**: Eye icon should have proper accessibility labels in Korean
- **Performance**: Toggle should respond instantly without lag
- **Security**: Password should default to hidden state

## User Experience Flow

1. Shopper navigates to the login screen
2. Shopper taps the password input field to begin typing
3. System displays eye icon on the right side of password field
4. Shopper types their password (text appears as dots)
5. Shopper taps eye icon to temporarily reveal password text
6. Shopper verifies password is correct
7. Shopper taps eye icon again to hide password
8. Shopper continues with login process

## Technical Context

- **Epic Integration**: Part of the login screen implementation epic
- **System Components**: NewLoginScreen.tsx component in mobile package
- **Data Requirements**: No additional data required
- **Integration Points**: Uses existing theme system for icon styling

## Definition of Done

- [ ] Password visibility toggle icon implemented with proper eye/eye-off states
- [ ] Toggle functionality works correctly (secureTextEntry toggling)
- [ ] Korean accessibility labels added for the toggle button
- [ ] Icon styling follows design system guidelines
- [ ] Component maintains existing functionality when toggle is not used
- [ ] Tested on both iOS and Android platforms
- [ ] Code reviewed and approved

## Notes

The eye icon should use a standard icon from the design system or a commonly available icon library. The toggle state should be clearly communicated through the icon (eye open = visible, eye closed/slashed = hidden).
