const express = require('express');
const { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

// CRUD Operations
router.post('/categories', authMiddleware, createCategory);
router.get('/categories/:user_id', authMiddleware, getCategories);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

module.exports = router;