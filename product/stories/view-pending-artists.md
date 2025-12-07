# View Pending Artists Queue

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: High
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Admin  
**I want** to view a list of pending artist signups  
**So that** I can review new applicants and begin the activation process

## Detailed Description

When artists sign up for the platform, they start in a "Pending" status and require admin review before they can operate. This story provides admins with a dedicated queue view showing all pending artist registrations, allowing them to quickly identify new signups that need attention.

The queue should display key information at a glance (name, contact info, signup date) and allow sorting/filtering to help admins prioritize their review workflow. This is the starting point for the artist activation workflow.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is logged in - **When** they navigate to the Pending Artists page - **Then** they see a list of all artists with "Pending" status
- **Given** pending artists exist - **When** the list is displayed - **Then** each entry shows artist name, email, phone, and signup date
- **Given** multiple pending artists exist - **When** viewing the list - **Then** the admin can sort by signup date (newest/oldest first)
- **Given** the list has more than 25 entries - **When** viewing the list - **Then** the results are paginated

### Non-Functional Requirements

- **Performance**: Page load time < 2 seconds
- **Usability**: List should be scannable with clear visual hierarchy
- **Security**: Only authenticated admins can access this view

## User Experience Flow

1. Admin logs into the admin dashboard
2. Admin clicks "Pending Artists" in the navigation
3. System displays a table of pending artist signups
4. Admin scans the list and identifies an artist to review
5. Admin clicks on an artist row to view their details

## Technical Context

- **Epic Integration**: First step in the artist activation workflow
- **System Components**: React-Admin List component, API `/admin/artists?status=pending` endpoint
- **Data Requirements**: Read access to users table filtered by role=artist and status=pending
- **Integration Points**: Links to Populate Artist Profile and Activate Artist Account stories

## Definition of Done

- [ ] List component renders pending artists correctly
- [ ] Sorting by signup date works in both directions
- [ ] Pagination works with React-Admin defaults
- [ ] Click on row navigates to artist detail view
- [ ] Only admins can access this view
- [ ] Loading and empty states handled appropriately

## Notes

- Use React-Admin's built-in `<List>` and `<Datagrid>` components
- Consider adding a count badge in the navigation for pending artists
