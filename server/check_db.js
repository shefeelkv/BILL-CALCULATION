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

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0
    )
`;

db.run(createUsersTable, (err) => {
    if (err) {
        console.error('Error creating users table', err.message);
    } else {
        console.log('Users table checked/created successfully.');
    }
    db.close();
});
