const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'angocine-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'angocine-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: true, message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: true, message: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?) RETURNING id',
      [username, email, hashedPassword]
    );
    
    // Create default profile
    const userId = db.USE_SQLITE ? result[0] : result[0].id;
    await db.query(
      'INSERT INTO profiles (user_id, name, avatar, is_kid) VALUES (?, ?, ?, ?)',
      [userId, username, `https://i.pravatar.cc/150?u=${email}`, false]
    );
    
    // Generate tokens
    const token = jwt.sign(
      { id: userId, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: userId, username, email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    
    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: {
        token,
        refreshToken,
        user: {
          id: userId,
          username,
          email,
          role: 'user'
        }
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: true, message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }
    
    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }
    
    // Generate tokens
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    
    // Get user profiles
    const profiles = await db.query('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
    
    res.status(200).json({
      error: false,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profiles: profiles
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: true, message: 'Server error during login' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: true, message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user
    const users = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid refresh token' });
    }
    
    const user = users[0];
    
    // Generate new access token
    const newToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      error: false,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ error: true, message: 'Invalid refresh token' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: true, message: 'Email is required' });
    }
    
    // Check if user exists
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        error: false,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // In a real application, send an email with a reset link
    // For this demo, we'll just return a success message
    
    res.status(200).json({
      error: false,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;