const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_email_campaign_app_2026_capstone');

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return sendError(res, 401, 'User associated with this token no longer exists.');
      }

      req.user = user;
      return next();
    } catch (error) {
      return sendError(res, 401, 'Not authorized, invalid token');
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }
};

module.exports = { protect };
