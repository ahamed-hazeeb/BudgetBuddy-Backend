const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and success status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include environment information', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('environment');
      expect(response.body.message).toContain('BudgetBuddy');
    });
  });

  describe('GET /api/ml/health', () => {
    it('should return ML service health status', async () => {
      const response = await request(app)
        .get('/api/ml/health')
        .expect('Content-Type', /json/);

      // ML service might be unavailable in test environment
      // So we just check that endpoint exists and returns proper structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      
      // Status can be 200 (if ML service is up) or 503 (if it's down)
      expect([200, 503]).toContain(response.status);
    });

    it('should return proper error structure when ML service is unavailable', async () => {
      const response = await request(app).get('/api/ml/health');

      if (!response.body.success) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('unavailable');
      }
    });
  });
});
