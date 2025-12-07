# Admin Dashboard

**Category**: Admin Panel

**Priority**: Medium

**Status**: 📝 In Progress

**Dependencies**:

- [Auth System](./auth-system.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

This epic covers the internal tools required to manage the platform. The admin dashboard is the control center for operations, customer support, and business analysis. It allows admins to verify artists, resolve disputes, manage users, and view key performance indicators.

## Key Components

- **Pending Artist Queue**: View new artist signups awaiting review and activation.
- **Artist Profile Editor**: Populate and edit artist profiles, portfolios, and services.
- **Activation Toggle**: Enable an artist to start accepting bookings.
- **User Management**: View, edit, and ban users (customers and artists).
- **Booking Oversight**: View details of any booking to assist with support tickets.
- **Financial Reporting**: Dashboard for revenue, payouts, and refunds.

## Acceptance Criteria

- [ ] Admins can view a list of "Pending" artist signups.
- [ ] Admins can click into an artist and populate their profile/portfolio.
- [ ] Admins can click "Activate" to enable the artist.
- [ ] Admins can view a list of all bookings and filter by status.
- [ ] Admins can manually trigger a refund.

## Technical Requirements

- **Framework**: React-Admin (SPA mode) mounted within Next.js or as a standalone app.
- **Styling**: Material UI (MUI) as provided by React-Admin.
- **Data Provider**: Custom data provider connecting to the API.
- **Access Control**: React-Admin `authProvider` for role-based permissions.

## User Stories

### Artist Activation Workflow

- [View Pending Artists](../stories/view-pending-artists.md): List and filter pending artist signups
- [Populate Artist Profile](../stories/populate-artist-profile.md): Edit artist profile and portfolio
- [Activate Artist Account](../stories/activate-artist-account.md): Enable artists to accept bookings

### User Management

- [View and Edit Users](../stories/view-edit-users.md): Search and manage user accounts
- [Ban User Account](../stories/ban-user-account.md): Remove abusive users from platform

### Booking Oversight

- [View All Bookings](../stories/view-all-bookings.md): Support ticket assistance via booking list
- [Process Manual Refund](../stories/process-manual-refund.md): Handle customer dispute refunds

### Financial Reporting

- [View Financial Dashboard](../stories/view-financial-dashboard.md): Revenue, payouts, and refund metrics

## Risks and Assumptions

- **Risk**: Customizing MUI can be more complex than utility classes if deep branding is needed.
- **Assumption**: Standard Material Design look and feel is acceptable for internal tools.

## Notes

- Use `react-admin` for rapid development of CRUD views.
- Ensure the admin app is isolated from customer-facing styles to avoid conflicts.
