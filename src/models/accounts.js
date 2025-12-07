const db = require('../config/db');

class Account {
  static getAccountsByUserId(userId, callback) {
    db.all('SELECT * FROM accounts WHERE user_id = ?', [userId], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }

  static createAccount(userId, accountType, balance, callback) {
    db.run(
      'INSERT INTO accounts (user_id, account_type, balance) VALUES (?, ?, ?)',
      [userId, accountType, balance],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, user_id: userId, account_type: accountType, balance });
      }
    );
  }

  static updateAccountBalance(accountId, balance, callback) {
    db.run(
      'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [balance, accountId],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: accountId, balance });
      }
    );
  }
}

module.exports = Account;