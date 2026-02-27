import type { Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { CustomerRepository } from '../repositories/customerRepository.js';

const customerRepository = new CustomerRepository();

export const CustomerController = {
  /**
   * GET /api/v1/customers/me/profile
   * Get current customer's profile
   */
  async getMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Ensure profile exists (creates if not)
      await customerRepository.ensureProfileExists(userId);

      const profile = await customerRepository.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Error getting customer profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * PATCH /api/v1/customers/me/profile
   * Update current customer's profile
   */
  async updateMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Ensure profile exists before updating
      await customerRepository.ensureProfileExists(userId);

      const allowedFields = [
        'name',
        'skinType',
        'skinTone',
        'hairType',
        'hairLength',
        'allergies',
        'sensitivities',
        'medicalNotes',
        'preferredStyles',
        'favoriteArtists',
        'genderPreference',
        'primaryAddress',
        'savedAddresses',
      ];

      const payload: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          payload[field] = req.body[field];
        }
      }

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const profile = await customerRepository.updateProfile(userId, payload);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Error updating customer profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
