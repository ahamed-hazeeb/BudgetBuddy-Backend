// src/routes/futurePlanRoutes.js

const express = require('express');
const { addFuturePlan, getFuturePlans,deleteFuturePlan } = require('../controllers/futurePlanController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

// Add a new future financial plan
router.post('/future-plans', authMiddleware, addFuturePlan);

// Get all future plans for a user
router.get('/future-plans/:user_id', authMiddleware, getFuturePlans);

router.delete('/future-plans/:id', authMiddleware, deleteFuturePlan);

module.exports = router;