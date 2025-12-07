const Account = require('../models/accounts');

exports.getAccounts = (req, res) => {
  console.log('GET /api/accounts/:user_id hit');
  console.log('req.params:', req.params); // Debug
  console.log('req.user:', req.user); // Debug

  const userId = req.params.user_id;
  const authenticatedUserId = req.user?.id; // Use req.user.id from authMiddleware

  // Validate userId and authenticatedUserId
  if (!userId) {
    return res.status(400).json({ error: 'User ID parameter is required' });
  }
  if (!authenticatedUserId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }

  if (userId !== authenticatedUserId.toString()) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  Account.getAccountsByUserId(userId, (err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(accounts);
  });
};

exports.createAccount = (req, res) => {
  console.log('POST /api/accounts hit', req.body);
  const { user_id, account_type, balance } = req.body;
  const authenticatedUserId = req.user?.id; // Use req.user.id

  if (!authenticatedUserId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  if (user_id !== authenticatedUserId.toString()) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  Account.createAccount(user_id, account_type, balance || 0, (err, account) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(account);
  });
};

exports.updateAccountBalance = (req, res) => {
  console.log('PUT /api/accounts/balance hit', req.body);
  const { account_id, balance } = req.body;
  const authenticatedUserId = req.user?.id; // Use req.user.id

  if (!authenticatedUserId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }

  // Verify the account belongs to the authenticated user
  Account.getAccountsByUserId(authenticatedUserId, (err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });
    const account = accounts.find(acc => acc.id === account_id);
    if (!account) {
      return res.status(403).json({ error: 'Unauthorized access or account not found' });
    }

    Account.updateAccountBalance(account_id, balance, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });
};