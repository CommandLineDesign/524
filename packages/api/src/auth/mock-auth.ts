// Mock authentication for development
// This allows full API testing without external auth providers

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface MockUser {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  role: 'customer' | 'artist' | 'admin';
  profile_image_url?: string;
}

interface AuthRequest extends Request {
  user?: MockUser;
}

// Mock users for API testing with x-mock-user-id header (NOT used by mobile app)
// These are only for direct API testing, mobile app uses real database authentication
export const MOCK_USERS: Record<string, MockUser> = {
  'mock-customer-1': {
    id: '11111111-1111-1111-1111-111111111111',
    phone_number: '010-1234-5678',
    email: 'mock-customer-1@example.com',
    name: 'Mock Customer 1',
    role: 'customer',
  },
  'mock-customer-2': {
    id: '22222222-2222-2222-2222-222222222222',
    phone_number: '010-2345-6789',
    email: 'mock-customer-2@example.com',
    name: 'Mock Customer 2',
    role: 'customer',
  },
  'mock-artist-1': {
    id: '33333333-3333-3333-3333-333333333333',
    phone_number: '010-3456-7890',
    email: 'mock-artist-1@example.com',
    name: 'Mock Artist 1',
    role: 'artist',
  },
  'mock-artist-2': {
    id: '44444444-4444-4444-4444-444444444444',
    phone_number: '010-4567-8901',
    email: 'mock-artist-2@example.com',
    name: 'Mock Artist 2',
    role: 'artist',
  },
  'mock-admin-1': {
    id: '55555555-5555-5555-5555-555555555555',
    phone_number: '010-9999-9999',
    email: 'mock-admin-1@example.com',
    name: 'Mock Admin',
    role: 'admin',
  },
  'artist-g': {
    id: 'b3daace1-85b3-43a4-8f94-a22c1b589213',
    phone_number: '010-0000-0000',
    email: 'testartist@tester.com',
    name: 'testartist',
    role: 'artist',
  },
};

/**
 * Generate mock JWT token
 */
export function generateMockToken(userId: string): string {
  const user = MOCK_USERS[userId];
  if (!user) {
    throw new Error(`Mock user ${userId} not found`);
  }

  return jwt.sign(
    {
      user_id: user.id,
      role: user.role,
      phone_number: user.phone_number,
      mock: true, // Flag to identify mock tokens
    },
    env.JWT_SECRET || 'dev-secret',
    { expiresIn: '24h' }
  );
}

/**
 * Mock login endpoint - returns token for any mock user
 */
export async function mockLogin(req: Request, res: Response) {
  const { userId, role } = req.body;

  // Find user by ID or role
  let user: MockUser | undefined;

  if (userId) {
    user = MOCK_USERS[userId];
  } else if (role) {
    // Find first user with matching role
    user = Object.values(MOCK_USERS).find((u) => u.role === role);
  } else {
    // Default to customer
    user = MOCK_USERS['mock-customer-1'];
  }

  if (!user) {
    return res.status(404).json({
      error: 'Mock user not found',
      available_users: Object.keys(MOCK_USERS),
    });
  }

  const token = generateMockToken(user.id);

  return res.json({
    user,
    token,
    mock: true,
    message: '🎭 Mock authentication - for development only',
  });
}

/**
 * Mock phone OTP - always succeeds
 */
export async function mockSendOTP(req: Request, res: Response) {
  const { phone_number } = req.body;

  return res.json({
    success: true,
    message: '🎭 Mock OTP sent (code: 123456)',
    phone_number,
    mock: true,
  });
}

/**
 * Mock verify OTP - accepts any code
 */
export async function mockVerifyOTP(req: Request, res: Response) {
  const { phone_number, code } = req.body;

  // Find or create mock user for this phone number
  let user = Object.values(MOCK_USERS).find((u) => u.phone_number === phone_number);

  if (!user) {
    // Create new mock user
    user = {
      id: `mock-user-${Date.now()}`,
      phone_number,
      email: `${phone_number.replace(/-/g, '')}@mock.com`,
      name: '테스트 사용자',
      role: 'customer',
    };
  }

  const token = generateMockToken(user.id);

  return res.json({
    user,
    token,
    mock: true,
    message: '🎭 Mock OTP verified',
  });
}

/**
 * Mock OAuth login - simulates Kakao/Naver/Apple
 */
export async function mockOAuthLogin(req: Request, res: Response) {
  const { provider } = req.params; // kakao, naver, apple
  const { role = 'customer' } = req.body;

  const user =
    Object.values(MOCK_USERS).find((u) => u.role === role) || MOCK_USERS['mock-customer-1'];
  const token = generateMockToken(user.id);

  return res.json({
    user,
    token,
    provider,
    mock: true,
    message: `🎭 Mock ${provider} login`,
  });
}

/**
 * Get mock user info
 */
export async function getMockUserInfo(req: AuthRequest, res: Response) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  return res.json({
    ...user,
    mock: true,
    available_test_users: Object.keys(MOCK_USERS),
  });
}
