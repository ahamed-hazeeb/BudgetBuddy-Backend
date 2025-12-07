// routes/reportRoutes.js
const express = require('express');
const { getFinancialReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/reports/:user_id', authenticateToken, getFinancialReport);

module.exports = router;