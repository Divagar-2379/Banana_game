/**
 * Game Controller - PostgreSQL Version
 * Handles game logic and external API integration
 * Demonstrates Interoperability theme
 */

const axios = require('axios');
const { query } = require('../config/database');

// External Banana API configuration
const BANANA_API_URL = process.env.BANANA_API_URL || 'https://marcconrad.com/uob/banana/api.php';

// In-memory game storage (for active games)
const activeGames = new Map();

// Update user stats in PostgreSQL
const updateUserStats = async (userId, won, score, coinsEarned = 0, xpEarned = 0) => {
    try {
        // Get current stats
        const currentStats = await query(
            'SELECT games_played, games_won, current_streak, best_streak, total_score, gold_coins, xp, level FROM users WHERE id = $1',
            [userId]
        );

        if (currentStats.rows.length === 0) return null;

        const stats = currentStats.rows[0];
        const newGamesPlayed = stats.games_played + 1;
        const newGamesWon = won ? stats.games_won + 1 : stats.games_won;
        const newCurrentStreak = won ? stats.current_streak + 1 : 0;
        const newBestStreak = won && newCurrentStreak > stats.best_streak
            ? newCurrentStreak
            : stats.best_streak;
        const newTotalScore = stats.total_score + score;
        const newGoldCoins = (stats.gold_coins || 0) + coinsEarned;
        const newXp = (stats.xp || 0) + xpEarned;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        const levelUp = newLevel > stats.level;

        // Update database
        await query(
            `UPDATE users 
       SET games_played = $1, 
           games_won = $2, 
           current_streak = $3, 
           best_streak = $4, 
           total_score = $5,
           gold_coins = $6,
           xp = $7,
           level = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
            [newGamesPlayed, newGamesWon, newCurrentStreak, newBestStreak, newTotalScore, newGoldCoins, newXp, newLevel, userId]
        );

        return {
            gamesPlayed: newGamesPlayed,
            gamesWon: newGamesWon,
            currentStreak: newCurrentStreak,
            bestStreak: newBestStreak,
            totalScore: newTotalScore,
            goldCoins: newGoldCoins,
            xp: newXp,
            level: newLevel,
            levelUp: levelUp
        };
    } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
    }
};

// Start new game
exports.startGame = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch game data from external Banana API
        const response = await axios.get(BANANA_API_URL, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Banana-Hunt-Game/1.0'
            }
        });

        const gameData = response.data;

        // Validate external API response
        if (!gameData || !gameData.question || gameData.solution === undefined || gameData.solution === null) {
            throw new Error('Invalid response from external API');
        }

        // Create game session
        const gameId = generateGameId();
        const gameSession = {
            id: gameId,
            userId: userId,
            question: gameData.question,
            solution: gameData.solution,
            startTime: new Date(),
            attempts: 0,
            maxAttempts: 3,
            hintsUsed: 0,
            status: 'active'
        };

        // Store in active games
        activeGames.set(gameId, gameSession);

        // Set timeout to auto-expire game (10 minutes)
        setTimeout(() => {
            if (activeGames.has(gameId)) {
                activeGames.delete(gameId);
            }
        }, 600000);

        res.json({
            success: true,
            gameId: gameId,
            question: gameData.question,
            timeLimit: 60,
            maxAttempts: 3,
            message: 'Game started! Guess the number of bananas.'
        });

    } catch (error) {
        console.error('Error starting game:', error.message);

        // Fallback: Generate local game if external API fails
        const fallbackGame = generateLocalGame(req.userId);
        res.json({
            success: true,
            ...fallbackGame,
            warning: 'Using local game mode (external API unavailable)'
        });
    }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
    try {
        const { gameId, answer } = req.body;
        const userId = req.userId;

        // Retrieve game session
        const game = activeGames.get(gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found or expired' });
        }

        if (game.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to game' });
        }

        if (game.status !== 'active') {
            return res.status(400).json({ message: 'Game already completed' });
        }

        game.attempts += 1;

        const userAnswer = parseInt(answer);
        const isCorrect = userAnswer === game.solution;

        if (isCorrect) {
            // Calculate score
            const endTime = new Date();
            const timeTaken = (endTime - game.startTime) / 1000;
            const remainingAttempts = game.maxAttempts - game.attempts;
            
            const baseScore = 100;
            const attemptPenalty = (game.attempts - 1) * 20;
            const timeBonus = Math.max(0, 60 - timeTaken);
            const finalScore = Math.floor(baseScore - attemptPenalty + timeBonus);
            const coinsEarned = Math.floor(finalScore / 10);
            
            const xpEarned = Math.floor(50 + timeBonus + (remainingAttempts * 10));

            game.status = 'won';

            // Update user stats in PostgreSQL
            const newStats = await updateUserStats(userId, true, Math.max(0, finalScore), coinsEarned, xpEarned);

            // Clean up
            activeGames.delete(gameId);

            return res.json({
                success: true,
                correct: true,
                score: Math.max(0, finalScore),
                coinsEarned: coinsEarned,
                xpEarned: xpEarned,
                attempts: game.attempts,
                message: newStats.levelUp ? '🎉 Correct! AND YOU LEVELED UP!' : '🎉 Correct! Great job!',
                stats: newStats
            });

        } else {
            const remainingAttempts = game.maxAttempts - game.attempts;

            if (remainingAttempts <= 0) {
                game.status = 'lost';

                // Update user stats (loss) gives 10 participation XP
                const newStats = await updateUserStats(userId, false, 0, 0, 10);

                activeGames.delete(gameId);

                return res.json({
                    success: true,
                    correct: false,
                    gameOver: true,
                    solution: game.solution,
                    message: `Game Over! The answer was ${game.solution}`,
                    stats: newStats
                });
            }

            // Provide hint if second attempt
            let hint = null;
            if (game.attempts === 2) {
                hint = userAnswer > game.solution ? 'Try a lower number' : 'Try a higher number';
            }

            return res.json({
                success: true,
                correct: false,
                remainingAttempts,
                hint,
                message: '❌ Wrong! Try again.'
            });
        }

    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper functions
function generateGameId() {
    return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateLocalGame(userId) {
    const gameId = generateGameId();
    const solution = Math.floor(Math.random() * 9) + 1;

    const gameSession = {
        id: gameId,
        userId: userId,
        solution: solution,
        startTime: new Date(),
        attempts: 0,
        maxAttempts: 3,
        status: 'active'
    };

    activeGames.set(gameId, gameSession);

    // Create a beautifully styled SVG as base64 so no extra route is needed
    // The SVGs render bananas arranged neatly
    let bananasText = Array(solution).fill('🍌').join(' ');

    // Create an elegant fallback image
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <rect width="800" height="500" rx="30" fill="url(#bg)" />
        <circle cx="400" cy="250" r="180" fill="#334155" opacity="0.3" filter="url(#glow)"/>
        <text x="50%" y="50%" font-size="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" text-anchor="middle" dominant-baseline="central">${bananasText}</text>
        <text x="50%" y="420" font-size="28" font-family="sans-serif" font-weight="bold" fill="#94a3b8" text-anchor="middle">Local Fallback Level</text>
    </svg>`;

    const questionDataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    return {
        gameId: gameId,
        question: questionDataUri,
        timeLimit: 60,
        maxAttempts: 3,
        message: 'Game started (local mode)!'
    };
}