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
const shopRoutes = require('./routes/shop');
const { initDatabase } = require('./config/database');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
    }
});
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
app.use('/api/shop', shopRoutes);

// Socket.io Multiplayer Logic
const activeRooms = {};

io.on('connection', (socket) => {
    console.log('Socket user connected:', socket.id);

    socket.on('join_matchmaking', (user) => {
        // Simple matchmaking logic
        socket.join('lobby');
        socket.emit('matchmaking_status', { status: 'waiting' });
        
        // Find if someone else is waiting in 'lobby'
        const clients = io.sockets.adapter.rooms.get('lobby');
        if (clients && clients.size >= 2) {
            // Pair the first two clients
            const iterator = clients.values();
            const player1 = iterator.next().value;
            const player2 = iterator.next().value;
            
            const roomId = `match_${Date.now()}`;
            activeRooms[roomId] = { players: [player1, player2], scores: { [player1]: 0, [player2]: 0 } };
            
            io.sockets.sockets.get(player1).join(roomId);
            io.sockets.sockets.get(player2).join(roomId);
            io.sockets.sockets.get(player1).leave('lobby');
            io.sockets.sockets.get(player2).leave('lobby');
            
            io.to(roomId).emit('match_found', { roomId });
            
            // Start match
            setTimeout(() => {
                io.to(roomId).emit('match_start', { timestamp: Date.now() });
            }, 3000);
        }
    });

    socket.on('submit_multiplayer_score', (data) => {
        const { roomId, score } = data;
        if (activeRooms[roomId]) {
            activeRooms[roomId].scores[socket.id] += score;
            io.to(roomId).emit('opponent_score', { 
                playerId: socket.id, 
                score: activeRooms[roomId].scores[socket.id] 
            });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

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

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});