const db = require('../config/db');

exports.createUser = (name, email, password, callback) => {
    const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            return callback(err);
        }
        if (!result.rows || result.rows.length === 0) {
            return callback(new Error('No result returned from insert'));
        }
        const user = result.rows[0];
        callback(null, { id: user.id, name: user.name, email: user.email });
    });
};

exports.findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    db.query(query, [email], (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows[0]);
    });
};
