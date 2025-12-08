// Authentication routes with mock support
import { type Router as ExpressRouter, Router } from 'express';
import {
  getMockUserInfo,
  mockLogin,
  mockOAuthLogin,
  mockSendOTP,
  mockVerifyOTP,
} from '../../auth/mock-auth.js';
import { features } from '../../config/features.js';
import { type AuthRequest, requireAuth } from '../../middleware/auth.js';
import { AuthService } from '../../services/authService.js';

const router: ExpressRouter = Router();
const authService = new AuthService();

// ========================================
// EMAIL/PASSWORD LOGIN (Development/Testing)
// ========================================

// Email/password login - for dev/testing with seeded mock users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const result = await authService.loginWithEmail(email, password);

    if (!result) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    const status =
      typeof (error as { status?: number }).status === 'number'
        ? (error as { status: number }).status
        : 500;

    if (status === 403 && (error as { code?: string }).code === 'ACCOUNT_BANNED') {
      return res.status(403).json({
        error: 'Account banned',
        reason: (error as { reason?: string }).reason ?? null,
        bannedAt: (error as { bannedAt?: Date }).bannedAt ?? null,
      });
    }

    return res.status(status).json({
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// User signup (customer)
router.post('/signup/user', async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirmPassword are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const result = await authService.registerWithEmail({
      email,
      password,
      role: 'customer',
      name,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Signup/user error:', error);
    const status =
      typeof (error as { status?: number }).status === 'number'
        ? (error as { status: number }).status
        : 500;
    return res.status(status).json({
      error: 'Signup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Artist signup
router.post('/signup/artist', async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirmPassword are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const result = await authService.registerWithEmail({
      email,
      password,
      role: 'artist',
      name,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Signup/artist error:', error);
    const status =
      typeof (error as { status?: number }).status === 'number'
        ? (error as { status: number }).status
        : 500;
    return res.status(status).json({
      error: 'Signup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user (works with email/password or mock auth)
router.get('/me', requireAuth(), async (req: AuthRequest, res) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles ?? [],
      primaryRole: user.roles?.[0] ?? 'customer',
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ========================================
// MOCK AUTHENTICATION (Development Only)
// ========================================

if (!features.USE_REAL_AUTH) {
  // Simple login - get token for any mock user
  router.post('/mock/login', mockLogin);

  // Mock phone OTP flow
  router.post('/phone/send-otp', mockSendOTP);
  router.post('/phone/verify-otp', mockVerifyOTP);

  // Mock OAuth providers
  router.post('/:provider/login', mockOAuthLogin); // /kakao/login, /naver/login, /apple/login

  // Helpful endpoint to list available mock users
  router.get('/mock/users', async (req, res) => {
    // Node16/next requires explicit .js for dynamic imports; see tsconfig moduleResolution.
    const { MOCK_USERS } = await import('../../auth/mock-auth.js');
    res.json({
      message: '🎭 Available mock users for testing',
      users: Object.values(MOCK_USERS),
      usage: {
        method1: 'POST /api/v1/auth/mock/login with { "userId": "mock-customer-1" }',
        method2: 'Add header: x-mock-user-id: mock-customer-1',
        method3: 'POST /api/v1/auth/mock/login with { "role": "customer" }',
      },
    });
  });
}

// ========================================
// REAL AUTHENTICATION (Production)
// ========================================

if (features.USE_REAL_AUTH) {
  // TODO: Implement real auth when providers are ready

  // Phone OTP with SENS
  router.post('/phone/send-otp', async (req, res) => {
    res.status(501).json({
      error: 'Real authentication not implemented yet',
      message: 'Set USE_REAL_AUTH=false to use mock auth',
    });
  });

  router.post('/phone/verify-otp', async (req, res) => {
    res.status(501).json({
      error: 'Real authentication not implemented yet',
      message: 'Set USE_REAL_AUTH=false to use mock auth',
    });
  });

  // Kakao OAuth
  router.post('/kakao/login', async (req, res) => {
    res.status(501).json({
      error: 'Kakao authentication not implemented yet',
      message: 'Waiting for Kakao developer account',
    });
  });

  // Naver OAuth
  router.post('/naver/login', async (req, res) => {
    res.status(501).json({
      error: 'Naver authentication not implemented yet',
      message: 'Waiting for Naver developer account',
    });
  });

  // Apple Sign In
  router.post('/apple/login', async (req, res) => {
    res.status(501).json({
      error: 'Apple authentication not implemented yet',
      message: 'Waiting for Apple developer account',
    });
  });
}

// Common routes (work with both mock and real auth)
router.post('/logout', requireAuth(), async (req, res) => {
  // In mock mode, just return success
  // In real mode, invalidate refresh token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

router.post('/refresh', async (req, res) => {
  // TODO: Implement token refresh
  res.status(501).json({ error: 'Token refresh not implemented yet' });
});

export default router;
