const db = require('../config/db');

exports.createUser = (name, email, password, callback) => {
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, password], function(err) {
        callback(err, { id: this.lastID, name, email });
    });
};

exports.findUserByEmail = (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        callback(err, user);
    });
};
