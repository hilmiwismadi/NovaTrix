// Authentication Controller

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password) and token
    const { passwordHash, ...userData } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, server just acknowledges)
 */
export const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // Server can optionally maintain a blacklist of tokens (not implemented here)

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The authenticated user no longer exists'
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching user data'
    });
  }
};
