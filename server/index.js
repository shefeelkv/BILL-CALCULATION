const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart List Calculator API is running');
});

// Import Routes
const billRoutes = require('./routes/bills');
const noteRoutes = require('./routes/notes');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const chitFundRoutes = require('./routes/chitFunds');
const { query, isPostgres } = require('./db');

app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chit-funds', chitFundRoutes);

// Database Initialization
const initDb = async () => {
    try {
        const schema = [
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE
            )`,
            `CREATE TABLE IF NOT EXISTS bills (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                customer_name TEXT,
                total_amount REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS bill_items (
                id SERIAL PRIMARY KEY,
                bill_id INTEGER,
                product_name TEXT,
                quantity INTEGER,
                rate REAL,
                amount REAL
            )`,
            `CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                title TEXT,
                total_amount REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS note_items (
                id SERIAL PRIMARY KEY,
                note_id INTEGER,
                item_name TEXT,
                price REAL
            )`,
            `CREATE TABLE IF NOT EXISTS chit_funds (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                name TEXT NOT NULL,
                target_amount REAL NOT NULL,
                target_date DATE NOT NULL,
                description TEXT,
                current_balance REAL DEFAULT 0,
                status TEXT DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS chit_transactions (
                id SERIAL PRIMARY KEY,
                chit_fund_id INTEGER,
                transaction_type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];
        
        if (isPostgres) {
            console.log('Initializing PostgreSQL schema...');
            for (const sql of schema) {
                await query(sql);
            }
            console.log('PostgreSQL schema initialized.');
        }
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

initDb();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
