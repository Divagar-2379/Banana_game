/**
 * Authentication Controller - PostgreSQL Version
 * Handles user registration, login, logout
 * Implements JWT for stateless authentication (Virtual Identity)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const { sendOTPEmail } = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

// Helper: generate a 6-digit OTP string
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
       RETURNING id, username, email, games_played, games_won, total_score, current_streak, best_streak, gold_coins, xp, level`,
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
                    bestStreak: user.best_streak,
                    goldCoins: user.gold_coins,
                    xp: user.xp,
                    level: user.level
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

        // Daily login reward logic
        let dailyReward = 0;
        if (user.last_login) {
            const lastLoginDate = new Date(user.last_login).toISOString().split('T')[0];
            const todayDate = new Date().toISOString().split('T')[0];
            if (lastLoginDate !== todayDate) {
                dailyReward = 15;
            }
        } else {
            dailyReward = 15; // first ever login
        }

        user.gold_coins += dailyReward;

        // Update last login and give reward
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP, gold_coins = $2 WHERE id = $1',
            [user.id, user.gold_coins]
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
            message: dailyReward > 0 ? `Login successful! Claimed ${dailyReward} Daily Reward Coins 🍌` : 'Login successful',
            dailyReward: dailyReward,
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
                    bestStreak: user.best_streak,
                    goldCoins: user.gold_coins,
                    xp: user.xp,
                    level: user.level
                }
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Verify OTP for Login
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore.get(email);

        if (!record || record.type !== 'mfa' || record.otp !== otp || new Date() > record.expiresAt) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid - clear it and complete login
        otpStore.delete(email);

        // Fetch user again just to get the full profile
        const userResult = await query('SELECT * FROM users WHERE id = $1', [record.userId]);
        const user = userResult.rows[0];

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
                    bestStreak: user.best_streak,
                    goldCoins: user.gold_coins,
                    xp: user.xp,
                    level: user.level
                }
            },
            token
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// Request Password Reset (stores OTP in DB, sends real email)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userResult = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        // Always return a generic message to prevent email probing
        if (userResult.rows.length === 0) {
            return res.json({ success: true, message: 'If that email exists, a reset code was sent.' });
        }

        const user = userResult.rows[0];
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

        // Remove any existing OTPs for this email/type
        await query(
            'DELETE FROM otp_verifications WHERE email = $1 AND type = $2',
            [email, 'reset']
        );

        // Store new OTP in database
        await query(
            'INSERT INTO otp_verifications (email, otp, type, user_id, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [email, otp, 'reset', user.id, expiresAt]
        );

        // Send real email
        await sendOTPEmail(email, otp, 'reset');

        res.json({
            success: true,
            message: 'If that email exists, a reset code was sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
};

// Complete Password Reset (validates DB OTP, updates password)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Look up OTP record in database
        const otpResult = await query(
            `SELECT * FROM otp_verifications
             WHERE email = $1 AND type = 'reset'
             ORDER BY created_at DESC LIMIT 1`,
            [email]
        );

        if (otpResult.rows.length === 0) {
            return res.status(401).json({ message: 'No reset code found. Please request a new one.' });
        }

        const record = otpResult.rows[0];

        // Validate OTP hasn't expired
        if (new Date() > new Date(record.expires_at)) {
            await query('DELETE FROM otp_verifications WHERE id = $1', [record.id]);
            return res.status(401).json({ message: 'OTP has expired. Please request a new reset code.' });
        }

        // Validate OTP matches
        if (record.otp !== otp.toString().trim()) {
            return res.status(401).json({ message: 'Incorrect OTP. Please try again.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password in database
        await query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, record.user_id]
        );

        // Clean up used OTP
        await query('DELETE FROM otp_verifications WHERE email = $1 AND type = $2', [email, 'reset']);

        res.json({ success: true, message: 'Password has been successfully reset. Please log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
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
             current_streak, best_streak, created_at, gold_coins, theme, sound_enabled, xp, level
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
                    bestStreak: user.best_streak,
                    goldCoins: user.gold_coins,
                    xp: user.xp,
                    level: user.level
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

// Update user profile (username, email, avatar)
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.userId;
        let setFields = [];
        let queryParams = [];
        let paramIndex = 1;

        if (username) {
            setFields.push(`username = $${paramIndex++}`);
            queryParams.push(username);
        }
        
        if (email) {
            setFields.push(`email = $${paramIndex++}`);
            queryParams.push(email);
        }

        if (req.file) {
            setFields.push(`avatar = $${paramIndex++}`);
            queryParams.push(req.file.filename);
        }

        if (setFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        queryParams.push(userId);
        const updateQuery = `
            UPDATE users SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, username, email, avatar
        `;

        const result = await query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        if (error.code === '23505') { // postgres unique constraint error
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        const name = payload['name'] || email.split('@')[0];

        // Check if user exists
        let userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user;
        let dailyReward = 0;

        if (userResult.rows.length === 0) {
            // Create new Google User
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            
            const newUser = await query(
                `INSERT INTO users (username, email, password, created_at, updated_at, gold_coins, theme, sound_enabled, games_played, games_won, total_score, current_streak, best_streak, xp, level) 
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 'light', true, 0, 0, 0, 0, 0, 0, 1) 
                 RETURNING *`,
                [name.substring(0, 30), email, randomPassword]
            );
            user = newUser.rows[0];
        } else {
            user = userResult.rows[0];
            // Handle Daily Login Reward
            const lastLogin = user.last_login;
            const now = new Date();
            
            if (!lastLogin || lastLogin.toDateString() !== now.toDateString()) {
                dailyReward = 15;
                const newCoins = (user.gold_coins || 0) + 15;
                await query('UPDATE users SET gold_coins = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2', [newCoins, user.id]);
                user.gold_coins = newCoins;
            } else {
                await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
            }
        }

        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Google login successful',
            dailyReward: dailyReward,
            user: {
                id: user.id, username: user.username, email: user.email,
                soundEnabled: user.sound_enabled, theme: user.theme,
                stats: {
                    gamesPlayed: user.games_played, gamesWon: user.games_won,
                    totalScore: user.total_score, currentStreak: user.current_streak,
                    bestStreak: user.best_streak, goldCoins: user.gold_coins,
                    xp: user.xp, level: user.level
                }
            },
            token
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Google authentication failed' });
    }
};