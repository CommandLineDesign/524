# View and Edit Users

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Admin  
**I want** to view and edit user accounts (customers and artists)  
**So that** I can manage user data and resolve account issues

## Detailed Description

Admins need a comprehensive view of all users on the platform, including both customers and artists. This allows them to search for specific users, view account details, and make necessary edits to resolve support issues or correct data errors.

The user management interface should support filtering by user type (customer/artist), searching by name/email/phone, and inline editing of common fields.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is logged in - **When** they navigate to "Users" - **Then** they see a paginated list of all users
- **Given** the user list is displayed - **When** the admin filters by type - **Then** only customers or artists are shown
- **Given** the user list is displayed - **When** the admin searches by name, email, or phone - **Then** matching users are shown
- **Given** an admin clicks on a user - **When** the detail view opens - **Then** all user information is displayed
- **Given** an admin is viewing user details - **When** they edit and save changes - **Then** the user data is updated

### Non-Functional Requirements

- **Performance**: Search results return within 1 second
- **Usability**: Common fields editable without navigating to separate page
- **Security**: Only authenticated admins can view and edit user data
- **Audit**: All edits should be logged for accountability

## User Experience Flow

1. Admin navigates to "Users" section
2. System displays list of all users with type indicator
3. Admin uses filter dropdown to select "Customers" or "Artists"
4. Admin types search query (name/email/phone)
5. System filters list in real-time
6. Admin clicks on a user to view details
7. Admin edits relevant fields and clicks "Save"
8. System saves changes and displays confirmation

## Technical Context

- **Epic Integration**: Core admin functionality for user management
- **System Components**: React-Admin List and Edit components, API `/admin/users` endpoints
- **Data Requirements**: Read/write access to users table
- **Integration Points**: User data used by Booking Oversight and other admin features

## Definition of Done

- [ ] User list displays all users with pagination
- [ ] Filter by user type (customer/artist) works
- [ ] Search by name, email, and phone works
- [ ] User detail view shows all relevant information
- [ ] Edit form allows updating user fields
- [ ] Changes are persisted and confirmed
- [ ] Audit log captures admin edits

## Notes

- Consider which fields should be editable vs read-only
- Phone verification status should be displayed but not editable
- For MVP, focus on basic fields: name, email, phone, status
