const express = require('express');
const { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory, 
  trainCategoryModel, 
  predictCategory 
} = require('../controllers/categoryController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

// CRUD Operations
router.post('/categories', authMiddleware, createCategory);
router.get('/categories/:user_id', authMiddleware, getCategories);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

// Model Training and Prediction
router.post('/categories/train', authMiddleware, trainCategoryModel);
router.post('/categories/predict', authMiddleware, predictCategory);

module.exports = router;