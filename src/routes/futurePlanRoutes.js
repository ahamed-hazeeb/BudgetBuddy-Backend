// src/routes/futurePlanRoutes.js

const express = require('express');
const { addFuturePlan, getFuturePlans,deleteFuturePlan } = require('../controllers/futurePlanController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add a new future financial plan
router.post('/future-plans', authenticateToken, addFuturePlan);

// Get all future plans for a user
router.get('/future-plans/:user_id', authenticateToken, getFuturePlans);

router.delete('/future-plans/:id', authenticateToken, deleteFuturePlan);

module.exports = router;