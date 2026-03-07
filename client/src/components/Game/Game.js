import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Timer from './Timer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Trophy, XCircle, ArrowRight, Lightbulb, User as UserIcon, Crown } from 'lucide-react';

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

    // Timer effect
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

    // Start new game
    const startGame = async () => {
        try {
            setGameState('loading');
            setMessage('Preparing your game...');
            setGuess('');
            setHint(null);
            setAttempts(0);

            // API call to start game
            const response = await api.post('/game/start');
            const data = response.data;

            setGameData(data);
            setTimeLeft(data.timeLimit);
            setGameState('playing');
            setMessage('How many bananas do you see in the image?');

        } catch (error) {
            console.error('Error starting game:', error);
            setMessage('Failed to start game. Please try again.');
            setGameState('idle');
        }
    };

    // Handle user input change event
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^[1-9]$/.test(value))) {
            setGuess(value);
        }
    };

    // Handle form submit event
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
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
                setMessage(`🎉 Outstanding! You scored ${result.score} points!`);
                updateUserStats(result.stats);
            } else {
                if (result.gameOver) {
                    setGameState('lost');
                    setMessage(result.message);
                    updateUserStats(result.stats);
                } else {
                    setHint(result.hint);
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

    // Keyboard event handler
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameState === 'playing') {
                if (e.key >= '1' && e.key <= '9') {
                    setGuess(e.key);
                } else if (e.key === 'Enter' && guess) {
                    handleSubmit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, guess]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
            <div className="max-w-4xl mx-auto">
                {/* Game Header */}
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 sm:px-8 sm:py-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            🍌
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Banana Hunt</h2>
                    </div>

                    <div className="flex gap-4 sm:gap-6 text-sm font-medium text-slate-600 bg-slate-50 px-6 py-2 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" /> {user?.username}
                        </span>
                        <span className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" /> Won: {user?.stats?.gamesWon || 0}
                        </span>
                        <span className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-emerald-500" /> Best Streak: {user?.stats?.bestStreak || 0}
                        </span>
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="glass-card overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center p-8 border border-white/40">
                    <AnimatePresence mode="wait">

                        {/* IDLE STATE */}
                        {gameState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-center w-full max-w-md"
                            >
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
                                    <span className="text-5xl drop-shadow-md">👀</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Ready to Hunt?</h3>
                                <p className="text-lg text-slate-500 mb-8">
                                    You have 60 seconds and 3 attempts to count all the bananas in the image perfectly.
                                </p>
                                <button className="btn-primary w-full text-lg py-4" onClick={startGame}>
                                    <Play className="w-5 h-5 mr-2" /> Start Now
                                </button>
                            </motion.div>
                        )}

                        {/* LOADING STATE */}
                        {gameState === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                                <p className="text-lg font-medium text-slate-600">{message}</p>
                            </motion.div>
                        )}

                        {/* GAMEPLAY / RESULT STATES */}
                        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
                            <motion.div
                                key="game"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-full flex flex-col pt-4"
                            >
                                {/* Info Bar */}
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <Timer timeLeft={timeLeft} />
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full ${i <= (3 - attempts) ? 'bg-emerald-500' : 'bg-slate-200'} transition-colors duration-300`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Main Interaction Area */}
                                <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center">

                                    {/* Image Container */}
                                    <div className="w-full lg:w-3/5 bg-slate-100 rounded-3xl shadow-inner border border-slate-200 overflow-hidden relative min-h-[300px] flex items-center justify-center">
                                        {gameData?.question ? (
                                            <img
                                                src={gameData.question}
                                                alt="Banana puzzle"
                                                className="w-full h-auto object-cover max-h-[500px]"
                                                onError={(e) => {
                                                    // Set a modern fallback
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : (
                                            <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                                        )}
                                        {/* Fallback container */}
                                        <div className="hidden absolute inset-0 bg-slate-200 items-center justify-center flex-col text-slate-500">
                                            <span className="text-4xl mb-2">🍌</span>
                                            <p>Image broken. Let's pretend there are a few here.</p>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="w-full lg:w-2/5 flex flex-col justify-center space-y-6">
                                        <div className="text-center lg:text-left">
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Guess</h3>
                                            <p className="text-slate-500">Pick a number between 1 and 9.</p>
                                        </div>

                                        {gameState === 'playing' && (
                                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
                                                <input
                                                    type="text"
                                                    value={guess}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                    className="w-full text-center text-5xl font-extrabold h-24 bg-white border-2 border-indigo-100 rounded-2xl text-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-200"
                                                    maxLength="1"
                                                    disabled={gameState !== 'playing'}
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!guess}
                                                    className="btn-primary w-full py-4 text-lg"
                                                >
                                                    Submit Answer
                                                </button>
                                            </form>
                                        )}

                                        <AnimatePresence>
                                            {hint && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 flex items-start gap-3"
                                                >
                                                    <Lightbulb className="w-5 h-5 shrink-0 text-amber-500" />
                                                    <p className="font-medium text-sm">{hint}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {(gameState === 'won' || gameState === 'lost') && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`p-6 rounded-2xl border text-center ${gameState === 'won'
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                                    }`}
                                            >
                                                <div className="flex justify-center mb-3">
                                                    {gameState === 'won' ? <Trophy className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-rose-500" />}
                                                </div>
                                                <h4 className="text-xl font-bold mb-2">{gameState === 'won' ? 'You Won!' : 'Game Over'}</h4>
                                                <p className="font-medium mb-6 opacity-90">{message}</p>

                                                <button onClick={startGame} className={`w-full py-3 font-semibold rounded-xl text-white shadow-sm transition-all hover:shadow-md active:scale-95 ${gameState === 'won' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                                                    }`}>
                                                    Play Again
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Game;