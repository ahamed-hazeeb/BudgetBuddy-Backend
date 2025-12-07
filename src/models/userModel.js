const db = require('../config/db');

exports.createUser = (name, email, password, callback) => {
    const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
    db.query(query, [name, email, password], (err, result) => {
        if (err) return callback(err);
        callback(null, { id: result.rows[0].id, name, email });
    });
};

exports.findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    db.query(query, [email], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows[0]);
    });
};
