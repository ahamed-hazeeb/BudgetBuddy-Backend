const db = require('../config/db');

class FuturePlan {
    // Add a new future financial plan
    static addFuturePlan(user_id, goal_name, target_amount, current_savings, target_date, monthly_savings, callback) {
        const query = `
            INSERT INTO future_plans (user_id, goal_name, target_amount, current_savings, target_date, monthly_savings) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id
        `;
        
        db.query(query, [user_id, goal_name, target_amount, current_savings, target_date, monthly_savings], (err, result) => {
            if (err) return callback(err);
            callback(null, {
                id: result.rows[0].id,
                user_id,
                goal_name,
                target_amount,
                current_savings,
                target_date,
                monthly_savings,
            });
        });
    }
    
    // Get all future plans for a user
    static getFuturePlans(user_id, callback) {
        const query = 'SELECT * FROM future_plans WHERE user_id = $1 ORDER BY target_date ASC';
        
        db.query(query, [user_id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    }

    // Delete a future plan
    static deleteFuturePlan(planId, userId, callback) {
        const query = 'DELETE FROM future_plans WHERE id = $1 AND user_id = $2';
        
        db.query(query, [planId, userId], (err, result) => {
            if (err) return callback(err);
            if (result.rowCount === 0) return callback(new Error('Plan not found or unauthorized'));
            callback(null);
        });
    }
}

module.exports = FuturePlan;
