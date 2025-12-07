// src/models/futurePlanModel.js

const db = require('../config/db');

class FuturePlan {
    // Add a new future financial plan
    static addFuturePlan(user_id, goal_name, target_amount, current_savings, target_date, monthly_savings, callback) {
        db.run(
            `INSERT INTO future_plans (user_id, goal_name, target_amount, current_savings, target_date, monthly_savings) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, goal_name, target_amount, current_savings, target_date, monthly_savings],
            function (err) {
                if (err) return callback(err);
                callback(null, {
                    id: this.lastID,
                    user_id,
                    goal_name,
                    target_amount,
                    current_savings,
                    target_date,
                    monthly_savings,
                });
            }
        );
    }
    // Get all future plans for a user
    static getFuturePlans(user_id, callback) {
        db.all(`SELECT * FROM future_plans WHERE user_id = ?`, [user_id], (err, rows) => {
            callback(err, rows);
        });
    }


    static deleteFuturePlan(planId, userId, callback) {
        db.run('DELETE FROM future_plans WHERE id = ? AND user_id = ?', [planId, userId], function (err) {
          if (err) return callback(err);
          if (this.changes === 0) return callback(new Error('Plan not found or unauthorized'));
          callback(null);
        });
      }
}
module.exports = FuturePlan;