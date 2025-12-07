const Category = require('../models/categoryModel');

exports.createCategory = (req, res) => {
  const { user_id, name, type } = req.body;
  console.log('Received category data:', req.body);

  // Validate inputs
  if (!user_id || !name || !type) {
    return res.status(400).json({ error: 'User ID, name, and type are required' });
  }
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Category name must be a string' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "income" or "expense"' });
  }

  Category.createCategory(user_id, name, type, (err, category) => {
    if (err) {
      console.error('Error creating category:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Category created:', category);
    res.status(201).json(category);
  });
};

exports.getCategories = (req, res) => {
  const { user_id } = req.params;

  Category.getCategoriesByUserId(user_id, (err, categories) => {
    if (err) {
      console.error('Error fetching categories:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(categories);
  });
};

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { user_id, name, type } = req.body;
  console.log('Received update category data:', { id, ...req.body });

  if (!user_id || !name || !type) {
    return res.status(400).json({ error: 'User ID, name, and type are required' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "income" or "expense"' });
  }

  Category.updateCategory(id, user_id, name, type, (err, category) => {
    if (err) {
      console.error('Error updating category:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Category updated:', category);
    res.json(category);
  });
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body; // User ID from body for authorization
  console.log('Received delete category request:', { id, user_id });

  Category.deleteCategory(id, user_id, (err, result) => {
    if (err) {
      console.error('Error deleting category:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Category deleted:', result);
    res.json(result);
  });
};