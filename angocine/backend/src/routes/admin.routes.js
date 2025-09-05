const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAdmin } = require('../middleware/auth.middleware');

// Apply admin middleware to all routes
router.use(isAdmin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = db.USE_SQLITE ? usersResult[0].count : parseInt(usersResult[0].count);
    
    // Get total movies
    const moviesResult = await db.query('SELECT COUNT(*) as count FROM movies');
    const totalMovies = db.USE_SQLITE ? moviesResult[0].count : parseInt(moviesResult[0].count);
    
    // Get total profiles
    const profilesResult = await db.query('SELECT COUNT(*) as count FROM profiles');
    const totalProfiles = db.USE_SQLITE ? profilesResult[0].count : parseInt(profilesResult[0].count);
    
    // Get total reviews
    const reviewsResult = await db.query('SELECT COUNT(*) as count FROM reviews');
    const totalReviews = db.USE_SQLITE ? reviewsResult[0].count : parseInt(reviewsResult[0].count);
    
    // Get recent users
    const recentUsers = await db.query(`
      SELECT id, username, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    // Get top rated movies
    const topRatedMovies = await db.query(`
      SELECT id, title, rating, release_year
      FROM movies
      ORDER BY rating DESC
      LIMIT 5
    `);
    
    // Get recent reviews
    const recentReviews = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.username, m.title as movie_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN movies m ON r.movie_id = m.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);
    
    // Get analytics events count
    const analyticsResult = await db.query('SELECT COUNT(*) as count FROM analytics_events');
    const totalEvents = db.USE_SQLITE ? analyticsResult[0].count : parseInt(analyticsResult[0].count);
    
    res.status(200).json({
      error: false,
      data: {
        stats: {
          total_users: totalUsers,
          total_movies: totalMovies,
          total_profiles: totalProfiles,
          total_reviews: totalReviews,
          total_events: totalEvents
        },
        recent_users: recentUsers,
        top_rated_movies: topRatedMovies,
        recent_reviews: recentReviews
      }
    });
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching admin dashboard' });
  }
});

// Get all users (with pagination)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (search) {
      conditions.push('(username LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get users
    const query = `
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const users = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    
    res.status(200).json({
      error: false,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching users' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user data
    const users = await db.query('SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user profiles
    const profiles = await db.query('SELECT * FROM profiles WHERE user_id = ?', [id]);
    
    // Get user reviews
    const reviews = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, m.title as movie_title
      FROM reviews r
      JOIN movies m ON r.movie_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);
    
    // Get watchlist count
    const watchlistResult = await db.query(
      'SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?',
      [id]
    );
    const watchlistCount = db.USE_SQLITE ? watchlistResult[0].count : parseInt(watchlistResult[0].count);
    
    res.status(200).json({
      error: false,
      data: {
        user,
        profiles,
        reviews,
        stats: {
          profile_count: profiles.length,
          review_count: reviews.length,
          watchlist_count: watchlistCount
        }
      }
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching user details' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: true, message: 'Invalid role' });
    }
    
    // Check if user exists
    const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    // Update role
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    res.status(200).json({
      error: false,
      message: 'User role updated successfully'
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: true, message: 'Server error while updating user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    // Prevent deleting the last admin
    if (users[0].role === 'admin') {
      const adminCountResult = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
      const adminCount = db.USE_SQLITE ? adminCountResult[0].count : parseInt(adminCountResult[0].count);
      
      if (adminCount <= 1) {
        return res.status(400).json({ error: true, message: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user (cascades to profiles, watchlist, etc.)
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.status(200).json({
      error: false,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: true, message: 'Server error while deleting user' });
  }
});

// Get all movies (with pagination)
router.get('/movies', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR director LIKE ? OR cast LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM movies ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get movies
    const query = `
      SELECT id, title, release_year, genre, rating, language, created_at, updated_at
      FROM movies
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const movies = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    
    res.status(200).json({
      error: false,
      data: {
        movies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching movies' });
  }
});

// Get movie details
router.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get movie details
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    const movie = movies[0];
    
    // Get review count
    const reviewCountResult = await db.query(
      'SELECT COUNT(*) as count FROM reviews WHERE movie_id = ?',
      [id]
    );
    const reviewCount = db.USE_SQLITE ? reviewCountResult[0].count : parseInt(reviewCountResult[0].count);
    
    // Get watchlist count
    const watchlistCountResult = await db.query(
      'SELECT COUNT(*) as count FROM watchlist WHERE movie_id = ?',
      [id]
    );
    const watchlistCount = db.USE_SQLITE ? watchlistCountResult[0].count : parseInt(watchlistCountResult[0].count);
    
    // Get watch history count
    const historyCountResult = await db.query(
      'SELECT COUNT(*) as count FROM watch_history WHERE movie_id = ?',
      [id]
    );
    const historyCount = db.USE_SQLITE ? historyCountResult[0].count : parseInt(historyCountResult[0].count);
    
    res.status(200).json({
      error: false,
      data: {
        movie,
        stats: {
          review_count: reviewCount,
          watchlist_count: watchlistCount,
          history_count: historyCount
        }
      }
    });
  } catch (err) {
    console.error('Error fetching movie details:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching movie details' });
  }
});

// Create movie
router.post('/movies', async (req, res) => {
  try {
    const {
      title, description, release_year, duration, genre, director, cast,
      poster_url, backdrop_url, trailer_url, video_url, rating, language, maturity_rating
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: true, message: 'Movie title is required' });
    }
    
    // Create movie
    const result = await db.query(`
      INSERT INTO movies (
        title, description, release_year, duration, genre, director, cast,
        poster_url, backdrop_url, trailer_url, video_url, rating, language, maturity_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
    `, [
      title, description || '', release_year || null, duration || null, genre || '',
      director || '', cast || '', poster_url || '', backdrop_url || '',
      trailer_url || '', video_url || '', rating || null, language || '', maturity_rating || ''
    ]);
    
    const movieId = db.USE_SQLITE ? result[0] : result[0].id;
    
    // Get created movie
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [movieId]);
    
    res.status(201).json({
      error: false,
      message: 'Movie created successfully',
      data: { movie: movies[0] }
    });
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ error: true, message: 'Server error while creating movie' });
  }
});

// Update movie
router.put('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, release_year, duration, genre, director, cast,
      poster_url, backdrop_url, trailer_url, video_url, rating, language, maturity_rating
    } = req.body;
    
    // Check if movie exists
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    // Update movie
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (release_year !== undefined) {
      updates.push('release_year = ?');
      params.push(release_year);
    }
    
    if (duration !== undefined) {
      updates.push('duration = ?');
      params.push(duration);
    }
    
    if (genre !== undefined) {
      updates.push('genre = ?');
      params.push(genre);
    }
    
    if (director !== undefined) {
      updates.push('director = ?');
      params.push(director);
    }
    
    if (cast !== undefined) {
      updates.push('cast = ?');
      params.push(cast);
    }
    
    if (poster_url !== undefined) {
      updates.push('poster_url = ?');
      params.push(poster_url);
    }
    
    if (backdrop_url !== undefined) {
      updates.push('backdrop_url = ?');
      params.push(backdrop_url);
    }
    
    if (trailer_url !== undefined) {
      updates.push('trailer_url = ?');
      params.push(trailer_url);
    }
    
    if (video_url !== undefined) {
      updates.push('video_url = ?');
      params.push(video_url);
    }
    
    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }
    
    if (language !== undefined) {
      updates.push('language = ?');
      params.push(language);
    }
    
    if (maturity_rating !== undefined) {
      updates.push('maturity_rating = ?');
      params.push(maturity_rating);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: true, message: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Execute update
    await db.query(
      `UPDATE movies SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );
    
    // Get updated movie
    const updatedMovies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    res.status(200).json({
      error: false,
      message: 'Movie updated successfully',
      data: { movie: updatedMovies[0] }
    });
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ error: true, message: 'Server error while updating movie' });
  }
});

// Delete movie
router.delete('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if movie exists
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    // Delete movie (cascades to reviews, watchlist, history)
    await db.query('DELETE FROM movies WHERE id = ?', [id]);
    
    res.status(200).json({
      error: false,
      message: 'Movie deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: true, message: 'Server error while deleting movie' });
  }
});

// Get all reviews (with pagination)
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as total FROM reviews');
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get reviews
    const reviews = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.username, u.id as user_id,
             m.title as movie_title, m.id as movie_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN movies m ON r.movie_id = m.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);
    
    res.status(200).json({
      error: false,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching reviews' });
  }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review exists
    const reviews = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ error: true, message: 'Review not found' });
    }
    
    // Delete review
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    
    res.status(200).json({
      error: false,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: true, message: 'Server error while deleting review' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let timeFilter;
    switch (period) {
      case 'day':
        timeFilter = "datetime('now', '-1 day')";
        break;
      case 'week':
        timeFilter = "datetime('now', '-7 days')";
        break;
      case 'month':
        timeFilter = "datetime('now', '-30 days')";
        break;
      case 'year':
        timeFilter = "datetime('now', '-365 days')";
        break;
      default:
        timeFilter = "datetime('now', '-7 days')";
    }
    
    // Get event counts by type
    const eventCounts = await db.query(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= ${timeFilter}
      GROUP BY event_type
      ORDER BY count DESC
    `);
    
    // Get top movies by watch count
    const topMovies = await db.query(`
      SELECT m.id, m.title, COUNT(h.id) as watch_count
      FROM movies m
      JOIN watch_history h ON m.id = h.movie_id
      WHERE h.last_watched >= ${timeFilter}
      GROUP BY m.id, m.title
      ORDER BY watch_count DESC
      LIMIT 10
    `);
    
    // Get user registrations over time
    const userRegistrations = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${timeFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    // Get completion rate
    const completionRate = await db.query(`
      SELECT 
        COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count,
        COUNT(*) as total_count
      FROM watch_history
      WHERE last_watched >= ${timeFilter}
    `);
    
    const rate = completionRate[0].total_count > 0 
      ? (completionRate[0].completed_count / completionRate[0].total_count * 100).toFixed(2)
      : 0;
    
    res.status(200).json({
      error: false,
      data: {
        event_counts: eventCounts,
        top_movies: topMovies,
        user_registrations: userRegistrations,
        completion_rate: parseFloat(rate)
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching analytics' });
  }
});

module.exports = router;