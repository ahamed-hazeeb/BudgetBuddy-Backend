const billModel = require('../models/billModel');

exports.addBill = (req, res) => {
    const { user_id, bill_name, due_date, amount } = req.body;

    billModel.addBill(user_id, bill_name, due_date, amount, (err, bill) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(bill);
    });
};

exports.getBills = (req, res) => {
    const { user_id } = req.params;

    billModel.getUserBills(user_id, (err, bills) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(bills);
    });
};
