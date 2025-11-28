# Navigation System

This document describes the temporary navigation system implemented for both mobile and web platforms.

## Overview

A simple, full-screen overlay navigation menu has been implemented for both React Native (mobile) and Next.js (web) applications. This is a temporary solution until a designer can provide a proper design system.

## Mobile App (React Native)

### Components

#### `NavigationMenu` (`packages/mobile/src/components/NavigationMenu.tsx`)
- Full-screen modal navigation menu
- Displays main navigation items and account options
- Automatically closes when navigating to a new screen
- Styled with a clean, modern UI matching the app's design system

#### `MenuButton` (`packages/mobile/src/components/MenuButton.tsx`)
- Hamburger menu button
- Positioned in the top-right corner of screens
- Opens the `NavigationMenu` when pressed

### Usage

The menu button has been added to the `WelcomeScreen` as an example. To add it to other screens:

```tsx
import { useState } from 'react';
import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';

export function YourScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Add header with menu button */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>

      {/* Your screen content */}
      
      {/* Add navigation menu */}
      <NavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}
```

### Navigation Items

Current navigation items:
- Home (Welcome screen)
- Services (ServiceSelection screen)
- Occasions (OccasionSelection screen)
- Booking Summary (BookingSummary screen)
- My Profile (placeholder)
- Settings (placeholder)
- Help & Support (placeholder)

## Web App (Next.js)

### Components

#### `MobileMenu` (`packages/web/src/components/MobileMenu.tsx`)
- Responsive navigation menu
- Visible only on mobile/tablet screens (hidden on desktop)
- Slides in from the right side
- Includes backdrop overlay
- Automatically closes when route changes
- Prevents body scroll when open

### Features

- **Hamburger Button**: Animated three-line menu icon
- **Slide-in Panel**: Smooth slide animation from the right
- **Backdrop Overlay**: Blurred background overlay when menu is open
- **Active Route Highlighting**: Current page is highlighted in the menu
- **Responsive**: Only shows on screens smaller than `lg` breakpoint
- **Accessibility**: Proper ARIA labels and keyboard support

### Integration

The `MobileMenu` has been integrated into:
1. **Homepage** (`packages/web/src/app/page.tsx`): Added to the header
2. **Dashboard TopBar** (`packages/web/src/components/dashboard/TopBar.tsx`): Visible on mobile devices

The desktop `Sidebar` component remains visible on larger screens (`lg` breakpoint and above).

### Navigation Items

Current navigation items:
- Home
- 대시보드 (Dashboard)
- 예약 관리 (Bookings)
- 아티스트 관리 (Artists)
- 메시지 (Messages)
- 정산 (Payouts)
- My Profile (placeholder)
- Settings (placeholder)
- Help & Support (placeholder)

## Styling

Both implementations follow the existing design system:
- Uses the `524` branding
- Consistent color scheme (slate grays with primary color accents)
- Rounded corners (12px radius)
- Modern shadows and transitions
- Korean language support

## Future Improvements

When a designer provides new designs, consider:

1. **Enhanced Animations**: Add more sophisticated transition effects
2. **Icons**: Add meaningful icons for each menu item
3. **User Avatar**: Integrate actual user profile information
4. **Notifications Badge**: Show unread message counts
5. **Search**: Add in-menu search functionality
6. **Gestures**: Implement swipe-to-open/close gestures
7. **Theme Support**: Add dark mode support
8. **Localization**: Full i18n support for menu items

## Testing

To test the navigation:

### Mobile App
```bash
cd packages/mobile
npm start
```
- Press the hamburger menu button in the top-right corner
- Verify the menu slides in
- Test navigation to different screens
- Verify the menu closes after navigation

### Web App
```bash
cd packages/web
npm run dev
```
- Resize browser to mobile width (< 1024px)
- Click the hamburger menu button
- Verify the menu slides in from the right
- Click backdrop or close button to dismiss
- Verify navigation works correctly

## Notes

- The navigation is intentionally simple and functional
- All placeholder routes (Profile, Settings, Help) need to be implemented
- The menu items list can be easily modified in each component
- Both implementations use similar UI patterns for consistency

