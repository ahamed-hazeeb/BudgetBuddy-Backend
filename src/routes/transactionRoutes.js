const express = require('express');
const { addTransaction, getTransactions, updateTransaction, deleteTransaction, trainBudgetModel, predictBudget } = require('../controllers/transactionController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

router.post('/transactions', authMiddleware, addTransaction);
router.get('/transactions/:user_id', authMiddleware, getTransactions);
router.put('/transactions/:id', authMiddleware, updateTransaction);
router.delete('/transactions/:id', authMiddleware, deleteTransaction);

// AI/ML routes
router.post('/train-budget-model', authMiddleware, trainBudgetModel);
router.post('/predict-budget', authMiddleware, predictBudget);

module.exports = router;