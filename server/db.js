const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const isPostgres = !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL;
let db;
let pgPool;

if (isPostgres) {
    console.log('--- DATABASE DETECTION: PostgreSQL detected via environment variables ---');
    pgPool = new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.log('--- DATABASE DETECTION: No Postgres variables found. Falling back to SQLite. ---');
    console.log('Note: SQLite is read-only on Vercel. Please check your POSTGRES_URL environment variable.');
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
        } else {
            db.run('PRAGMA foreign_keys = ON');
        }
    });
}

// Helper to convert '?' placeholders to '$1, $2, ...' for Postgres
const formatQuery = (sql) => {
    if (!isPostgres) return sql;
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

const query = async (sql, params = []) => {
    if (isPostgres) {
        const res = await pgPool.query(formatQuery(sql), params);
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const run = async (sql, params = []) => {
    if (isPostgres) {
        // Postgres returns result, we try to mimic sqlite result for lastID/changes
        const res = await pgPool.query(formatQuery(sql), params);
        return { 
            id: res.rows[0]?.id || null, 
            lastID: res.rows[0]?.id || null, 
            changes: res.rowCount 
        };
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, lastID: this.lastID, changes: this.changes });
            });
        });
    }
};

module.exports = { query, run, db, isPostgres };
