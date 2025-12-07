const express = require('express');
const { addTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

router.post('/transactions', authMiddleware, addTransaction);
router.get('/transactions/:user_id', authMiddleware, getTransactions);
router.put('/transactions/:id', authMiddleware, updateTransaction);
router.delete('/transactions/:id', authMiddleware, deleteTransaction);

module.exports = router;