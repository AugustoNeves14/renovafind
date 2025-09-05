const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const users = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user profiles
    const profiles = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    
    // Get watchlist count
    const watchlistResult = await db.query(
      'SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?',
      [userId]
    );
    const watchlistCount = db.USE_SQLITE ? watchlistResult[0].count : parseInt(watchlistResult[0].count);
    
    // Get history count
    const historyResult = await db.query(`
      SELECT COUNT(DISTINCT movie_id) as count 
      FROM watch_history 
      WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = ?)
    `, [userId]);
    const historyCount = db.USE_SQLITE ? historyResult[0].count : parseInt(historyResult[0].count);
    
    res.status(200).json({
      error: false,
      data: {
        user,
        profiles,
        stats: {
          watchlist_count: watchlistCount,
          history_count: historyCount
        }
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching user profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, current_password, new_password } = req.body;
    
    // Get current user data
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUsers = await db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ error: true, message: 'Email already in use' });
      }
    }
    
    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUsers = await db.query('SELECT * FROM users WHERE username = ? AND id != ?', [username, userId]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ error: true, message: 'Username already in use' });
      }
    }
    
    // Update user data
    const updates = [];
    const params = [];
    
    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    // If password change is requested
    if (current_password && new_password) {
      // Verify current password
      const validPassword = await bcrypt.compare(current_password, user.password);
      
      if (!validPassword) {
        return res.status(400).json({ error: true, message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: true, message: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Execute update
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...params, userId]
    );
    
    res.status(200).json({
      error: false,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: true, message: 'Server error while updating user profile' });
  }
});

// Get user profiles
router.get('/profiles', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profiles
    const profiles = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    
    res.status(200).json({
      error: false,
      data: { profiles }
    });
  } catch (err) {
    console.error('Error fetching user profiles:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching user profiles' });
  }
});

// Create new profile
router.post('/profiles', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar, is_kid } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: true, message: 'Profile name is required' });
    }
    
    // Check profile limit (max 5 profiles per user)
    const profilesResult = await db.query(
      'SELECT COUNT(*) as count FROM profiles WHERE user_id = ?',
      [userId]
    );
    const profileCount = db.USE_SQLITE ? profilesResult[0].count : parseInt(profilesResult[0].count);
    
    if (profileCount >= 5) {
      return res.status(400).json({ error: true, message: 'Maximum profile limit reached (5)' });
    }
    
    // Create profile
    const result = await db.query(
      'INSERT INTO profiles (user_id, name, avatar, is_kid) VALUES (?, ?, ?, ?) RETURNING id',
      [userId, name, avatar || `https://i.pravatar.cc/150?u=${Date.now()}`, is_kid ? 1 : 0]
    );
    
    const profileId = db.USE_SQLITE ? result[0] : result[0].id;
    
    // Get created profile
    const profiles = await db.query('SELECT * FROM profiles WHERE id = ?', [profileId]);
    
    res.status(201).json({
      error: false,
      message: 'Profile created successfully',
      data: { profile: profiles[0] }
    });
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ error: true, message: 'Server error while creating profile' });
  }
});

// Update profile
router.put('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = req.params.id;
    const { name, avatar, is_kid } = req.body;
    
    // Check if profile exists and belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Update profile
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    
    if (is_kid !== undefined) {
      updates.push('is_kid = ?');
      params.push(is_kid ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: true, message: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Execute update
    await db.query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`,
      [...params, profileId]
    );
    
    // Get updated profile
    const updatedProfiles = await db.query('SELECT * FROM profiles WHERE id = ?', [profileId]);
    
    res.status(200).json({
      error: false,
      message: 'Profile updated successfully',
      data: { profile: updatedProfiles[0] }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: true, message: 'Server error while updating profile' });
  }
});

// Delete profile
router.delete('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = req.params.id;
    
    // Check if profile exists and belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Check if it's the last profile
    const profilesResult = await db.query(
      'SELECT COUNT(*) as count FROM profiles WHERE user_id = ?',
      [userId]
    );
    const profileCount = db.USE_SQLITE ? profilesResult[0].count : parseInt(profilesResult[0].count);
    
    if (profileCount <= 1) {
      return res.status(400).json({ error: true, message: 'Cannot delete the last profile' });
    }
    
    // Delete profile
    await db.query('DELETE FROM profiles WHERE id = ?', [profileId]);
    
    res.status(200).json({
      error: false,
      message: 'Profile deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ error: true, message: 'Server error while deleting profile' });
  }
});

// Get user watchlist
router.get('/watchlist', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM watchlist WHERE user_id = ?',
      [userId]
    );
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get watchlist items with movie details
    const watchlist = await db.query(`
      SELECT m.id, m.title, m.poster_url, m.backdrop_url, m.release_year, m.rating, m.genre, w.added_at
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);
    
    res.status(200).json({
      error: false,
      data: {
        watchlist,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching watchlist' });
  }
});

// Add movie to watchlist
router.post('/watchlist/:movieId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    // Check if movie exists
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [movieId]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    // Check if movie is already in watchlist
    const existingItems = await db.query(
      'SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    
    if (existingItems.length > 0) {
      return res.status(409).json({ error: true, message: 'Movie already in watchlist' });
    }
    
    // Add to watchlist
    await db.query(
      'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );
    
    res.status(201).json({
      error: false,
      message: 'Movie added to watchlist'
    });
  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ error: true, message: 'Server error while adding to watchlist' });
  }
});

