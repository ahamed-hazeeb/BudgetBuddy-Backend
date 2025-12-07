const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const config = require('../src/config/dotenv');

describe('ML Endpoints', () => {
  let authToken;

  // Create a valid test token for authenticated requests
  beforeAll(() => {
    authToken = jwt.sign(
      { user_id: 1, id: 1 },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/ml/health', () => {
    it('should be accessible without authentication', async () => {
      const response = await request(app)
        .get('/api/ml/health')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('POST /api/ml/train', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ml/train')
        .send({ user_id: 1 })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept authenticated requests', async () => {
      const response = await request(app)
        .post('/api/ml/train')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ user_id: 1 })
        .expect('Content-Type', /json/);

      // Will succeed or fail based on ML service availability and data
      expect(response.body).toHaveProperty('success');
      if (!response.body.success) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('GET /api/ml/predictions', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/ml/predictions')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept authenticated requests with proper structure', async () => {
      const response = await request(app)
        .get('/api/ml/predictions?months=6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/ml/predictions/auto', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/ml/predictions/auto')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept authenticated requests', async () => {
      const response = await request(app)
        .get('/api/ml/predictions/auto?months=6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/ml/goals/timeline', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ml/goals/timeline')
        .send({
          target_amount: 10000,
          current_savings: 2000,
          monthly_savings: 500
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept authenticated requests with valid data', async () => {
      const response = await request(app)
        .post('/api/ml/goals/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target_amount: 10000,
          current_savings: 2000,
          monthly_savings: 500
        })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/ml/goals/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target_amount: 10000
          // missing required fields
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/ml/goals/reverse-plan', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ml/goals/reverse-plan')
        .send({
          target_amount: 10000,
          current_savings: 2000,
          target_date: '2025-12-31'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept authenticated requests with valid data', async () => {
      const response = await request(app)
        .post('/api/ml/goals/reverse-plan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target_amount: 10000,
          current_savings: 2000,
          target_date: '2025-12-31'
        })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/ml/insights', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/ml/insights')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept authenticated requests', async () => {
      const response = await request(app)
        .get('/api/ml/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/ml/insights/summary', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/ml/insights/summary')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept authenticated requests', async () => {
      const response = await request(app)
        .get('/api/ml/insights/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/ml/predictions')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatch(/Invalid token|token/i);
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = jwt.sign(
        { user_id: 1 },
        config.JWT_SECRET,
        { expiresIn: '0s' } // Already expired
      );

      const response = await request(app)
        .get('/api/ml/predictions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatch(/expired|Invalid/i);
    });

    it('should reject requests without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/ml/predictions')
        .set('Authorization', authToken) // Missing "Bearer " prefix
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
