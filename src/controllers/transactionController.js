// controllers/transactionController.js
const transactionModel = require('../models/transactionModel');

exports.addTransaction = (req, res) => {
    const { user_id, amount, category, type, date, note, account_id } = req.body;
    console.log('Received transaction data:', req.body); // Log incoming request

    if (!account_id) {
        return res.status(400).json({ error: 'Account ID is required' });
    }

    transactionModel.addTransaction(user_id, amount, category, type, date, note, account_id, (err, transaction) => {
        if (err) {
            console.error('Error adding transaction:', err.message); // Log error
            return res.status(400).json({ error: err.message });
        }
        console.log('Transaction added:', transaction); // Log success
        res.json(transaction);
    });
};

exports.getTransactions = (req, res) => {
    const { user_id } = req.params;

    transactionModel.getUserTransactions(user_id, (err, transactions) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(transactions);
    });
};

// New: Update transaction
exports.updateTransaction = (req, res) => {
    const { id } = req.params;
    const { user_id, amount, category, type, date, note, account_id } = req.body;
    console.log('Received update transaction data:', { id, ...req.body });

    if (!account_id) {
        return res.status(400).json({ error: 'Account ID is required' });
    }

    transactionModel.updateTransaction(id, user_id, amount, category, type, date, note, account_id, (err, transaction) => {
        if (err) {
            console.error('Error updating transaction:', err.message);
            return res.status(400).json({ error: err.message });
        }
        console.log('Transaction updated:', transaction);
        res.json(transaction);
    });
};

// New: Delete transaction
exports.deleteTransaction = (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // Assuming user_id is sent in the body for authorization
    console.log('Received delete transaction request:', { id, user_id });

    transactionModel.deleteTransaction(id, user_id, (err, result) => {
        if (err) {
            console.error('Error deleting transaction:', err.message);
            return res.status(400).json({ error: err.message });
        }
        console.log('Transaction deleted:', result);
        res.json(result);
    });
};