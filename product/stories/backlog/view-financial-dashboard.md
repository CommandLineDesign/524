# View Financial Dashboard

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: Low
**Status**: ⏳ Not Started
**Dependencies**:

- [View All Bookings](./view-all-bookings.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Admin  
**I want** to view financial reporting metrics  
**So that** I can monitor revenue, payouts, and refunds

## Detailed Description

The financial dashboard provides admins with visibility into the platform's financial health. It displays key metrics such as total revenue, pending payouts, completed payouts, and refunds over configurable time periods.

For the MVP/pilot phase, this is a read-only dashboard for visibility. Actual payout processing is done manually through the payment provider. As the platform scales, this will integrate with automated payout systems.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is logged in - **When** they navigate to "Financials" - **Then** they see the financial dashboard
- **Given** the dashboard is displayed - **When** viewing default state - **Then** metrics for the current month are shown
- **Given** the dashboard is displayed - **When** the admin selects a different date range - **Then** metrics update to reflect that period
- **Given** the dashboard is displayed - **When** viewing revenue - **Then** total bookings value, platform commission, and artist payouts are shown

### Non-Functional Requirements

- **Performance**: Dashboard loads within 3 seconds
- **Usability**: Key metrics visible at a glance with clear labels
- **Security**: Only authenticated admins can view financial data
- **Accuracy**: Metrics calculated correctly from source data

## User Experience Flow

1. Admin navigates to "Financials" section
2. System displays dashboard with current month metrics
3. Admin views summary cards: Revenue, Payouts, Refunds
4. Admin changes date range to "Last 7 days"
5. System recalculates and updates all metrics
6. Admin drills down to see breakdown by artist or service category
7. Admin exports data for external reporting (optional)

## Technical Context

- **Epic Integration**: Business visibility for operations and planning
- **System Components**: React-Admin Dashboard, custom chart components
- **Data Requirements**: Read access to bookings, payments, and refunds tables
- **Integration Points**: Uses same booking/payment data as View All Bookings

## Definition of Done

- [ ] Financial dashboard page renders correctly
- [ ] Summary cards show revenue, payouts, and refunds
- [ ] Date range selector filters all metrics
- [ ] Metrics calculate correctly from source data
- [ ] Charts display revenue trends (if included)
- [ ] Loading states handled during data fetch
- [ ] Numbers formatted appropriately (currency, percentages)

## Notes

- For MVP, focus on simple summary metrics over complex charts
- Consider using React-Admin's dashboard components or a library like Recharts
- Metrics to track: Gross revenue, Platform commission, Artist payouts, Refunds
- Future: Add comparison to previous period, export functionality
