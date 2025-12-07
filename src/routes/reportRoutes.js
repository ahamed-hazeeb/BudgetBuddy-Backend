// routes/reportRoutes.js
const express = require('express');
const { getFinancialReport } = require('../controllers/reportController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

router.get('/reports/:user_id', authMiddleware, getFinancialReport);

module.exports = router;