const db = require('../config/db');

exports.addGoal = (user_id, goal_name, target_amount, current_savings, target_date, callback) => {
    db.run(
        `INSERT INTO financial_goals (user_id, goal_name, target_amount, current_savings, target_date) VALUES (?, ?, ?, ?, ?)`,
        [user_id, goal_name, target_amount, current_savings, target_date],
        function (err) {
            callback(err, { id: this.lastID, user_id, goal_name, target_amount, current_savings, target_date });
        }
    );
};

exports.getUserGoals = (user_id, callback) => {
    db.all(`SELECT * FROM financial_goals WHERE user_id = ?`, [user_id], (err, rows) => {
        callback(err, rows);
    });
};
