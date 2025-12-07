const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { authenticateToken } = require('../middleware/auth');

// ML Service health check (public endpoint)
router.get('/health', mlController.healthCheck);

// Train model for user (authenticated)
router.post('/train', authenticateToken, mlController.trainModel);

// Get predictions (authenticated)
router.get('/predictions', authenticateToken, mlController.getPredictions);

// Get predictions with auto-training (authenticated)
router.get('/predictions/auto', authenticateToken, mlController.getOrTrainPredictions);

// Calculate goal timeline (authenticated)
router.post('/goals/timeline', authenticateToken, mlController.calculateGoalTimeline);

// Reverse plan a goal (authenticated)
router.post('/goals/reverse-plan', authenticateToken, mlController.reversePlanGoal);

// Get user insights (authenticated)
router.get('/insights', authenticateToken, mlController.getUserInsights);

// Get insights summary (authenticated)
router.get('/insights/summary', authenticateToken, mlController.getInsightsSummary);

module.exports = router;
