const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_email_campaign_app_2026_capstone', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Please provide a valid email address.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Trigger welcome email to newly registered user
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) =>
      console.error('[Welcome Email Background Error]', err)
    );

    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Server error during registration');
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Server error during login');
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'User profile fetched successfully', {
      user: req.user,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Server error fetching user profile');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
