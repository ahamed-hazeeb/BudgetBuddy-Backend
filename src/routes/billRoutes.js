const express = require('express');
const { addBill, getBills } = require('../controllers/billController');

const router = express.Router();

router.post('/bills', addBill);
router.get('/bills/:user_id', getBills);

module.exports = router;
