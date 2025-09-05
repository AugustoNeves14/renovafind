const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Mock database functions
jest.mock('../src/db', () => ({
  query: jest.fn(),
  USE_SQLITE: true,
  initializeDatabase: jest.fn().mockResolvedValue(true)
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return 200 OK with status message', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'AngoCine API is running');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      // Mock database responses
      db.query
        .mockResolvedValueOnce([]) // No existing users
        .mockResolvedValueOnce([{ id: 1 }]) // User creation result
        .mockResolvedValueOnce([]); // Profile creation result

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('error', false);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('username', 'testuser');
    });

    it('should login a user', async () => {
      // Mock database responses for login
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8iBFZPxFJkjPJO', // hashed 'password123'
        role: 'user'
      };
      
      db.query
        .mockResolvedValueOnce([mockUser]) // Find user
        .mockResolvedValueOnce([]); // Get profiles

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error', false);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('Movies', () => {
    it('should get a list of movies', async () => {
      // Mock database responses
      db.query
        .mockResolvedValueOnce([{ total: 20 }]) // Count result
        .mockResolvedValueOnce([
          {
            id: 1,
            title: 'Test Movie',
            release_year: 2024,
            genre: 'Action',
            rating: 8.5
          }
        ]); // Movies result

      const response = await request(app).get('/api/movies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error', false);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should get movie details', async () => {
      // Mock database responses
      const mockMovie = {
        id: 1,
        title: 'Test Movie',
        description: 'A test movie description',
        release_year: 2024,
        genre: 'Action',
        rating: 8.5
      };
      
      db.query
        .mockResolvedValueOnce([mockMovie]) // Movie details
        .mockResolvedValueOnce([]) // Reviews
        .mockResolvedValueOnce([{ average_rating: 8.5, total_reviews: 10 }]) // Rating stats
        .mockResolvedValueOnce([]); // Similar movies

      const response = await request(app).get('/api/movies/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error', false);
      expect(response.body.data).toHaveProperty('movie');
      expect(response.body.data).toHaveProperty('reviews');
      expect(response.body.data).toHaveProperty('ratings');
      expect(response.body.data).toHaveProperty('similar_movies');
    });
  });
});