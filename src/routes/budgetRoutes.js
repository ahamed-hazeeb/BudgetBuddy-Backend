const express = require('express');
const { setOverallBudget, getOverallBudget, predictMonthlyBudget ,trainBudgetModel ,getSpending } = require('../controllers/budgetController');

const router = express.Router();

router.post('/budgets/overall', setOverallBudget);
router.get('/budgets/overall/:user_id', getOverallBudget);
router.post('/budgets/predict', predictMonthlyBudget);
router.post('/budgets/train', trainBudgetModel);
router.get('/budgets/spending', getSpending); // New route
module.exports = router;