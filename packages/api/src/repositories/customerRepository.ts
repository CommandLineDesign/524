import { eq } from 'drizzle-orm';

import { customerProfiles, users } from '@524/database';

import { db } from '../db/client.js';

export interface CustomerProfileData {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  skinType: string | null;
  skinTone: string | null;
  hairType: string | null;
  hairLength: string | null;
  allergies: unknown;
  sensitivities: unknown;
  medicalNotes: string | null;
  preferredStyles: unknown;
  favoriteArtists: unknown;
  genderPreference: string | null;
  primaryAddress: unknown;
  savedAddresses: unknown;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRatingGiven: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCustomerProfilePayload {
  name?: string;
  skinType?: string | null;
  skinTone?: string | null;
  hairType?: string | null;
  hairLength?: string | null;
  allergies?: unknown;
  sensitivities?: unknown;
  medicalNotes?: string | null;
  preferredStyles?: unknown;
  favoriteArtists?: unknown;
  genderPreference?: string | null;
  primaryAddress?: unknown;
  savedAddresses?: unknown;
}

export class CustomerRepository {
  /**
   * Get customer profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<CustomerProfileData | null> {
    const result = await db
      .select({
        id: customerProfiles.id,
        userId: customerProfiles.userId,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        skinType: customerProfiles.skinType,
        skinTone: customerProfiles.skinTone,
        hairType: customerProfiles.hairType,
        hairLength: customerProfiles.hairLength,
        allergies: customerProfiles.allergies,
        sensitivities: customerProfiles.sensitivities,
        medicalNotes: customerProfiles.medicalNotes,
        preferredStyles: customerProfiles.preferredStyles,
        favoriteArtists: customerProfiles.favoriteArtists,
        genderPreference: customerProfiles.genderPreference,
        primaryAddress: customerProfiles.primaryAddress,
        savedAddresses: customerProfiles.savedAddresses,
        totalBookings: customerProfiles.totalBookings,
        completedBookings: customerProfiles.completedBookings,
        cancelledBookings: customerProfiles.cancelledBookings,
        averageRatingGiven: customerProfiles.averageRatingGiven,
        createdAt: customerProfiles.createdAt,
        updatedAt: customerProfiles.updatedAt,
      })
      .from(customerProfiles)
      .innerJoin(users, eq(users.id, customerProfiles.userId))
      .where(eq(customerProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      ...result[0],
      totalBookings: result[0].totalBookings ?? 0,
      completedBookings: result[0].completedBookings ?? 0,
      cancelledBookings: result[0].cancelledBookings ?? 0,
    };
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    userId: string,
    payload: UpdateCustomerProfilePayload
  ): Promise<CustomerProfileData | null> {
    const { name, ...profileFields } = payload;

    // Update user name if provided
    if (name !== undefined) {
      await db.update(users).set({ name }).where(eq(users.id, userId));
    }

    // Update profile fields if any provided
    const profileUpdateFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profileFields)) {
      if (value !== undefined) {
        profileUpdateFields[key] = value;
      }
    }

    if (Object.keys(profileUpdateFields).length > 0) {
      profileUpdateFields.updatedAt = new Date();
      await db
        .update(customerProfiles)
        .set(profileUpdateFields)
        .where(eq(customerProfiles.userId, userId));
    }

    return this.getProfileByUserId(userId);
  }

  /**
   * Create customer profile if it doesn't exist
   */
  async ensureProfileExists(userId: string): Promise<void> {
    const existing = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(customerProfiles).values({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}
