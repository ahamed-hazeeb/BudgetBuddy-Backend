const db = require('../config/db');

class Account {
  static getAccountsByUserId(userId, callback) {
    const query = 'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC';
    
    db.query(query, [userId], (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    });
  }

  static createAccount(userId, accountType, balance, callback) {
    const query = `
      INSERT INTO accounts (user_id, account_type, balance, created_at, updated_at) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING id
    `;
    
    db.query(query, [userId, accountType, balance], (err, result) => {
      if (err) return callback(err);
      callback(null, { 
        id: result.rows[0].id, 
        user_id: userId, 
        account_type: accountType, 
        balance 
      });
    });
  }

  static updateAccountBalance(accountId, balance, callback) {
    const query = 'UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    
    db.query(query, [balance, accountId], (err, result) => {
      if (err) return callback(err);
      callback(null, { id: accountId, balance });
    });
  }
}

module.exports = Account;
