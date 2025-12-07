const express = require('express');
const { setOverallBudget, getOverallBudget, getSpending } = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/budgets/overall', authenticateToken, setOverallBudget);
router.get('/budgets/overall/:user_id', authenticateToken, getOverallBudget);
router.get('/budgets/spending', authenticateToken, getSpending);

module.exports = router;