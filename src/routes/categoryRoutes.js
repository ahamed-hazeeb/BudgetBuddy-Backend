const express = require('express');
const { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// CRUD Operations
router.post('/categories', authenticateToken, createCategory);
router.get('/categories/:user_id', authenticateToken, getCategories);
router.put('/categories/:id', authenticateToken, updateCategory);
router.delete('/categories/:id', authenticateToken, deleteCategory);

module.exports = router;