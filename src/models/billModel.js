const db = require('../config/db');

exports.addBill = (user_id, bill_name, due_date, amount, callback) => {
    const query = `
        INSERT INTO bills (user_id, bill_name, due_date, amount, status, reminder_sent) 
        VALUES ($1, $2, $3, $4, 'unpaid', false) 
        RETURNING id
    `;
    
    db.query(query, [user_id, bill_name, due_date, amount], (err, result) => {
        if (err) return callback(err);
        callback(null, { 
            id: result.rows[0].id, 
            user_id, 
            bill_name, 
            due_date, 
            amount, 
            status: "unpaid", 
            reminder_sent: false 
        });
    });
};

exports.getUserBills = (user_id, callback) => {
    const query = 'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC';
    
    db.query(query, [user_id], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
    });
};
