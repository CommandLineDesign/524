# Payment Integration

**Category**: Integrations

**Priority**: Critical

**Status**: ⏳ Not Started

**Dependencies**:

- [Booking System](./booking-system.md)

**Estimated Effort**: Large (6+ sprints)

## Description

This epic handles all financial transactions on the platform. It involves integrating with Korean payment gateways (PG) to support popular payment methods like Kakao Pay, Naver Pay, and Toss. It also manages the complex logic of holding funds (escrow), calculating platform fees, and processing payouts to artists.

## Key Components

- **Payment Gateway Integration**: PortOne (formerly Iamport) for customer payments.
- **Checkout Flow**: Secure payment processing during booking.
- **Escrow System**: Logic to track funds held for pending services.
- **Manual Payouts**: Admin tool to mark a payout as "Sent" after manual bank transfer.
- **Refund Management**: Handling partial and full refunds.

## Acceptance Criteria

- [ ] Customers can pay using Kakao Pay, Naver Pay, and Credit Cards.
- [ ] Payment is authorized at booking and captured upon confirmation.
- [ ] Admins can view a report of "Pending Payouts" for completed services.
- [ ] Admins can mark a payout as "Completed" after manually transferring funds.
- [ ] Refunds are processed automatically via PG API.

## Technical Requirements

- **Security**: PCI-DSS compliance (via PG). No raw card data stored.
- **Consistency**: Distributed transactions or saga pattern to ensure payment and booking states stay in sync.
- **Audit Logs**: Immutable logs for all financial transactions.
- **Webhooks**: Robust handling of PG webhooks for async status updates.

## User Stories (Examples)

- As a customer, I want to pay quickly using my Kakao Pay wallet.
- As an artist, I want to receive my earnings weekly in my bank account.
- As an admin, I want to see a report of total platform revenue.

## Risks and Assumptions

- **Risk**: Payment failures can lead to lost bookings.
- **Risk**: Fraudulent transactions.
- **Assumption**: We have necessary business licenses to operate as a marketplace.

## Notes

- "Regular payment" (subscription) is not needed for MVP, just one-time payments.
- Need to handle "tipping" if applicable (optional).
