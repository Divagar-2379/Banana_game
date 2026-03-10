import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Timer from './Timer';
import { playSound } from '../../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Trophy, XCircle, Lightbulb, User as UserIcon, Crown, Heart } from 'lucide-react';

const Game = () => {
    const { user, updateUserStats } = useAuth();

    const [gameState, setGameState] = useState('idle');
    const [gameData, setGameData] = useState(null);
    const [guess, setGuess] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [maxTime, setMaxTime] = useState(60);
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState(null);
    const [shakeCount, setShakeCount] = useState(0);

    const currentPotentialScore = score + Math.max(0, 100 + timeLeft);
    const timeTaken = maxTime - timeLeft;

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

    const handleTimeUp = async () => {
        setGameState('lost');
        setMessage("Time's up.");
        playSound('gameover');
        try { await api.post('/game/timeout', { gameId: gameData?.gameId }); } catch (e) { }
    };

    const startNextLevel = async () => {
        try {
            setGameState('loading');
            setMessage('Generating next challenge...');
            setGuess('');
            setHint(null);
            const response = await api.post('/game/start');
            const data = response.data;
            setGameData(data);
            setTimeLeft(data.timeLimit || 60);
            setMaxTime(data.timeLimit || 60);
            setGameState('playing');
            setMessage('How many bananas do you see?');
        } catch (error) {
            setMessage('Failed to load level.');
            setGameState('lost');
        }
    };

    const startGame = async () => {
        try {
            playSound('click');
            setGameState('loading');
            setMessage('Preparing session...');
            setGuess('');
            setHint(null);
            setAttempts(0);
            setScore(0);
            const response = await api.post('/game/start');
            const data = response.data;
            setGameData(data);
            setTimeLeft(data.timeLimit || 60);
            setMaxTime(data.timeLimit || 60);
            setGameState('playing');
            setMessage('How many bananas do you see?');
        } catch (error) {
            setMessage('Failed to start. Please try again.');
            setGameState('idle');
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^[1-9]$/.test(value))) {
            setGuess(value);
            if (value) playSound('click');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!guess || gameState !== 'playing') return;

        try {
            const response = await api.post('/game/answer', {
                gameId: gameData.gameId,
                answer: parseInt(guess)
            });

            const result = response.data;

            if (result.correct) {
                setGameState('won');
                setScore(prev => prev + result.score);
                setMessage(`Correct.`);
                playSound('win');
                updateUserStats(result.stats);
                setTimeout(() => startNextLevel(), 1500);
            } else {
                setGuess('');
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);

                if (result.gameOver || newAttempts >= 3) {
                    setGameState('lost');
                    setMessage(`Game Over. The correct answer was ${result.solution || 'hidden'}.`);
                    playSound('gameover');
                    updateUserStats(result.stats);
                } else {
                    setHint(result.hint);
                    setShakeCount(s => s + 1);
                    playSound('wrong');
                }
            }
        } catch (error) {
            setMessage('Network error. Try again.');
        }
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameState === 'playing') {
                if (e.key >= '1' && e.key <= '9') {
                    setGuess(e.key);
                    playSound('click');
                } else if (e.key === 'Enter' && guess) {
                    handleSubmit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, guess]);

    const maxLives = 3;
    const remainingLives = Math.max(0, maxLives - attempts);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 relative overflow-hidden font-sans transition-colors duration-300">
            {/* Colorful Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 dark:bg-indigo-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-50 animate-float pointer-events-none transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 dark:bg-purple-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-50 animate-float pointer-events-none transition-colors duration-500" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-4xl mx-auto relative z-10 w-full transition-colors duration-300">

                {/* Header */}
                <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 shadow-indigo-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm border border-indigo-100 dark:border-slate-600 transition-colors">
                            🍌
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Banana Hunt Dashboard</h2>
                    </div>

                    <div className="flex gap-4 sm:gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 px-5 py-2.5 rounded-xl border border-indigo-50 dark:border-slate-700 shadow-sm transition-colors">
                        <span className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                            <UserIcon className="w-4 h-4 text-indigo-400 dark:text-indigo-500" /> {user?.username}
                        </span>
                        <span className="hidden sm:flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default">
                            <Trophy className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> {user?.stats?.gamesWon || 0} Wins
                        </span>
                        <span className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-default">
                            <Crown className="w-4 h-4 text-orange-500 dark:text-orange-400" /> Max Streak: {user?.stats?.bestStreak || 0}
                        </span>
                    </div>
                </header>

                <div className="w-full relative min-h-[500px] flex flex-col items-center justify-center p-2 sm:p-0">
                    <AnimatePresence mode="wait">

                        {/* IDLE */}
                        {gameState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="text-center w-full max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-10 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-colors"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-slate-600 shadow-inner transition-colors">
                                    <span className="text-4xl">🍌</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">Ready to focus?</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
                                    You have 60 seconds and 3 attempts per round. Count the bananas correctly to build your streak.
                                </p>
                                <button className="btn-gradient w-full py-4 text-lg font-bold flex items-center justify-center gap-2" onClick={startGame}>
                                    <Play className="w-5 h-5 fill-current" /> Start Session
                                </button>
                            </motion.div>
                        )}

                        {/* LOADING */}
                        {gameState === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-10 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-lg w-full max-w-sm transition-colors"
                            >
                                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                                <p className="font-bold text-slate-600 dark:text-slate-300 transition-colors">{message}</p>
                            </motion.div>
                        )}

                        {/* PLAYING / RESULTS */}
                        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
                            <motion.div
                                key="game"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="w-full flex flex-col gap-6"
                            >
                                {/* Dashboard Top Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-slate-700 flex items-center justify-center shadow-sm shadow-indigo-500/5 transition-colors">
                                        <Timer timeLeft={timeLeft} maxTime={maxTime} />
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm shadow-indigo-500/5 transition-colors">
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1.5 transition-colors">Attempts Left</div>
                                        <div className="flex gap-1.5">
                                            {Array.from({ length: maxLives }).map((_, i) => (
                                                <div key={i}>
                                                    <Heart className={`w-5 h-5 transition-colors ${i < remainingLives ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.4)]' : 'text-slate-200 dark:text-slate-600'}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm shadow-indigo-500/5 transition-colors">
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 transition-colors">
                                            {gameState === 'playing' ? 'Potential Score' : 'Final Score'}
                                        </div>
                                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums transition-colors">
                                            {gameState === 'playing' ? currentPotentialScore : score}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Area */}
                                <div className="flex flex-col md:flex-row gap-6 h-full">
                                    {/* Left: Image Container */}
                                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-indigo-100 dark:border-slate-700 overflow-hidden relative min-h-[300px] md:min-h-[400px] flex items-center justify-center p-6 group transition-colors">
                                        {gameData?.question ? (
                                            <motion.img
                                                key={gameData.question}
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                src={gameData.question}
                                                alt="Banana puzzle"
                                                className="w-full h-full object-contain max-h-[350px] transition-transform duration-500"
                                            />
                                        ) : (
                                            <Loader2 className="w-8 h-8 text-indigo-400 dark:text-indigo-500 animate-spin" />
                                        )}
                                    </div>

                                    {/* Right: Interaction Panel */}
                                    <div className="w-full md:w-[320px] shrink-0">
                                        {gameState === 'playing' && (
                                            <motion.div
                                                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col h-full transition-colors"
                                                animate={shakeCount > 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
                                                transition={{ duration: 0.3 }}
                                                key={`panel-${shakeCount}`}
                                            >
                                                <div className="text-center mb-6 mt-4">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white transition-colors">Your Answer</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Press 1-9 to guess</p>
                                                </div>

                                                <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 justify-center">
                                                    <input
                                                        type="text"
                                                        value={guess}
                                                        onChange={handleInputChange}
                                                        placeholder="?"
                                                        className="w-full text-center text-6xl font-black h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 block mb-4 shadow-inner"
                                                        maxLength="1"
                                                        autoFocus
                                                    />
                                                    <button type="submit" disabled={!guess} className="btn-gradient py-3.5 text-base w-full shadow-lg shadow-indigo-500/20">
                                                        Submit Guess
                                                    </button>
                                                </form>

                                                <AnimatePresence>
                                                    {hint && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                            className="mt-4 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-3 rounded-xl border border-orange-100 dark:border-orange-800/50 flex items-center gap-2 text-sm font-medium transition-colors"
                                                        >
                                                            <Lightbulb className="w-4 h-4 shrink-0 text-orange-500 dark:text-orange-400" />
                                                            {hint}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}

                                        {(gameState === 'won' || gameState === 'lost') && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col h-full items-center justify-center text-center transition-colors"
                                            >
                                                <div className="mb-4">
                                                    {gameState === 'won'
                                                        ? <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors"><Trophy className="w-8 h-8" /></div>
                                                        : <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors"><XCircle className="w-8 h-8" /></div>}
                                                </div>

                                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                                                    {gameState === 'won' ? 'Great job!' : 'Round Over'}
                                                </h4>

                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 px-2 transition-colors">{message}</p>

                                                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Time</div>
                                                        <div className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">{timeTaken}s</div>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Score</div>
                                                        <div className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">{score}</div>
                                                    </div>
                                                </div>

                                                {gameState === 'lost' ? (
                                                    <button onClick={startGame} className="btn-gradient w-full py-3 shadow-lg shadow-indigo-500/20">Play Again</button>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 transition-colors">
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading next...
                                                    </div>
                                                )}
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