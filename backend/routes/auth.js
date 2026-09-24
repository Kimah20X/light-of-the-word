const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, preferredLanguage } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    const user = new User({
      email: normalizedEmail,
      preferredLanguage: preferredLanguage || 'ha',
    });

    await user.setPassword(password);
    await user.save();

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Registration error:', err);

    return res.status(500).json({
      error: 'Could not create account. Please try again.',
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        error: 'Incorrect email or password.',
      });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      error: 'Login failed. Please try again.',
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    return res.json({
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Get current user error:', err);

    return res.status(500).json({
      error: 'Could not load your account.',
    });
  }
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
  };
}

module.exports = router;