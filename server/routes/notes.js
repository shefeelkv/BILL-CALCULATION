const express = require('express');
const router = express.Router();
const db = require('../db');
const { isPostgres } = db;
const authenticateToken = require('../middleware/auth');

// Get all notes for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Get single note details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const noteRows = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);

        if (noteRows.length === 0) {
            return res.status(404).json({ error: 'Note not found or access denied' });
        }

        const itemsRows = await db.query('SELECT * FROM note_items WHERE note_id = ?', [id]);

        res.json({
            ...noteRows[0],
            items: itemsRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch note details' });
    }
});

// Create new note
router.post('/', authenticateToken, async (req, res) => {
    const { title, items } = req.body;
    let total_amount = 0;

    items.forEach(item => total_amount += parseFloat(item.price));

    try {
        const beginSql = isPostgres ? 'BEGIN' : 'BEGIN TRANSACTION';
        await db.run(beginSql);

        const insertNoteSql = isPostgres
            ? 'INSERT INTO notes (user_id, title, total_amount) VALUES (?, ?, ?) RETURNING id'
            : 'INSERT INTO notes (user_id, title, total_amount) VALUES (?, ?, ?)';
        
        const result = await db.run(insertNoteSql, [req.user.id, title, total_amount]);
        const noteId = result.id || result.lastID;

        for (const item of items) {
            await db.run(
                'INSERT INTO note_items (note_id, item_name, price) VALUES (?, ?, ?)',
                [noteId, item.item_name, item.price]
            );
        }

        await db.run('COMMIT');
        res.status(201).json({ id: noteId, message: 'Note created successfully' });
    } catch (err) {
        await db.run('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Note not found or authorized to delete' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Update note
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, items } = req.body;
    let total_amount = 0;

    items.forEach(item => total_amount += parseFloat(item.price));

    try {
        const beginSql = isPostgres ? 'BEGIN' : 'BEGIN TRANSACTION';
        await db.run(beginSql);

        // Update Note
        const noteUpdateResult = await db.run(
            'UPDATE notes SET title = ?, total_amount = ? WHERE id = ? AND user_id = ?',
            [title, total_amount, id, req.user.id]
        );

        if (noteUpdateResult.changes === 0) {
            await db.run('ROLLBACK');
            return res.status(404).json({ error: 'Note not found or authorized to update' });
        }

        // Delete existing items
        await db.run('DELETE FROM note_items WHERE note_id = ?', [id]);

        // Insert new items
        for (const item of items) {
            await db.run(
                'INSERT INTO note_items (note_id, item_name, price) VALUES (?, ?, ?)',
                [id, item.item_name, item.price]
            );
        }

        await db.run('COMMIT');
        res.json({ message: 'Note updated successfully' });
    } catch (err) {
        await db.run('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

module.exports = router;
