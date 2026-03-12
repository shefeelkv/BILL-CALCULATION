const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const username = 'sheza';
const password = '123'; // The user can change this later

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        return;
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', [username, hashedPassword, 1], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.log(`User ${username} already exists.`);
                } else {
                    console.error('Error inserting user', err.message);
                }
            } else {
                console.log(`User ${username} created successfully with ID:`, this.lastID);
            }
            db.close();
        });
    } catch (err) {
        console.error('Bcrypt error:', err);
        db.close();
    }
});
