/**
 * PostgreSQL Database Configuration
 * Replaces MongoDB with PostgreSQL
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
        sound_enabled BOOLEAN DEFAULT true,
        theme VARCHAR(20) DEFAULT 'light',
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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