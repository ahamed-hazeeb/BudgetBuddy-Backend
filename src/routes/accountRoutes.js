const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authMiddleware } = require('../controllers/userController'); // Import authMiddleware

router.get('/accounts/:user_id', authMiddleware, accountController.getAccounts);
router.post('/accounts', authMiddleware, accountController.createAccount);
router.put('/accounts/balance', authMiddleware, accountController.updateAccountBalance);

module.exports = router;