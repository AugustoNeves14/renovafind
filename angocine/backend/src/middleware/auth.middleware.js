const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'angocine-secret-key';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'Access denied. No token provided.' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: true, message: 'Invalid token.' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin
};