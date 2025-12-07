const db = require('../config/db');

class BudgetModel {
  // Add or update the overall monthly budget
  static setOverallBudget(user_id, amount, start_date, end_date, callback) {
    db.run(
      `INSERT OR REPLACE INTO budgets (user_id, amount, start_date, end_date) 
       VALUES (?, ?, ?, ?)`,
      [user_id, amount, start_date, end_date],
      function (err) {
        callback(err, { id: this.lastID, user_id, amount, start_date, end_date, status: 'active' });
      }
    );
  }

  // Get the current overall budget
  static getOverallBudget(user_id, callback) {
    db.get(
      `SELECT * FROM budgets WHERE user_id = ? ORDER BY start_date DESC LIMIT 1`,
      [user_id],
      (err, row) => {
        callback(err, row);
      }
    );
  }

  // Get spending for a date range
  static getSpending(user_id, start_date, end_date, callback) {
    db.get(
        `SELECT SUM(amount) as total_spent 
        FROM transactions 
        WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?`,
        [user_id, start_date, end_date],
        (err, row) => {
            if (err) return callback(err);
            callback(null, [{ total_spent: row.total_spent || 0 }]); // Return as array to match frontend expectation
        }
      );
    }
}

module.exports = BudgetModel;
