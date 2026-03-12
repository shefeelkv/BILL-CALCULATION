const db = require('../server/db');

async function setupDatabase() {
    console.log('Starting SQLite database setup...');

    try {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const createBillsTable = `
            CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                customer_name TEXT DEFAULT 'Guest',
                total_amount REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        const createBillItemsTable = `
            CREATE TABLE IF NOT EXISTS bill_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_id INTEGER,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                rate REAL NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
            );
        `;

        const createNotesTable = `
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT DEFAULT 'Untitled Note',
                total_amount REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        const createNoteItemsTable = `
            CREATE TABLE IF NOT EXISTS note_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER,
                item_name TEXT NOT NULL,
                price REAL DEFAULT 0,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            );
        `;

        await db.run(createUsersTable);
        console.log('Users table ready.');

        // Migration: Add user_id to bills if missing
        try {
            await db.run('ALTER TABLE bills ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
            console.log('Added user_id column to bills table.');
        } catch (err) {
            // Column likely exists
        }

        // Migration: Add user_id to notes if missing
        try {
            await db.run('ALTER TABLE notes ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
            console.log('Added user_id column to notes table.');
        } catch (err) {
            // Column likely exists
        }

        await db.run(createBillsTable);
        console.log('Bills table ready.');

        await db.run(createBillItemsTable);
        console.log('Bill Items table ready.');

        await db.run(createNotesTable);
        console.log('Notes table ready.');

        await db.run(createNoteItemsTable);
        console.log('Note Items table ready.');

        console.log('Database setup complete!');

    } catch (err) {
        console.error('Error setting up tables:', err);
    }
}

setupDatabase();
