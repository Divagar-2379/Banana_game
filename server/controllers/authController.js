/**
 * Authentication Controller - PostgreSQL Version
 * Handles user registration, login, logout
 * Implements JWT for stateless authentication (Virtual Identity)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user exists (PostgreSQL query)
        const existingUser = await query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: 'User already exists with that email or username'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user (PostgreSQL)
        const newUser = await query(
            `INSERT INTO users (username, email, password, created_at, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, username, email, games_played, games_won, total_score, current_streak, best_streak`,
            [username, email, hashedPassword]
        );

        const user = newUser.rows[0];

        // Generate token
        const token = generateToken(user.id);

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.created_at,
                stats: {
                    gamesPlayed: user.games_played,
                    gamesWon: user.games_won,
                    totalScore: user.total_score,
                    currentStreak: user.current_streak,
                    bestStreak: user.best_streak
                }
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const userResult = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate token
        const token = generateToken(user.id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.created_at,
                stats: {
                    gamesPlayed: user.games_played,
                    gamesWon: user.games_won,
                    totalScore: user.total_score,
                    currentStreak: user.current_streak,
                    bestStreak: user.best_streak
                }
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const userResult = await query(
            `SELECT id, username, email, avatar, games_played, games_won, total_score, 
              current_streak, best_streak, sound_enabled, theme, last_login, created_at 
       FROM users WHERE id = $1`,
            [req.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                stats: {
                    gamesPlayed: user.games_played,
                    gamesWon: user.games_won,
                    totalScore: user.total_score,
                    currentStreak: user.current_streak,
                    bestStreak: user.best_streak
                },
                preferences: {
                    soundEnabled: user.sound_enabled,
                    theme: user.theme
                },
                lastLogin: user.last_login,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};