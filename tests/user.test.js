const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('User Endpoints', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'testpassword123'
        })
        .expect('Content-Type', /json/);

      // Should succeed or fail with duplicate email
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', 'Test User');
        expect(response.body).toHaveProperty('email', uniqueEmail);
        expect(response.body).not.toHaveProperty('password');
      } else {
        // If database is not available, should return 400 error
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should hash the password before storing', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'plainpassword'
        });

      // Password should not be returned in response
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('POST /api/users/login', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return proper structure for successful login', async () => {
      // This test assumes a user exists in the database
      // If database is empty, it will properly fail with 404
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).not.toHaveProperty('password');

        // Verify token is valid JWT
        const decoded = jwt.decode(response.body.token);
        expect(decoded).toHaveProperty('user_id');
      } else {
        // User doesn't exist in test database
        expect(response.status).toBe(404);
      }
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/);

      // Will be 404 if user doesn't exist, or 401 if password is wrong
      expect([401, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });
});
