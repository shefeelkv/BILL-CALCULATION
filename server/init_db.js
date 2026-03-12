const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const schema = [
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT,
        total_amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS bill_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER,
        product_name TEXT,
        quantity INTEGER,
        rate REAL,
        amount REAL,
        FOREIGN KEY(bill_id) REFERENCES bills(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        total_amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS note_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER,
        content TEXT,
        item_name TEXT,
        price REAL,
        FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
    )`
];

db.serialize(() => {
    schema.forEach((query) => {
        db.run(query, (err) => {
            if (err) {
                console.error('Error running query:', query, err.message);
            } else {
                console.log('Table checked/created successfully.');
            }
        });
    });
});

db.close();
