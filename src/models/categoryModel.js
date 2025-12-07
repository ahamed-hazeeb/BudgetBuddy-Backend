const db = require('../config/db');

class Category {
  // Create a new category
  static createCategory(user_id, name, type, callback) {
    const query = 'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id';
    
    db.query(query, [user_id, name, type], (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.rows[0].id, user_id, name, type });
    });
  }

  // Get all categories for a user
  static getCategoriesByUserId(user_id, callback) {
    const query = 'SELECT id, name, type FROM categories WHERE user_id = $1 OR user_id IS NULL';
    
    db.query(query, [user_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    });
  }

  // Update a category
  static updateCategory(id, user_id, name, type, callback) {
    const query = 'UPDATE categories SET name = $1, type = $2 WHERE id = $3 AND user_id = $4';
    
    db.query(query, [name, type, id, user_id], (err, result) => {
      if (err) return callback(err);
      if (result.rowCount === 0) return callback(new Error('Category not found or unauthorized'));
      callback(null, { id, user_id, name, type });
    });
  }

  // Delete a category
  static deleteCategory(id, user_id, callback) {
    const query = 'DELETE FROM categories WHERE id = $1 AND user_id = $2';
    
    db.query(query, [id, user_id], (err, result) => {
      if (err) return callback(err);
      if (result.rowCount === 0) return callback(new Error('Category not found or unauthorized'));
      callback(null, { message: 'Category deleted' });
    });
  }
}

module.exports = Category;
