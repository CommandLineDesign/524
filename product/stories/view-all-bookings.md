# View All Bookings

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Admin  
**I want** to view all bookings with filtering and search  
**So that** I can assist with support tickets and resolve issues

## Detailed Description

Customer support often receives inquiries about specific bookings. Admins need a comprehensive view of all bookings on the platform with the ability to quickly find specific bookings by status, customer name, artist name, or booking ID.

The booking detail view should show all relevant information including booking details, parties involved, messages exchanged, and payment status.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is logged in - **When** they navigate to "Bookings" - **Then** they see a list of all bookings
- **Given** the booking list is displayed - **When** the admin filters by status - **Then** only bookings with that status are shown
- **Given** the booking list is displayed - **When** the admin searches by customer name, artist name, or booking ID - **Then** matching bookings are shown
- **Given** an admin clicks on a booking - **When** the detail view opens - **Then** all booking information is displayed including messages

### Non-Functional Requirements

- **Performance**: List loads within 2 seconds, search within 1 second
- **Usability**: Status filters clearly visible and easy to use
- **Security**: Only authenticated admins can view booking data
- **Privacy**: Booking messages viewable only for support purposes

## User Experience Flow

1. Admin receives support ticket referencing a booking issue
2. Admin navigates to "Bookings" section
3. Admin searches by customer name or booking ID
4. System displays matching bookings
5. Admin clicks on the relevant booking
6. System shows booking detail: date/time, service, status, customer info, artist info
7. Admin views message thread between customer and artist
8. Admin uses information to resolve support ticket

## Technical Context

- **Epic Integration**: Core support functionality for booking oversight
- **System Components**: React-Admin List component, API `/admin/bookings` endpoints
- **Data Requirements**: Read access to bookings, users, and messages tables
- **Integration Points**: Used with Process Manual Refund for dispute resolution

## Definition of Done

- [ ] Booking list displays all bookings with pagination
- [ ] Filter by status (Pending, Confirmed, Completed, Cancelled) works
- [ ] Search by customer name, artist name, and booking ID works
- [ ] Booking detail view shows all relevant information
- [ ] Message thread visible in booking detail
- [ ] Payment/refund status displayed clearly
- [ ] Loading states handled appropriately

## Notes

- React-Admin's filter sidebar works well for status filtering
- Consider adding quick filters for "Today's bookings" and "This week"
- Message display should be read-only for admins (no sending messages as admin)
