/**
 * Game Component
 * Demonstrates Event-Driven Programming:
 * - User input events (onChange, onClick, onSubmit)
 * - Timer events (setInterval)
 * - Async API events (axios requests)
 * - State change events (useEffect)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Timer from './Timer';
import './Game.css';

const Game = () => {
    const { user, updateUserStats } = useAuth();

    // Game state
    const [gameState, setGameState] = useState('idle'); // idle, loading, playing, won, lost
    const [gameData, setGameData] = useState(null);
    const [guess, setGuess] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState(null);

    // Timer effect - Event-driven: triggers every second
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Start new game - Async event handler
    const startGame = async () => {
        try {
            setGameState('loading');
            setMessage('Loading game...');
            setGuess('');
            setHint(null);
            setAttempts(0);

            // API call to start game (interoperability)
            const response = await api.post('/game/start');
            const data = response.data;

            setGameData(data);
            setTimeLeft(data.timeLimit);
            setGameState('playing');
            setMessage('Game started! How many bananas do you see?');

        } catch (error) {
            console.error('Error starting game:', error);
            setMessage('Failed to start game. Please try again.');
            setGameState('idle');
        }
    };

    // Handle user input change event
    const handleInputChange = (e) => {
        const value = e.target.value;
        // Only allow numbers 1-9
        if (value === '' || (/^[1-9]$/.test(value))) {
            setGuess(value);
        }
    };

    // Handle form submit event
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!guess || gameState !== 'playing') return;

        try {
            const response = await api.post('/game/answer', {
                gameId: gameData.gameId,
                answer: parseInt(guess)
            });

            const result = response.data;
            setAttempts(prev => prev + 1);

            if (result.correct) {
                setGameState('won');
                setScore(result.score);
                setMessage(`🎉 Correct! You scored ${result.score} points!`);
                updateUserStats(result.stats);
            } else {
                if (result.gameOver) {
                    setGameState('lost');
                    setMessage(result.message);
                    updateUserStats(result.stats);
                } else {
                    setHint(result.hint);
                    setMessage(`❌ Wrong! ${result.remainingAttempts} attempts remaining.`);
                    setGuess('');
                }
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            setMessage('Error submitting answer. Try again.');
        }
    };

    // Handle time up event
    const handleTimeUp = async () => {
        setGameState('lost');
        setMessage("⏰ Time's up! Game over.");
        try {
            await api.post('/game/timeout', { gameId: gameData.gameId });
        } catch (error) {
            console.error('Error notifying timeout:', error);
        }
    };

    // Keyboard event handler (number keys)
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameState === 'playing') {
                if (e.key >= '1' && e.key <= '9') {
                    setGuess(e.key);
                } else if (e.key === 'Enter' && guess) {
                    handleSubmit(e);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, guess]);

    return (
        <div className="game-container">
            <div className="game-header">
                <h2>🍌 Banana Hunt</h2>
                <div className="stats-bar">
                    <span>Player: {user?.username}</span>
                    <span>Games Won: {user?.stats?.gamesWon || 0}</span>
                    <span>Best Streak: {user?.stats?.bestStreak || 0}</span>
                </div>
            </div>

            {gameState === 'idle' && (
                <div className="start-screen">
                    <p>Guess how many bananas are in the image!</p>
                    <p>You have 60 seconds and 3 attempts.</p>
                    <button className="btn btn-primary" onClick={startGame}>
                        Start Game
                    </button>
                </div>
            )}

            {gameState === 'loading' && (
                <div className="loading">Loading...</div>
            )}

            {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
                <>
                    <div className="game-info">
                        <Timer timeLeft={timeLeft} />
                        <div className="attempts">Attempts: {attempts}/3</div>
                    </div>

                    {gameData?.question && (
                        <div className="image-container">
                            <img
                                src={gameData.question}
                                alt="Banana puzzle"
                                className="game-image"
                                onError={(e) => {
                                    e.target.src = '/fallback-banana.png';
                                }}
                            />
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <form onSubmit={handleSubmit} className="guess-form">
                            <input
                                type="text"
                                value={guess}
                                onChange={handleInputChange}
                                placeholder="Enter number (1-9)"
                                maxLength="1"
                                autoFocus
                            />
                            <button type="submit">Submit Guess</button>
                        </form>
                    )}

                    {hint && <div className="hint">💡 {hint}</div>}

                    {message && (
                        <div className={`message ${gameState}`}>
                            {message}
                        </div>
                    )}

                    {(gameState === 'won' || gameState === 'lost') && (
                        <button className="btn btn-primary" onClick={startGame}>
                            Play Again
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default Game;