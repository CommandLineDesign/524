# Roles and Flows

## Role model
- Roles are many-to-many via `user_roles` (enum: `customer`, `artist`, `admin`, `support`).
- Users keep `users.role` for backward compatibility, but authorization must use `user_roles`.
- Admin/support are privileged roles; artist/customer can co-exist on the same account.

## Artist lifecycle
- `artist_profiles.verification_status` (enum): `pending_review` → `in_review` → `verified` → `rejected`/`suspended`.
- `account_status` remains for operational pause (`active`, etc.).
- Review metadata: `reviewed_by`, `review_notes`, `reviewed_at`; `verified_at` already present.

## Signup and review flows
- Artist signup: create `artist_profiles` with `verification_status = pending_review`, add `artist` role; keep/add `customer` role so the same account can book.
- Pending experience: when an account has `artist` role and `verification_status` is not `verified`, show the “pending/review/rejected” screen instead of the customer experience.
- Approval: set `verification_status = verified`, ensure `artist` role exists, optionally record `reviewed_by/at/notes`, keep `customer` role if the artist should also book.
- Rejection/suspension: set status (`rejected`/`suspended`), store `review_notes`, gate artist capabilities.

## Authorization rules
- Artist capabilities require both: role `artist` in `user_roles` AND `verification_status = verified`.
- Admin-only endpoints use `user_roles` (`admin`) via middleware.
- Customer flows require `customer` role.
- Mixed accounts should provide a context switcher (artist vs customer) after login.

## Data backfill and safety
- Migration backfills `user_roles` from existing `users.role` and adds `artist` role for every `artist_profiles` row.
- Verification statuses are normalized to the enum values (default `pending_review`).

## Logging and audit
- Record reviewer, notes, and timestamp on status transitions.
- Consider audit logging transitions (pending→verified/rejected/suspended) for traceability.
