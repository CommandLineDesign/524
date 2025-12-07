# Populate Artist Profile

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: High
**Status**: 📝 In Progress
**Dependencies**:

- [View Pending Artists](./view-pending-artists.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Admin  
**I want** to populate an artist's profile and portfolio  
**So that** customers can discover and book them after activation

## Detailed Description

After reviewing a pending artist signup, the admin needs to help complete their profile before activation. This includes adding a display name, bio, specialties, portfolio images, pricing information, and service offerings.

For the pilot phase, admins will manually gather this information from artists (via calls/messages) and enter it into the system. This ensures quality control and consistency across artist profiles during the initial launch.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is viewing an artist detail page - **When** they click "Edit Profile" - **Then** they see a form with all editable profile fields
- **Given** the edit form is open - **When** the admin fills in display name, bio, and specialties - **Then** the changes are saved when they click "Save"
- **Given** the edit form is open - **When** the admin uploads portfolio images - **Then** the images are previewed and associated with the artist
- **Given** the edit form is open - **When** the admin adds service offerings with pricing - **Then** the services are saved and associated with the artist

### Non-Functional Requirements

- **Performance**: Image uploads complete within 10 seconds for files up to 5MB
- **Usability**: Form has clear labels and validation messages
- **Security**: Only authenticated admins can edit artist profiles

## User Experience Flow

1. Admin navigates to a pending artist's detail page
2. Admin clicks "Edit Profile" button
3. System displays the edit form with current values (if any)
4. Admin enters/updates display name and bio
5. Admin selects specialties from predefined categories
6. Admin uploads portfolio images (drag-and-drop or file picker)
7. Admin adds service offerings with descriptions and pricing
8. Admin clicks "Save" to persist changes
9. System shows success notification and returns to detail view

## Technical Context

- **Epic Integration**: Enables artist profiles to be complete before activation
- **System Components**: React-Admin Edit component, Image upload to S3/storage, Service CRUD
- **Data Requirements**: Write access to artists, portfolio_images, and services tables
- **Integration Points**: Depends on View Pending Artists; required before Activate Artist Account

## Definition of Done

- [ ] Edit form displays all required profile fields
- [ ] Text fields save and display correctly
- [ ] Image upload works and displays preview
- [ ] Multiple images can be uploaded and reordered
- [ ] Service offerings can be added, edited, and removed
- [ ] Form validation prevents incomplete submissions
- [ ] Success/error notifications displayed appropriately

## Notes

- Consider using React-Admin's `<ImageInput>` for portfolio uploads
- Specialties should be selectable from a predefined list for consistency
- For MVP, pricing can be simple (hourly rate) without complex packages
