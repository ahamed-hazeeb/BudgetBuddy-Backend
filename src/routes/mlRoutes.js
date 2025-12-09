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

// Advanced Predictions
router.post('/predictions/expense/advanced', authenticateToken, mlController.getAdvancedExpenseForecast);

// Financial Health
router.get('/insights/health-score', authenticateToken, mlController.getHealthScore);
router.get('/insights/trends/:user_id', authenticateToken, mlController.getHealthTrends);
router.get('/insights/benchmark/:user_id', authenticateToken, mlController.getBenchmark);

// Smart Budgeting
router.post('/budget/recommend', authenticateToken, mlController.getBudgetRecommendations);
router.post('/budget/alerts', authenticateToken, mlController.getBudgetAlerts);
router.post('/budget/optimize', authenticateToken, mlController.optimizeBudget);

// Personalized Recommendations
router.get('/recommendations/habits/:user_id', authenticateToken, mlController.getSpendingHabits);
router.get('/recommendations/opportunities/:user_id', authenticateToken, mlController.getSavingsOpportunities);
router.get('/recommendations/nudges/:user_id', authenticateToken, mlController.getBehaviorNudges);

// Model Performance
router.get('/models/performance/:user_id', authenticateToken, mlController.getModelPerformance);

module.exports = router;
