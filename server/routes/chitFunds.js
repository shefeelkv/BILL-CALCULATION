const express = require('express');
const router = express.Router();
const db = require('../db');
const { isPostgres } = db;
const authenticateToken = require('../middleware/auth');

// Get all chit funds for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const funds = await db.query('SELECT * FROM chit_funds WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(funds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new chit fund
router.post('/', authenticateToken, async (req, res) => {
    const { name, target_amount, target_date, description } = req.body;
    try {
        const sql = isPostgres
            ? 'INSERT INTO chit_funds (user_id, name, target_amount, target_date, description) VALUES (?, ?, ?, ?, ?) RETURNING id'
            : 'INSERT INTO chit_funds (user_id, name, target_amount, target_date, description) VALUES (?, ?, ?, ?, ?)';
        
        const result = await db.run(sql, [req.user.id, name, target_amount, target_date, description]);
        res.status(201).json({ id: result.id, message: 'Chit fund created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single chit fund and its transactions
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const funds = await db.query('SELECT * FROM chit_funds WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (funds.length === 0) return res.status(404).json({ error: 'Fund not found' });
        
        const transactions = await db.query('SELECT * FROM chit_transactions WHERE chit_fund_id = ? ORDER BY date DESC', [req.params.id]);
        res.json({ ...funds[0], transactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add transaction (ADD or WITHDRAW)
router.post('/:id/transactions', authenticateToken, async (req, res) => {
    const { transaction_type, amount, description } = req.body;
    const chit_fund_id = req.params.id;

    try {
        // Validate ownership
        const funds = await db.query('SELECT current_balance FROM chit_funds WHERE id = ? AND user_id = ?', [chit_fund_id, req.user.id]);
        if (funds.length === 0) return res.status(404).json({ error: 'Fund not found' });

        const current_balance = funds[0].current_balance;

        if (transaction_type === 'WITHDRAW' && amount > current_balance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Add transaction record
        const transSql = isPostgres
            ? 'INSERT INTO chit_transactions (chit_fund_id, transaction_type, amount, description) VALUES (?, ?, ?, ?) RETURNING id'
            : 'INSERT INTO chit_transactions (chit_fund_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)';
        
        await db.run(transSql, [chit_fund_id, transaction_type, amount, description]);

        // Update balance
        const newBalance = transaction_type === 'ADD' 
            ? current_balance + parseFloat(amount) 
            : current_balance - parseFloat(amount);
        
        await db.run('UPDATE chit_funds SET current_balance = ? WHERE id = ?', [newBalance, chit_fund_id]);

        res.status(201).json({ newBalance, message: 'Transaction recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete chit fund
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.run('DELETE FROM chit_funds WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Chit fund deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
