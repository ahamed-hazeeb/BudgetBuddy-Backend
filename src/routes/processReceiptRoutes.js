const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processReceipt } = require('../controllers/processReceiptController');
const { authMiddleware } = require('../controllers/userController');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to process receipt images
router.post('/', authMiddleware, upload.single('image'), processReceipt);

module.exports = router;