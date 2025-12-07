export type Role = 'customer' | 'artist' | 'admin' | 'support';

const ROLE_PRIORITY: Role[] = ['admin', 'support', 'artist', 'customer'];

export function hasAllowedRole(userRoles: string[] | undefined, allowedRoles: Role[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some((role) => allowedRoles.includes(role as Role));
}

export function selectPrimaryRole(userRoles: string[] | undefined): Role {
  if (!userRoles || userRoles.length === 0) return 'customer';
  for (const role of ROLE_PRIORITY) {
    if (userRoles.includes(role)) return role;
  }
  return userRoles[0] as Role;
}

export function isArtistVerified(
  userRoles: string[] | undefined,
  verificationStatus: string | null | undefined
): boolean {
  return (userRoles ?? []).includes('artist') && verificationStatus === 'verified';
}
