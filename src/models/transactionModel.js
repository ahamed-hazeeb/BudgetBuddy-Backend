// // models/transactionModel.js
// const db = require('../config/db');

// exports.addTransaction = (user_id, amount, category, type, date, note, account_id, callback) => {
//     db.run(
//         `INSERT INTO transactions (user_id, account_id, amount, category, type, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [user_id, account_id, amount, category, type, date, note],
//         function (err) {
//             if (err) {
//                 return callback(err);
//             }
//             const transactionId = this.lastID;

//             // Update account balance
//             const balanceChange = type === 'income' ? amount : -amount;
//             db.run(
//                 `UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//                 [balanceChange, account_id],
//                 (err) => {
//                     if (err) {
//                         return callback(err);
//                     }
//                     callback(null, { id: transactionId, user_id, account_id, amount, category, type, date, note });
//                 }
//             );
//         }
//     );
// };

// exports.getUserTransactions = (user_id, callback) => {
//     db.all(`SELECT * FROM transactions WHERE user_id = ?`, [user_id], (err, rows) => {
//         callback(err, rows);
//     });
// };

// // New method to fetch transaction data for training
// exports.getTransactionsForTraining = (user_id, type, callback) => {
//     db.all(`SELECT amount, date FROM transactions WHERE user_id = ? AND type = ?`, [user_id, type], (err, rows) => {
//         callback(err, rows);
//     });
// };
// exports.updateTransaction = (id, user_id, amount, category, type, date, note, account_id, callback) => {
//     db.get(`SELECT amount, account_id, type FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err, original) => {
//         if (err) return callback(err);
//         if (!original) return callback(new Error('Transaction not found or unauthorized'));

//         const oldAmount = original.amount;
//         const oldAccountId = original.account_id;
//         const oldType = original.type;

//         const oldBalanceChange = oldType === 'income' ? oldAmount : -oldAmount;
//         const newBalanceChange = type === 'income' ? amount : -amount;

//         db.serialize(() => {
//             db.run(
//                 `UPDATE transactions SET amount = ?, category = ?, type = ?, date = ?, note = ?, account_id = ? WHERE id = ? AND user_id = ?`,
//                 [amount, category, type, date, note, account_id, id, user_id],
//                 (err) => {
//                     if (err) return callback(err);

//                     if (oldAccountId && oldAccountId !== account_id) {
//                         db.run(
//                             `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
//                             [oldBalanceChange, oldAccountId],
//                             (err) => {
//                                 if (err) return callback(err);
//                                 if (account_id) {
//                                     db.run(
//                                         `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
//                                         [newBalanceChange, account_id],
//                                         (err) => {
//                                             if (err) return callback(err);
//                                             callback(null, { id, user_id, amount, category, type, date, note, account_id });
//                                         }
//                                     );
//                                 } else {
//                                     callback(null, { id, user_id, amount, category, type, date, note, account_id });
//                                 }
//                             }
//                         );
//                     } else if (oldAccountId && oldAccountId === account_id) {
//                         const balanceAdjustment = newBalanceChange - oldBalanceChange;
//                         db.run(
//                             `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
//                             [balanceAdjustment, account_id],
//                             (err) => {
//                                 if (err) return callback(err);
//                                 callback(null, { id, user_id, amount, category, type, date, note, account_id });
//                             }
//                         );
//                     } else if (!oldAccountId && account_id) {
//                         db.run(
//                             `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
//                             [newBalanceChange, account_id],
//                             (err) => {
//                                 if (err) return callback(err);
//                                 callback(null, { id, user_id, amount, category, type, date, note, account_id });
//                             }
//                         );
//                     } else {
//                         callback(null, { id, user_id, amount, category, type, date, note, account_id });
//                     }
//                 }
//             );
//         });
//     });
// };
// // New: Delete a transaction
// exports.deleteTransaction = (id, user_id, callback) => {
//     // Fetch the transaction to reverse the balance
//     db.get(`SELECT amount, account_id, type FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err, transaction) => {
//         if (err) return callback(err);
//         if (!transaction) return callback(new Error('Transaction not found or unauthorized'));

//         const { amount, account_id, type } = transaction;
//         const balanceChange = type === 'income' ? -amount : amount; // Reverse the original effect

//         db.serialize(() => {
//             // Delete the transaction
//             db.run(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err) => {
//                 if (err) return callback(err);

