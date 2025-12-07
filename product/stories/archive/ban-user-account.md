# Ban User Account

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: Medium
**Status**: ✅ Completed
**Dependencies**:

- [View and Edit Users](./view-edit-users.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Admin  
**I want** to ban abusive users from the platform  
**So that** the community remains safe and trustworthy

## Detailed Description

When users violate platform policies or behave abusively, admins need the ability to ban their accounts. Banned users should not be able to log in, make bookings, or receive bookings (if they are artists).

The ban action should require a reason for accountability and should be reversible (unban) in case of mistakes or appeals.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is viewing a user's detail page - **When** they click "Ban User" - **Then** a modal appears requesting a ban reason
- **Given** the ban modal is shown - **When** the admin enters a reason and confirms - **Then** the user status changes to "Banned"
- **Given** a user is banned - **When** they try to log in - **Then** they receive an "Account banned" message
- **Given** a user is banned - **When** viewing their profile - **Then** an "Unban" button is available

### Non-Functional Requirements

- **Performance**: Ban/unban actions complete within 1 second
- **Security**: Only authenticated admins can ban/unban users
- **Audit**: Ban actions logged with admin ID, timestamp, and reason
- **Reliability**: Active sessions for banned users should be invalidated

## User Experience Flow

1. Admin identifies an abusive user from reports or review
2. Admin navigates to the user's detail page
3. Admin clicks "Ban User" button
4. System displays modal with reason input field
5. Admin enters reason: "Repeated no-shows on bookings"
6. Admin clicks "Confirm Ban"
7. System updates user status and invalidates sessions
8. System displays confirmation: "User banned successfully"

## Technical Context

- **Epic Integration**: User moderation capability for platform safety
- **System Components**: React-Admin custom action, API `POST /admin/users/:id/ban`
- **Data Requirements**: Write access to user status, create ban_log entry
- **Integration Points**: Depends on View and Edit Users for user navigation

## Definition of Done

- [ ] Ban button visible on user detail page
- [ ] Ban modal requires reason input
- [ ] Ban action updates user status correctly
- [ ] Banned users cannot log in
- [ ] Unban action available and functional
- [ ] Ban/unban actions logged with reason and admin
- [ ] Active sessions invalidated on ban

## Notes

- Consider soft-ban vs hard-ban (soft = can't act, hard = can't access at all)
- For MVP, implement immediate hard ban with session invalidation
- Future: Add ban duration options (temporary vs permanent)
