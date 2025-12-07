const db = require('../config/db');

exports.addTransaction = (user_id, amount, category, type, date, note, account_id, callback) => {
    const insertQuery = `
        INSERT INTO transactions (user_id, account_id, amount, category, type, date, note) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id
    `;
    
    db.query(insertQuery, [user_id, account_id, amount, category, type, date, note], (err, result) => {
        if (err) return callback(err);
        
        const transactionId = result.rows[0].id;
        const balanceChange = type === 'income' ? amount : -amount;
        
        if (account_id) {
            const updateQuery = 'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
            db.query(updateQuery, [balanceChange, account_id], (err) => {
                if (err) return callback(err);
                callback(null, { id: transactionId, user_id, account_id, amount, category, type, date, note });
            });
        } else {
            callback(null, { id: transactionId, user_id, account_id, amount, category, type, date, note });
        }
    });
};

exports.getUserTransactions = (user_id, callback) => {
    const query = 'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC';
    db.query(query, [user_id], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
    });
};

exports.getTransactionsForTraining = (user_id, type, callback) => {
    const query = 'SELECT amount, date FROM transactions WHERE user_id = $1 AND type = $2 ORDER BY date';
    db.query(query, [user_id, type], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
    });
};

exports.updateTransaction = (id, user_id, amount, category, type, date, note, account_id, callback) => {
    const selectQuery = 'SELECT amount, account_id, type FROM transactions WHERE id = $1 AND user_id = $2';
    
    db.query(selectQuery, [id, user_id], (err, result) => {
        if (err) return callback(err);
        if (result.rows.length === 0) return callback(new Error('Transaction not found or unauthorized'));
        
        const original = result.rows[0];
        const oldAmount = original.amount;
        const oldAccountId = original.account_id;
        const oldType = original.type;
        
        const oldBalanceChange = oldType === 'income' ? oldAmount : -oldAmount;
        const newBalanceChange = type === 'income' ? amount : -amount;
        
        const updateQuery = `
            UPDATE transactions 
            SET amount = $1, category = $2, type = $3, date = $4, note = $5, account_id = $6 
            WHERE id = $7 AND user_id = $8
        `;
        
        db.query(updateQuery, [amount, category, type, date, note, account_id, id, user_id], (err) => {
            if (err) return callback(err);
            
            // Handle account balance updates
            if (oldAccountId && oldAccountId !== account_id) {
                // Different accounts - reverse old and apply new
                const revertQuery = 'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
                db.query(revertQuery, [oldBalanceChange, oldAccountId], (err) => {
                    if (err) return callback(err);
                    
                    if (account_id) {
                        const applyQuery = 'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
                        db.query(applyQuery, [newBalanceChange, account_id], (err) => {
                            if (err) return callback(err);
                            callback(null, { id, user_id, amount, category, type, date, note, account_id });
                        });
                    } else {
                        callback(null, { id, user_id, amount, category, type, date, note, account_id });
                    }
                });
            } else if (oldAccountId && oldAccountId === account_id) {
                // Same account - adjust the difference
                const balanceAdjustment = newBalanceChange - oldBalanceChange;
                const adjustQuery = 'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
                db.query(adjustQuery, [balanceAdjustment, account_id], (err) => {
                    if (err) return callback(err);
                    callback(null, { id, user_id, amount, category, type, date, note, account_id });
                });
            } else if (!oldAccountId && account_id) {
                // No old account, add to new account
                const applyQuery = 'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
                db.query(applyQuery, [newBalanceChange, account_id], (err) => {
                    if (err) return callback(err);
                    callback(null, { id, user_id, amount, category, type, date, note, account_id });
                });
            } else {
                callback(null, { id, user_id, amount, category, type, date, note, account_id });
            }
        });
    });
};

exports.deleteTransaction = (id, user_id, callback) => {
    const selectQuery = 'SELECT amount, account_id, type FROM transactions WHERE id = $1 AND user_id = $2';
    
    db.query(selectQuery, [id, user_id], (err, result) => {
        if (err) return callback(err);
        if (result.rows.length === 0) return callback(new Error('Transaction not found or unauthorized'));
        
        const transaction = result.rows[0];
        const { amount, account_id, type } = transaction;
        const balanceChange = type === 'income' ? -amount : amount;
        
        const deleteQuery = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2';
        db.query(deleteQuery, [id, user_id], (err) => {
            if (err) return callback(err);
            
            if (account_id) {
                const updateQuery = 'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
                db.query(updateQuery, [balanceChange, account_id], (err) => {
                    if (err) return callback(err);
                    callback(null, { message: 'Transaction deleted' });
                });
            } else {
                callback(null, { message: 'Transaction deleted' });
            }
        });
    });
};

module.exports = exports;
