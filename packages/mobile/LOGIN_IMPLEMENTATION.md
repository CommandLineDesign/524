# Login Screen Implementation

## Overview
This document describes the dual login screen implementation that supports both development and production login screens, switchable via environment variable.

## Environment Variable Configuration

### USE_DEV_LOGIN
Controls which login screen is displayed:
- `USE_DEV_LOGIN=true` → Shows DevLoginScreen (with test accounts)
- `USE_DEV_LOGIN=false` or undefined → Shows NewLoginScreen (Figma design)

### Setting the Environment Variable

**For local development:**
```bash
# Show dev login with test accounts
USE_DEV_LOGIN=true npm start

# Show production login (default)
npm start
```

**For Expo:**
```bash
# In .env file or inline
USE_DEV_LOGIN=true npx expo start
```

## File Structure

### New Files Created
1. **`src/screens/NewLoginScreen.tsx`** - Production login screen from Figma design
2. **`src/screens/DevLoginScreen.tsx`** - Development login screen with test accounts (renamed from LoginScreen.tsx)
3. **`src/screens/LoginScreen.tsx`** - Router component that conditionally renders based on USE_DEV_LOGIN
4. **`src/config/environment.ts`** - Environment configuration
5. **`src/services/snsAuth.ts`** - SNS authentication service (stub implementations)
6. **`src/theme/borderRadius.ts`** - Border radius design tokens
7. **`src/theme/typography.ts`** - Typography design tokens
8. **`src/theme/spacing.ts`** - Spacing design tokens
9. **`src/theme/index.ts`** - Theme barrel export

### Modified Files
1. **`src/theme/colors.ts`** - Updated primary color to #19191b and added borderDark

## Design Implementation

### Figma Design Match
The NewLoginScreen implements the Figma design with:
- **Logo**: "524" text at 50px, bold, centered
- **Form Fields**: Two inputs (아이디, 비밀번호) with 52px height, 10px border radius
- **Login Button**: 52px height, 100px border radius, black background
- **Action Links**: 회원가입 | 아이디 찾기 | 비밀번호 찾기 with dividers
- **SNS Section**: Naver and Kakao login buttons (54px diameter circles)
- **Colors**: #19191b for text/borders, white background

### Design Tokens Used
All styling uses design tokens from the theme system:
- `colors.text` (#19191b)
- `colors.background` (#ffffff)
- `colors.borderDark` (#19191b)
- `spacing.lg`, `spacing.md`, `spacing.sm`, etc.
- `typography.sizes.title` (50px), `typography.sizes.md` (16px), etc.
- `borderRadius.md` (10px), `borderRadius.xl` (100px), `borderRadius.full` (9999px)

## Features

### NewLoginScreen (Production)
- Clean, minimal design matching Figma
- Email/password login
- SNS login buttons (Naver, Kakao) - show "coming soon" alerts
- Action links for signup, find ID, find password
- Full accessibility support with Korean labels
- Loading states
- Error handling

### DevLoginScreen (Development)
- Quick-select test account buttons
- Pre-filled credentials
- Visible test account information
- Development-only features clearly marked
- All original functionality preserved

## SNS Authentication

### Current Implementation
The SNS authentication service (`src/services/snsAuth.ts`) provides stub functions:
- `loginWithNaver()` - Shows "coming soon" alert
- `loginWithKakao()` - Shows "coming soon" alert

### Future Implementation
These functions should be replaced with actual OAuth implementations when ready:
1. Integrate Naver Login SDK
2. Integrate Kakao Login SDK
3. Handle OAuth callbacks
4. Exchange tokens with backend
5. Update auth store with user data

## Testing

### Manual Testing Checklist
- [x] TypeScript compilation passes
- [x] No linting errors
- [ ] Visual match with Figma design verified on iOS
- [ ] Visual match with Figma design verified on Android
- [ ] Environment variable switching works correctly
- [ ] Login flow works with NewLoginScreen
- [ ] Login flow works with DevLoginScreen
- [ ] SNS buttons show "coming soon" alerts
- [ ] All accessibility labels present
- [ ] Form validation works
- [ ] Loading states display correctly
- [ ] Error handling works

### Testing Environment Variable Switching
```bash
# Test with dev login
USE_DEV_LOGIN=true npm start
# Verify DevLoginScreen shows with test accounts

# Test with production login (default)
npm start
# Verify NewLoginScreen shows with Figma design

# Test explicit false
USE_DEV_LOGIN=false npm start
# Verify NewLoginScreen shows
```

## Accessibility

All interactive elements include:
- `accessibilityRole` for proper screen reader context
- `accessibilityLabel` in Korean for clear identification
- `accessibilityHint` for usage guidance
- Proper focus order
- Semantic HTML-like structure

## Standards Compliance

This implementation follows the 524 Frontend Standards:
- ✅ TypeScript strict mode with no `any` types
- ✅ StyleSheet.create() for all styles
- ✅ Design tokens for all colors, spacing, typography
- ✅ Accessibility labels on all interactive elements
- ✅ Proper error handling and loading states
- ✅ Component composition and reusability
- ✅ Integration with existing auth store
- ✅ Korean localization

## Known Limitations

1. **SNS Login**: Currently shows "coming soon" alerts - needs actual OAuth implementation
2. **Find ID/Password**: Shows "coming soon" alerts - needs implementation
3. **Logo Assets**: Using remote Figma URLs - should be downloaded and bundled for production
4. **Environment Variable**: Requires restart to change - consider hot reload if needed

## Next Steps

1. Implement actual Naver OAuth integration
2. Implement actual Kakao OAuth integration
3. Implement "Find ID" functionality
4. Implement "Find Password" functionality
5. Download and bundle SNS logo assets locally
6. Add unit tests for LoginScreen router
7. Add integration tests for login flows
8. Perform visual regression testing
9. Test on various device sizes
10. Conduct accessibility audit with screen readers

