const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticateToken } = require('../middleware/auth');

router.get('/accounts/:user_id', authenticateToken, accountController.getAccounts);
router.post('/accounts', authenticateToken, accountController.createAccount);
router.put('/accounts/balance', authenticateToken, accountController.updateAccountBalance);

module.exports = router;