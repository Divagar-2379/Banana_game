/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies first
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Fallback to Authorization header
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                message: 'Not authorized - No token'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key-change-in-production'
            );

            // Attach user ID to request
            req.userId = decoded.userId;
            next();

        } catch (jwtError) {
            return res.status(401).json({
                message: 'Not authorized - Invalid token'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};