//                 // Update the account balance
//                 db.run(
//                     `UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//                     [balanceChange, account_id],
//                     (err) => {
//                         if (err) return callback(err);
//                         callback(null, { message: 'Transaction deleted' });
//                     }
//                 );
//             });
//         });
//     });
// };

// module.exports = exports;

const db = require('../config/db');

exports.addTransaction = (user_id, amount, category, type, date, note, account_id, callback) => {
    db.run(
        `INSERT INTO transactions (user_id, account_id, amount, category, type, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, account_id, amount, category, type, date, note],
        function (err) {
            if (err) {
                return callback(err);
            }
            const transactionId = this.lastID;
            const balanceChange = type === 'income' ? amount : -amount;
            if (account_id) {
                db.run(
                    `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                    [balanceChange, account_id],
                    (err) => {
                        if (err) return callback(err);
                        callback(null, { id: transactionId, user_id, account_id, amount, category, type, date, note });
                    }
                );
            } else {
                callback(null, { id: transactionId, user_id, account_id, amount, category, type, date, note });
            }
        }
    );
};

exports.getUserTransactions = (user_id, callback) => {
    db.all(`SELECT * FROM transactions WHERE user_id = ?`, [user_id], (err, rows) => {
        callback(err, rows);
    });
};

exports.getTransactionsForTraining = (user_id, type, callback) => {
    db.all(`SELECT amount, date FROM transactions WHERE user_id = ? AND type = ?`, [user_id, type], (err, rows) => {
        callback(err, rows);
    });
};

exports.updateTransaction = (id, user_id, amount, category, type, date, note, account_id, callback) => {
    db.get(`SELECT amount, account_id, type FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err, original) => {
        if (err) return callback(err);
        if (!original) return callback(new Error('Transaction not found or unauthorized'));

        const oldAmount = original.amount;
        const oldAccountId = original.account_id;
        const oldType = original.type;

        const oldBalanceChange = oldType === 'income' ? oldAmount : -oldAmount;
        const newBalanceChange = type === 'income' ? amount : -amount;

        db.serialize(() => {
            db.run(
                `UPDATE transactions SET amount = ?, category = ?, type = ?, date = ?, note = ?, account_id = ? WHERE id = ? AND user_id = ?`,
                [amount, category, type, date, note, account_id, id, user_id],
                (err) => {
                    if (err) return callback(err);

                    if (oldAccountId && oldAccountId !== account_id) {
                        db.run(
                            `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
                            [oldBalanceChange, oldAccountId],
                            (err) => {
                                if (err) return callback(err);
                                if (account_id) {
                                    db.run(
                                        `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                                        [newBalanceChange, account_id],
                                        (err) => {
                                            if (err) return callback(err);
                                            callback(null, { id, user_id, amount, category, type, date, note, account_id });
                                        }
                                    );
                                } else {
                                    callback(null, { id, user_id, amount, category, type, date, note, account_id });
                                }
                            }
                        );
                    } else if (oldAccountId && oldAccountId === account_id) {
                        const balanceAdjustment = newBalanceChange - oldBalanceChange;
                        db.run(
                            `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                            [balanceAdjustment, account_id],
                            (err) => {
                                if (err) return callback(err);
                                callback(null, { id, user_id, amount, category, type, date, note, account_id });
                            }
                        );
                    } else if (!oldAccountId && account_id) {
                        db.run(
                            `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                            [newBalanceChange, account_id],
                            (err) => {
                                if (err) return callback(err);
                                callback(null, { id, user_id, amount, category, type, date, note, account_id });
                            }
                        );
                    } else {
                        callback(null, { id, user_id, amount, category, type, date, note, account_id });
                    }
                }
            );
        });
    });
};

exports.deleteTransaction = (id, user_id, callback) => {
    db.get(`SELECT amount, account_id, type FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err, transaction) => {
        if (err) return callback(err);
        if (!transaction) return callback(new Error('Transaction not found or unauthorized'));

        const { amount, account_id, type } = transaction;
        const balanceChange = type === 'income' ? -amount : amount;

        db.serialize(() => {
            db.run(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, [id, user_id], (err) => {
                if (err) return callback(err);
                if (account_id) {
                    db.run(
                        `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
                        [balanceChange, account_id],
                        (err) => {
                            if (err) return callback(err);
                            callback(null, { message: 'Transaction deleted' });
                        }
                    );
                } else {
                    callback(null, { message: 'Transaction deleted' });
                }
            });
        });
    });
};

module.exports = exports;