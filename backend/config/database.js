/**
 * PostgreSQL Database Configuration
 */

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'banana_hunt',
    password: process.env.DB_PASSWORD || '2379',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ PostgreSQL Connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Error:', err);
});

// Helper function for queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Initialize database tables
const initDatabase = async () => {
    try {
        // Create users table
        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(100) DEFAULT 'default-avatar.png',
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        gold_coins INTEGER DEFAULT 0,
        sound_enabled BOOLEAN DEFAULT true,
        theme VARCHAR(20) DEFAULT 'light',
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Migration: add new columns if they don't exist
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gold_coins INTEGER DEFAULT 0`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`);

        // Create game_sessions table (optional - for history)
        await query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL, -- won, lost, abandoned
        score INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        time_taken INTEGER,
        solution INTEGER,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create index on game_sessions user_id
        await query(`
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id 
      ON game_sessions(user_id)
    `);

        // Create otp_verifications table (persistent OTP storage with expiry)
        await query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Index for fast email lookups
        await query(`
      CREATE INDEX IF NOT EXISTS idx_otp_email
      ON otp_verifications(email)
    `);

        // Create shop_items table
        await query(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        price INTEGER NOT NULL,
        icon VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true
      )
    `);

        // Insert initial shop items if not exists
        await query(`
      INSERT INTO shop_items (id, type, name, price, icon)
      VALUES 
        (1, 'avatar', 'Golden Banana', 200, '🍌'),
        (2, 'avatar', 'Monkey King', 500, '🐵'),
        (3, 'theme', 'Cyberpunk Theme', 1000, '🌃'),
        (4, 'effect', 'Diamond Confetti', 750, '💎')
      ON CONFLICT (id) DO NOTHING;
    `);

        // Create user_inventory table
        await query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES shop_items(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      )
    `);

        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query,
    initDatabase
};