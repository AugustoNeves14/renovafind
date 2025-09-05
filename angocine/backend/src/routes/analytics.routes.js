const express = require('express');
const router = express.Router();
const db = require('../db');

// Record analytics event
router.post('/event', async (req, res) => {
  try {
    const { profile_id, movie_id, event_type, event_data } = req.body;
    
    // Validate required fields
    if (!profile_id || !event_type) {
      return res.status(400).json({ error: true, message: 'Profile ID and event type are required' });
    }
    
    // Check if profile exists
    const profiles = await db.query('SELECT * FROM profiles WHERE id = ?', [profile_id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found' });
    }
    
    // Check if movie exists (if provided)
    if (movie_id) {
      const movies = await db.query('SELECT * FROM movies WHERE id = ?', [movie_id]);
      
      if (movies.length === 0) {
        return res.status(404).json({ error: true, message: 'Movie not found' });
      }
    }
    
    // Record event
    await db.query(`
      INSERT INTO analytics_events (profile_id, movie_id, event_type, event_data)
      VALUES (?, ?, ?, ?)
    `, [
      profile_id, 
      movie_id || null, 
      event_type,
      event_data ? JSON.stringify(event_data) : null
    ]);
    
    res.status(201).json({
      error: false,
      message: 'Event recorded successfully'
    });
  } catch (err) {
    console.error('Error recording analytics event:', err);
    res.status(500).json({ error: true, message: 'Server error while recording event' });
  }
});

// Get user activity for a profile
router.get('/activity/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id;
    
    // Check if profile belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Get recent activity
    const activity = await db.query(`
      SELECT 
        ae.event_type, ae.event_data, ae.created_at,
        m.id as movie_id, m.title as movie_title, m.poster_url
      FROM analytics_events ae
      LEFT JOIN movies m ON ae.movie_id = m.id
      WHERE ae.profile_id = ?
      ORDER BY ae.created_at DESC
      LIMIT 20
    `, [profileId]);
    
    // Format activity data
    const formattedActivity = activity.map(item => {
      let description = '';
      let eventData = null;
      
      try {
        if (item.event_data) {
          eventData = JSON.parse(item.event_data);
        }
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
      
      switch (item.event_type) {
        case 'movie_started':
          description = `Started watching "${item.movie_title}"`;
          break;
        case 'movie_progress':
          description = `Continued watching "${item.movie_title}"`;
          break;
        case 'movie_completed':
          description = `Finished watching "${item.movie_title}"`;
          break;
        case 'movie_rated':
          description = `Rated "${item.movie_title}" ${eventData?.rating || ''} stars`;
          break;
        case 'movie_added_to_watchlist':
          description = `Added "${item.movie_title}" to watchlist`;
          break;
        case 'movie_removed_from_watchlist':
          description = `Removed "${item.movie_title}" from watchlist`;
          break;
        case 'profile_created':
          description = 'Profile was created';
          break;
        case 'profile_updated':
          description = 'Profile was updated';
          break;
        case 'search':
          description = `Searched for "${eventData?.query || 'something'}"`;
          break;
        default:
          description = `${item.event_type.replace(/_/g, ' ')}`;
      }
      
      return {
        id: item.id,
        description,
        event_type: item.event_type,
        movie: item.movie_id ? {
          id: item.movie_id,
          title: item.movie_title,
          poster_url: item.poster_url
        } : null,
        created_at: item.created_at
      };
    });
    
    res.status(200).json({
      error: false,
      data: { activity: formattedActivity }
    });
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching activity' });
  }
});

// Get watch time statistics for a profile
router.get('/watch-time/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id;
    
    // Check if profile belongs to user
    const profiles = await db.query(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [profileId, userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: true, message: 'Profile not found or access denied' });
    }
    
    // Get total watch time
    const totalWatchTimeResult = await db.query(`
      SELECT SUM(watch_time) as total_seconds
      FROM watch_history
      WHERE profile_id = ?
    `, [profileId]);
    
    const totalSeconds = totalWatchTimeResult[0].total_seconds || 0;
    
    // Get watch time by genre
    const watchTimeByGenre = await db.query(`
      SELECT m.genre, SUM(h.watch_time) as total_seconds
      FROM watch_history h
      JOIN movies m ON h.movie_id = m.id
      WHERE h.profile_id = ?
      GROUP BY m.genre
      ORDER BY total_seconds DESC
    `, [profileId]);
    
    // Process genre data (split comma-separated genres)
    const genreMap = new Map();
    
    watchTimeByGenre.forEach(item => {
      if (item.genre) {
        const genres = item.genre.split(',').map(g => g.trim());
        const secondsPerGenre = item.total_seconds / genres.length;
        
        genres.forEach(genre => {
          if (genreMap.has(genre)) {
            genreMap.set(genre, genreMap.get(genre) + secondsPerGenre);
          } else {
            genreMap.set(genre, secondsPerGenre);
          }
        });
      }
    });
    
    const processedGenres = Array.from(genreMap.entries()).map(([genre, seconds]) => ({
      genre,
      total_seconds: Math.round(seconds),
      hours: Math.floor(seconds / 3600),
      percentage: Math.round((seconds / totalSeconds) * 100)
    })).sort((a, b) => b.total_seconds - a.total_seconds);
    
    // Format total watch time
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    res.status(200).json({
      error: false,
      data: {
        total_watch_time: {
          seconds: totalSeconds,
          hours,
          minutes,
          formatted: `${hours}h ${minutes}m`
        },
        watch_time_by_genre: processedGenres
      }
    });
  } catch (err) {
    console.error('Error fetching watch time statistics:', err);
    res.status(500).json({ error: true, message: 'Server error while fetching watch time statistics' });
  }
});

module.exports = router;