const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all movies with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      year,
      language,
      rating,
      sort = 'release_year',
      order = 'desc',
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (genre) {
      conditions.push('genre LIKE ?');
      params.push(`%${genre}%`);
    }
    
    if (year) {
      conditions.push('release_year = ?');
      params.push(year);
    }
    
    if (language) {
      conditions.push('language = ?');
      params.push(language);
    }
    
    if (rating) {
      conditions.push('rating >= ?');
      params.push(rating);
    }
    
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR director LIKE ? OR cast LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['title', 'release_year', 'rating', 'duration'];
    const sortField = validSortFields.includes(sort) ? sort : 'release_year';
    
    // Validate order
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM movies ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = db.USE_SQLITE ? countResult[0].total : parseInt(countResult[0].total);
    
    // Get movies
    const query = `
      SELECT id, title, description, release_year, duration, genre, director,
             poster_url, backdrop_url, rating, language, maturity_rating
      FROM movies
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
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

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get movie details
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    const movie = movies[0];
    
    // Get reviews
    const reviews = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);
    
    // Get average rating
    const ratingResult = await db.query(`
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE movie_id = ?
    `, [id]);
    
    const averageRating = ratingResult[0].average_rating || movie.rating;
    const totalReviews = ratingResult[0].total_reviews || 0;
    
    // Get similar movies based on genre
    const similarMovies = await db.query(`
      SELECT id, title, poster_url, release_year, rating
      FROM movies
      WHERE genre LIKE ? AND id != ?
      ORDER BY rating DESC
      LIMIT 6
    `, [`%${movie.genre.split(',')[0].trim()}%`, id]);
    
    res.status(200).json({
      error: false,
      data: {
        movie,
        reviews,
        ratings: {
          average: parseFloat(averageRating).toFixed(1),
          total: totalReviews
        },
        similar_movies: similarMovies
      }
    });
  } catch (err) {
    console.error('Error fetching movie details:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching movie details' });
  }
});

// Get movie genres (for filters)
router.get('/filters/genres', async (req, res) => {
  try {
    const movies = await db.query('SELECT DISTINCT genre FROM movies');
    
    // Extract and flatten genres
    const genreSet = new Set();
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(',').forEach(g => {
          genreSet.add(g.trim());
        });
      }
    });
    
    const genres = Array.from(genreSet).sort();
    
    res.status(200).json({
      error: false,
      data: { genres }
    });
  } catch (err) {
    console.error('Error fetching genres:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching genres' });
  }
});

// Get movie languages (for filters)
router.get('/filters/languages', async (req, res) => {
  try {
    const movies = await db.query('SELECT DISTINCT language FROM movies');
    
    // Extract languages
    const languages = movies.map(movie => movie.language).filter(Boolean).sort();
    
    res.status(200).json({
      error: false,
      data: { languages }
    });
  } catch (err) {
    console.error('Error fetching languages:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching languages' });
  }
});

// Get movie years (for filters)
router.get('/filters/years', async (req, res) => {
  try {
    const movies = await db.query('SELECT DISTINCT release_year FROM movies ORDER BY release_year DESC');
    
    // Extract years
    const years = movies.map(movie => movie.release_year).filter(Boolean);
    
    res.status(200).json({
      error: false,
      data: { years }
    });
  } catch (err) {
    console.error('Error fetching years:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching years' });
  }
});

// Add review to movie (requires authentication)
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: true, message: 'Rating must be between 1 and 5' });
    }
    
    // Check if movie exists
    const movies = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (movies.length === 0) {
      return res.status(404).json({ error: true, message: 'Movie not found' });
    }
    
    // Check if user already reviewed this movie
    const existingReviews = await db.query(
      'SELECT * FROM reviews WHERE user_id = ? AND movie_id = ?',
      [userId, id]
    );
    
    if (existingReviews.length > 0) {
      // Update existing review
      await db.query(
        'UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND movie_id = ?',
        [rating, comment || '', userId, id]
      );
      
      res.status(200).json({
        error: false,
        message: 'Review updated successfully'
      });
    } else {
      // Create new review
      await db.query(
        'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
        [userId, id, rating, comment || '']
      );
      
      res.status(201).json({
        error: false,
        message: 'Review added successfully'
      });
    }
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: true, message: 'Server error while adding review' });
  }
});

// Search movies
router.get('/search/query', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: true, message: 'Search query is required' });
    }
    
    const query = `
      SELECT id, title, poster_url, release_year, genre
      FROM movies
      WHERE title LIKE ? OR description LIKE ? OR director LIKE ? OR cast LIKE ?
      LIMIT ?
    `;
    
    const searchTerm = `%${q}%`;
    const movies = await db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);
    
    res.status(200).json({
      error: false,
      data: { movies }
    });
  } catch (err) {
    console.error('Error searching movies:', err);
    res.status(500).json({ error: true, message: 'Server error while searching movies' });
  }
});

module.exports = router;