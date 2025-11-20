// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Trim potential surrounding quotes and whitespace
    const cleanedToken = token?.trim().replace(/^"|"$/g, '');

    // Verify token
    const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);

    // Support payloads that include either `id` or `_id`
    const userId = decoded.id || decoded._id;

    // Attach user to request
    req.user = await User.findById(userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    next();
  } catch (err) {
    // Provide a short preview of the Authorization header to help debugging
    try {
      const headerPreview = authHeader
        ? `${authHeader.slice(0, 20)}${authHeader.length > 20 ? '...' : ''}`
        : 'none';
      console.error('Auth error:', err.name, err.message, 'authHeaderPreview:', headerPreview);
    } catch (e) {
      console.error('Auth error:', err.name, err.message);
    }
    // Return specific message for easier debugging in development
    res.status(401).json({ message: err.message || 'Token is not valid' });
  }
};

module.exports = authMiddleware;

