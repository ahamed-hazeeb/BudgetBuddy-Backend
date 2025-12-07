const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processReceipt } = require('../controllers/processReceiptController');
const { authenticateToken } = require('../middleware/auth');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to process receipt images
router.post('/', authenticateToken, upload.single('image'), processReceipt);

module.exports = router;