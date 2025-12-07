const db = require('../config/db');

class Category {
  // Create a new category
  static createCategory(user_id, name, type, callback) {
    db.run(
      `INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)`,
      [user_id, name, type],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, user_id, name, type });
      }
    );
  }

  // Get all categories for a user
  static getCategoriesByUserId(user_id, callback) {
    db.all(`SELECT id, name, type FROM categories WHERE user_id = ? OR user_id IS NULL`, [user_id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }

  // Update a category
  static updateCategory(id, user_id, name, type, callback) {
    db.run(
      `UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?`,
      [name, type, id, user_id],
      function (err) {
        if (err) return callback(err);
        if (this.changes === 0) return callback(new Error('Category not found or unauthorized'));
        callback(null, { id, user_id, name, type });
      }
    );
  }

  // Delete a category
  static deleteCategory(id, user_id, callback) {
    db.run(`DELETE FROM categories WHERE id = ? AND user_id = ?`, [id, user_id], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) return callback(new Error('Category not found or unauthorized'));
      callback(null, { message: 'Category deleted' });
    });
  }
}

module.exports = Category;
