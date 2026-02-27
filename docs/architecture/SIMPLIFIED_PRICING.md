# Simplified Pricing Model

## Overview

The booking flow has been simplified to use a fixed pricing model where artists set prices for hair and makeup services, rather than detailed per-treatment pricing.

## Current Model

Artists define fixed prices for:
- Hair service (fixed duration: 60 minutes)
- Makeup service (fixed duration: 60 minutes)
- Combo service (hair + makeup)

This approach:
- Simplifies the booking flow for customers
- Reduces decision fatigue
- Allows artists to manage their own pricing

## Deprecated Treatment Selection

The detailed treatment selection functionality (`TreatmentSelectionScreen`) has been **retained but disabled** for potential future restoration.

### Files Affected

| File | Status |
|------|--------|
| `packages/mobile/src/screens/booking/treatment/TreatmentSelectionScreen.tsx` | Retained, not in use |
| `packages/mobile/src/constants/bookingOptions.ts` (sampleTreatments) | Mock data retained |
| `packages/mobile/src/screens/booking/BookingFlowScreen.tsx` | treatmentSelection step commented out |
| `packages/mobile/src/stores/bookingFlowStore.ts` | treatmentSelection references commented out |

### Booking Flow Configuration

Treatment selection is skipped in all booking flows:

```typescript
// Celebrity flow
const steps = ['artistList', 'styleSelection', 'paymentConfirmation', 'bookingComplete'];

// Direct flow
const steps = ['artistList', 'styleSelection', 'paymentConfirmation', 'bookingComplete'];

// Home entry flow
const steps = ['styleSelection', 'paymentConfirmation', 'bookingComplete'];
```

### Price Calculation

When building the booking payload, prices come from artist service prices:

```typescript
if (servicePrices) {
  services = [];
  if ((serviceType === 'hair' || serviceType === 'combo') && servicePrices.hair) {
    services.push({
      id: 'hair',
      name: '헤어',
      durationMinutes: 60,
      price: servicePrices.hair,
    });
  }
  if ((serviceType === 'makeup' || serviceType === 'combo') && servicePrices.makeup) {
    services.push({
      id: 'makeup',
      name: '메이크업',
      durationMinutes: 60,
      price: servicePrices.makeup,
    });
  }
}
```

## Restoring Detailed Treatment Selection

If detailed treatment selection is needed in the future:

1. Uncomment `treatmentSelection` in flow step arrays
2. Connect `sampleTreatments` to real API data
3. Update `buildBookingPayload` to use `selectedTreatments`
4. Test the complete booking flow

## Decision History

- **Simplified**: To reduce booking friction and match artist pricing expectations
- **Retained code**: For potential A/B testing or future feature restoration
