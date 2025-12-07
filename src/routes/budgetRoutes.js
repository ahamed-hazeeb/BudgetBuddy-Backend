const express = require('express');
const { setOverallBudget, getOverallBudget, getSpending } = require('../controllers/budgetController');

const router = express.Router();

router.post('/budgets/overall', setOverallBudget);
router.get('/budgets/overall/:user_id', getOverallBudget);
router.get('/budgets/spending', getSpending);

module.exports = router;