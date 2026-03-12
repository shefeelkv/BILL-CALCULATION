const express = require('express');
const router = express.Router();
const db = require('../db');
const { isPostgres } = db;
const authenticateToken = require('../middleware/auth');

// Get all bills for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM bills WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bills' });
    }
});

// Get single bill details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const billRows = await db.query('SELECT * FROM bills WHERE id = ? AND user_id = ?', [id, req.user.id]);

        if (billRows.length === 0) {
            return res.status(404).json({ error: 'Bill not found or access denied' });
        }

        const itemsRows = await db.query('SELECT * FROM bill_items WHERE bill_id = ?', [id]);

        res.json({
            ...billRows[0],
            items: itemsRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bill details' });
    }
});

// Create new bill
router.post('/', authenticateToken, async (req, res) => {
    const { customer_name, items } = req.body;
    let total_amount = 0;

    items.forEach(item => {
        total_amount += item.quantity * item.rate;
    });

    try {
        const beginSql = isPostgres ? 'BEGIN' : 'BEGIN TRANSACTION';
        await db.run(beginSql);

        const insertBillSql = isPostgres
            ? 'INSERT INTO bills (user_id, customer_name, total_amount) VALUES (?, ?, ?) RETURNING id'
            : 'INSERT INTO bills (user_id, customer_name, total_amount) VALUES (?, ?, ?)';
        
        const result = await db.run(insertBillSql, [req.user.id, customer_name, total_amount]);
        const billId = result.id || result.lastID;

        for (const item of items) {
            const amount = item.quantity * item.rate;
            await db.run(
                'INSERT INTO bill_items (bill_id, product_name, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
                [billId, item.product_name, item.quantity, item.rate, amount]
            );
        }

        await db.run('COMMIT');
        res.status(201).json({ id: billId, message: 'Bill created successfully' });
    } catch (err) {
        await db.run('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create bill' });
    }
});

// Delete bill
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM bills WHERE id = ? AND user_id = ?', [id, req.user.id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Bill not found or not authorized to delete' });
        }

        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete bill' });
    }
});

// Update bill
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { customer_name, items } = req.body;
    let total_amount = 0;
    items.forEach(item => {
        total_amount += item.quantity * item.rate;
    });

    try {
        const beginSql = isPostgres ? 'BEGIN' : 'BEGIN TRANSACTION';
        await db.run(beginSql);

        // Update Bill
        const billUpdateResult = await db.run(
            'UPDATE bills SET customer_name = ?, total_amount = ? WHERE id = ? AND user_id = ?',
            [customer_name, total_amount, id, req.user.id]
        );

        if (billUpdateResult.changes === 0) {
            await db.run('ROLLBACK');
            return res.status(404).json({ error: 'Bill not found or not authorized to update' });
        }

        // Delete existing items
        await db.run('DELETE FROM bill_items WHERE bill_id = ?', [id]);

        // Insert new items
        for (const item of items) {
            const amount = item.quantity * item.rate;
            await db.run(
                'INSERT INTO bill_items (bill_id, product_name, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
                [id, item.product_name, item.quantity, item.rate, amount]
            );
        }

        await db.run('COMMIT');
        res.json({ message: 'Bill updated successfully' });
    } catch (err) {
        await db.run('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to update bill' });
    }
});

module.exports = router;
