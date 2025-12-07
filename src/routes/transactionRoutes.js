const express = require('express');
const { addTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/transactions', authenticateToken, addTransaction);
router.get('/transactions/:user_id', authenticateToken, getTransactions);
router.put('/transactions/:id', authenticateToken, updateTransaction);
router.delete('/transactions/:id', authenticateToken, deleteTransaction);

module.exports = router;