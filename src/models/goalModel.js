const db = require('../config/db');

exports.addGoal = (user_id, goal_name, target_amount, current_savings, target_date, callback) => {
    const query = `
        INSERT INTO financial_goals (user_id, goal_name, target_amount, current_savings, target_date) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
    `;
    
    db.query(query, [user_id, goal_name, target_amount, current_savings, target_date], (err, result) => {
        if (err) return callback(err);
        callback(null, { 
            id: result.rows[0].id, 
            user_id, 
            goal_name, 
            target_amount, 
            current_savings, 
            target_date 
        });
    });
};

exports.getUserGoals = (user_id, callback) => {
    const query = 'SELECT * FROM financial_goals WHERE user_id = $1 ORDER BY target_date ASC';
    
    db.query(query, [user_id], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
    });
};
