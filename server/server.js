/**
 * Banana Hunt Game Server
 * CIS046-3 Assignment - Software For Enterprise
 * 
 * This server implements:
 * - RESTful API architecture
 * - JWT-based authentication (Virtual Identity)
 * - External API integration (Interoperability)
 * - Event-driven async operations
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables before any local modules
dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration - allows frontend to communicate with backend
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const path = require('path');

// Database connection
initDatabase();

// Serve static field containing user avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'banana-hunt-api'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});