const db = require('../config/db');

exports.addBill = (user_id, bill_name, due_date, amount, callback) => {
    db.run(
        `INSERT INTO bills (user_id, bill_name, due_date, amount) VALUES (?, ?, ?, ?)`,
        [user_id, bill_name, due_date, amount],
        function (err) {
            callback(err, { id: this.lastID, user_id, bill_name, due_date, amount, status: "unpaid", reminder_sent: 0 });
        }
    );
};

exports.getUserBills = (user_id, callback) => {
    db.all(`SELECT * FROM bills WHERE user_id = ?`, [user_id], (err, rows) => {
        callback(err, rows);
    });
};
