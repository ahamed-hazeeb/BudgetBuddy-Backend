const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

// ML Service health check
router.get('/health', mlController.healthCheck);

// Train model for user
router.post('/train', mlController.trainModel);

// Get predictions
router.get('/predictions', mlController.getPredictions);

// Get predictions with auto-training
router.get('/predictions/auto', mlController.getOrTrainPredictions);

// Calculate goal timeline
router.post('/goals/timeline', mlController.calculateGoalTimeline);

// Reverse plan a goal
router.post('/goals/reverse-plan', mlController.reversePlanGoal);

// Get user insights
router.get('/insights', mlController.getUserInsights);

// Get insights summary
router.get('/insights/summary', mlController.getInsightsSummary);

module.exports = router;