// Remove movie from watchlist
router.delete('/watchlist/:movieId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    // Remove from watchlist
    await db.query(
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    
    res.status(200).json({
      error: false,
      message: 'Movie removed from watchlist'
    });
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    res.status(500).json({ error: true, message: 'Server error while removing from watchlist' });
  }
});

// Check if movie is in watchlist
router.get('/watchlist/check/:movieId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    // Check watchlist
    const items = await db.query(
      'SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    
    res.status(200).json({
      error: false,
      data: {
        in_watchlist: items.length > 0
      }
    });
  } catch (err) {
    console.error('Error checking watchlist:', err);
    res.status(500).json({ error: true, message: 'Server error while checking watchlist' });
  }
});

// Get watch history for a profile
router.get('/history/:profileId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Check if profile belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM watch_history WHERE profile_id = ?',
      [profileId]
    );
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get history items with movie details
    const history = await db.query(`
      SELECT 
        h.id, h.movie_id, h.watch_time, h.completed, h.last_watched,
        m.title, m.poster_url, m.backdrop_url, m.duration, m.release_year
      FROM watch_history h
      JOIN movies m ON h.movie_id = m.id
      WHERE h.profile_id = ?
      ORDER BY h.last_watched DESC
      LIMIT ? OFFSET ?
    `, [profileId, parseInt(limit), parseInt(offset)]);
    
    // Calculate progress for each item
    const historyWithProgress = history.map(item => {
      const progress = item.duration > 0 ? Math.min(100, Math.round((item.watch_time / (item.duration * 60)) * 100)) : 0;
      return {
        ...item,
        progress
      };
    });
    
    res.status(200).json({
      error: false,
      data: {
        history: historyWithProgress,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching watch history:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching watch history' });
  }
});

// Update watch history
router.post('/history/:profileId/:movieId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId, movieId } = req.params;
    const { watch_time, completed } = req.body;
    
    // Check if profile belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Check if movie exists
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [movieId]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    // Check if history entry exists
    const historyItems = await db.query(
      'SELECT * FROM watch_history WHERE profile_id = ? AND movie_id = ?',
      [profileId, movieId]
    );
    
    if (historyItems.length > 0) {
      // Update existing entry
      await db.query(`
        UPDATE watch_history 
        SET watch_time = ?, completed = ?, last_watched = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = ? AND movie_id = ?
      `, [watch_time, completed ? 1 : 0, profileId, movieId]);
    } else {
      // Create new entry
      await db.query(`
        INSERT INTO watch_history (profile_id, movie_id, watch_time, completed)
        VALUES (?, ?, ?, ?)
      `, [profileId, movieId, watch_time, completed ? 1 : 0]);
    }
    
    // Record analytics event
    await db.query(`
      INSERT INTO analytics_events (profile_id, movie_id, event_type, event_data)
      VALUES (?, ?, ?, ?)
    `, [
      profileId, 
      movieId, 
      completed ? 'movie_completed' : 'movie_progress',
      JSON.stringify({ watch_time, completed: completed ? 1 : 0 })
    ]);
    
    res.status(200).json({
      error: false,
      message: 'Watch history updated successfully'
    });
  } catch (err) {
    console.error('Error updating watch history:', err);
    res.status(500).json({ error: true, message: 'Server error while updating watch history' });
  }
});

// Get recommendations for a profile
router.get('/recommendations/:profileId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if profile belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Get watched genres
    const watchedGenres = await db.query(`
      SELECT DISTINCT m.genre
      FROM watch_history h
      JOIN movies m ON h.movie_id = m.id
      WHERE h.profile_id = ?
      LIMIT 5
    `, [profileId]);
    
    // If no watch history, return top rated movies
    if (watchedGenres.length === 0) {
      const topRated = await db.query(`
        SELECT id, title, poster_url, backdrop_url, release_year, rating, genre
        FROM movies
        ORDER BY rating DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      return res.status(200).json({
        error: false,
        data: {
          recommendations: topRated,
          based_on: 'top_rated'
        }
      });
    }
    
    // Extract genres and create search conditions
    const genres = [];
    watchedGenres.forEach(item => {
      if (item.genre) {
        item.genre.split(',').forEach(g => {
          genres.push(g.trim());
        });
      }
    });
    
    // Get watched movie IDs to exclude
    const watchedMovies = await db.query(`
      SELECT movie_id
      FROM watch_history
      WHERE profile_id = ?
    `, [profileId]);
    
    const watchedIds = watchedMovies.map(item => item.movie_id);
    
    // Build query to find movies with similar genres
    let query = `
      SELECT id, title, poster_url, backdrop_url, release_year, rating, genre
      FROM movies
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add exclusion for watched movies
    if (watchedIds.length > 0) {
      const placeholders = watchedIds.map(() => '?').join(',');
      query += ` AND id NOT IN (${placeholders})`;
      params.push(...watchedIds);
    }
    
    // Add genre conditions
    if (genres.length > 0) {
      query += ' AND (';
      const genreConditions = genres.map(() => 'genre LIKE ?');
      query += genreConditions.join(' OR ');
      query += ')';
      
      genres.forEach(genre => {
        params.push(`%${genre}%`);
      });
    }
    
    query += ' ORDER BY rating DESC LIMIT ?';
    params.push(parseInt(limit));
    
    // Execute query
    const recommendations = await db.query(query, params);
    
    res.status(200).json({
      error: false,
      data: {
        recommendations,
        based_on: 'watch_history'
      }
    });
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching recommendations' });
  }
});

module.exports = router;