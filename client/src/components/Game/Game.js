import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Timer from './Timer';
import { playSound } from '../../utils/audio';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Trophy, XCircle, Lightbulb, User as UserIcon, Crown, Heart, Target, Infinity as InfinityIcon, Flag, Flame, Coins, Zap, Clock } from 'lucide-react';

const Game = () => {
    const { user, updateUserStats } = useAuth();

    const [gameState, setGameState] = useState('mode-selection'); // mode-selection -> idle -> playing -> won/lost/completed
    const [gameMode, setGameMode] = useState(null); // 'continuous' or 'level'
    const [currentLevel, setCurrentLevel] = useState(1);
    
    const [gameData, setGameData] = useState(null);
    const [guess, setGuess] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [maxTime, setMaxTime] = useState(60);
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState(null);
    const [shakeCount, setShakeCount] = useState(0);
    
    // New mechanics state
    const [coins, setCoins] = useState(user?.stats?.goldCoins || 0);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [fastAnswers, setFastAnswers] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [disabledKeys, setDisabledKeys] = useState([]);
    
    const { width, height } = useWindowSize();

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
                    if (prev <= 10) {
                        playSound('urgentTick');
                    } else if (prev <= 30 && prev % 2 === 0) {
                        playSound('tick');
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, timeLeft]);

    const handleTimeUp = async () => {
        setGameState('lost');
        setMessage("Time's up.");
        playSound('gameover');
        try { await api.post('/game/timeout', { gameId: gameData?.gameId }); } catch (e) { }
    };

    const getDynamicTimeLimit = () => {
        if (gameMode === 'level') {
            // Difficulty increases: start at 60s, decrease by 0.5s per level, min 10s
            return Math.max(10, Math.floor(60 - (currentLevel - 1) * 0.5));
        }
        return 60;
    };

    const startNextLevel = async () => {
        try {
            setGameState('loading');
            setMessage('Generating next challenge...');
            setGuess('');
            setHint(null);
            setAttempts(0);
            
            const response = await api.post('/game/start');
            const data = response.data;
            setGameData(data);
            
            const timeLimit = getDynamicTimeLimit();
            setTimeLeft(timeLimit);
            setMaxTime(timeLimit);
            setDisabledKeys([]);
            
            setGameState('playing');
            setQuestionStartTime(Date.now());
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
            if (gameMode === 'level' && gameState !== 'won') {
                setCurrentLevel(1); // Reset to 1 if fully restarting
            }

            const response = await api.post('/game/start');
            const data = response.data;
            setGameData(data);
            
            const timeLimit = getDynamicTimeLimit();
            setTimeLeft(timeLimit);
            setMaxTime(timeLimit);
            setDisabledKeys([]);
            setComboMultiplier(1);
            setFastAnswers(0);
            
            setGameState('playing');
            setQuestionStartTime(Date.now());
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
                if (result.coinsEarned) {
                    setCoins(prev => prev + result.coinsEarned);
                }

                // Combo Logic (Answered in < 3s)
                const answerTime = (Date.now() - questionStartTime) / 1000;
                if (answerTime < 3) {
                    setFastAnswers(prev => {
                        const newFast = prev + 1;
                        if (newFast >= 3) { setComboMultiplier(3); }
                        else if (newFast >= 1) { setComboMultiplier(2); }
                        return newFast;
                    });
                } else {
                    setFastAnswers(0);
                    setComboMultiplier(1);
                }

                // Add combo multiplier to score
                const baseResultScore = result.score || 0;
                const finalScored = baseResultScore * comboMultiplier;
                setScore(prev => prev + finalScored);
                playSound('win');
                updateUserStats(result.stats);
                
                if (gameMode === 'level') {
                    if (currentLevel >= 100) {
                        setGameState('completed');
                        setMessage(`Congratulations! You have completed all 100 levels!`);
                    } else {
                        setGameState('won');
                        setMessage(`Correct! Level ${currentLevel} cleared.`);
                        setCurrentLevel(prev => prev + 1);
                        setTimeout(() => startNextLevel(), 1500);
                    }
                } else {
                    setGameState('won');
                    setMessage(`Correct.`);
                    setTimeout(() => startNextLevel(), 1500);
                }
            } else {
                setGuess('');
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                setFastAnswers(0);
                setComboMultiplier(1);

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
                } else if (e.key.toLowerCase() === 'f') {
                    handleTimeFreeze();
                } else if (e.key.toLowerCase() === 'h') {
                    handleFiftyFifty();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, guess, coins, disabledKeys]);

    const maxLives = 3;
    const remainingLives = Math.max(0, maxLives - attempts);

    // Power-ups actions
    const handleTimeFreeze = () => {
        if (coins >= 10 && gameState === 'playing') {
            setCoins(prev => prev - 10);
            setTimeLeft(prev => prev + 10);
            setMaxTime(prev => prev + 10);
            playSound('click');
        }
    };

    const handleFiftyFifty = () => {
        if (coins >= 15 && gameState === 'playing' && disabledKeys.length === 0 && gameData?.solution) {
            setCoins(prev => prev - 15);
            // Hide 4 wrong keys
            let wrongs = [1,2,3,4,5,6,7,8,9].filter(k => k !== gameData.solution);
            // shuffle array
            wrongs.sort(() => 0.5 - Math.random());
            setDisabledKeys(wrongs.slice(0, 4));
            playSound('click');
        }
    };

    const handleKeypadPress = (num) => {
        if (disabledKeys.includes(num)) return;
        setGuess(num.toString());
        playSound('click');
    };

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
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                            Banana Hunt Dashboard
                        </h2>
                    </div>

                    <div className="flex gap-4 sm:gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 px-5 py-2.5 rounded-xl border border-indigo-50 dark:border-slate-700 shadow-sm transition-colors">
                        <span className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                            <UserIcon className="w-4 h-4 text-indigo-400 dark:text-indigo-500" /> {user?.username}
                        </span>
                        <span className="hidden sm:flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-700/50">
                            <Coins className="w-4 h-4 fill-current" /> {coins}
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

                        {/* MODE SELECTION */}
                        {gameState === 'mode-selection' && (
                            <motion.div
                                key="mode-selection"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="w-full flex flex-col gap-6"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Select Game Mode</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Choose your preferred way to play Banana Hunt.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                                    {/* Continuous Mode */}
                                    <button 
                                        onClick={() => { setGameMode('continuous'); setGameState('idle'); }}
                                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 rounded-3xl border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-indigo-500/20 text-left group"
                                    >
                                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                            <InfinityIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Continuous Mode</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Endless gameplay! Keep answering to build up your streak and score to the absolute maximum. No limits.</p>
                                    </button>

                                    {/* Level Mode */}
                                    <button 
                                        onClick={() => { setGameMode('level'); setGameState('idle'); }}
                                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 rounded-3xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-purple-500/20 text-left group"
                                    >
                                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Level Mode</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Beat 100 structured levels sequentially with gradually increasing difficulty. Are you up for the challenge?</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* IDLE */}
                        {gameState === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="text-center w-full max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-10 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-colors"
                            >
                                <button onClick={() => setGameState('mode-selection')} className="absolute top-6 left-6 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    &larr; Back
                                </button>
                                <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-slate-600 shadow-inner transition-colors">
                                    <span className="text-4xl">🍌</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">
                                    {gameMode === 'level' ? `Level Mode` : `Continuous Mode`}
                                </h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
                                    {gameMode === 'level' ? 'Complete 100 progressively harder levels! Time limits decrease as you climb higher.' : 'You have 60 seconds and 3 attempts per round. Count the bananas correctly to build your streak.'}
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
                        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost' || gameState === 'completed') && (
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
                                            {gameMode === 'level' ? `Level Progress` : (gameState === 'playing' ? 'Potential Score' : 'Final Score')}
                                        </div>
                                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums transition-colors">
                                            {gameMode === 'level' ? `${currentLevel} / 100` : (gameState === 'playing' ? currentPotentialScore : score)}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Area */}
                                <div className="flex flex-col md:flex-row gap-6 h-full">
                                    {/* Left: Image Container */}
                                    <div className={`flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-indigo-100 dark:border-slate-700 overflow-hidden relative min-h-[300px] md:min-h-[400px] flex items-center justify-center p-6 group transition-all duration-500 ${gameMode === 'level' && currentLevel > 15 ? 'filter saturate-[1.2]' : ''}`}>
                                        {gameData?.question ? (
                                            <motion.img
                                                key={gameData.question}
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                src={gameData.question}
                                                alt="Banana puzzle"
                                                className={`w-full h-full object-contain max-h-[350px] transition-transform duration-500 ${gameMode === 'level' && currentLevel > 30 ? (currentLevel % 2 === 0 ? 'scale-x-[-1]' : 'rotate-[2deg]') : ''} ${gameMode === 'level' && currentLevel > 10 ? 'animate-unblur' : ''}`}
                                            />
                                        ) : (
                                            <Loader2 className="w-8 h-8 text-indigo-400 dark:text-indigo-500 animate-spin" />
                                        )}
                                        
                                        {comboMultiplier > 1 && gameState === 'playing' && (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                className="absolute top-4 left-4 flex items-center gap-1.5 bg-orange-500/90 text-white px-3 py-1.5 rounded-full font-black tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-orange-400 backdrop-blur-sm z-20"
                                            >
                                                <Flame className="w-4 h-4 fill-current" /> {comboMultiplier}x COMBO
                                            </motion.div>
                                        )}
                                        
                                        {/* Power-ups container */}
                                        {gameState === 'playing' && (
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                                                <button 
                                                    onClick={handleTimeFreeze} disabled={coins < 10}
                                                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 group relative ${coins >= 10 ? 'bg-sky-500 border-sky-400 text-white shadow-sky-500/30' : 'bg-slate-200 border-slate-300 text-slate-400'}`}
                                                    title="Freeze Time (+10s) - 10 Coins"
                                                >
                                                    <Clock className="w-5 h-5 fill-current" />
                                                    <span className="absolute -bottom-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">10 Coins</span>
                                                </button>
                                                <button 
                                                    onClick={handleFiftyFifty} disabled={coins < 15 || disabledKeys.length > 0}
                                                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 group relative ${coins >= 15 && disabledKeys.length === 0 ? 'bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/30' : 'bg-slate-200 border-slate-300 text-slate-400'}`}
                                                    title="50/50 - 15 Coins"
                                                >
                                                    <Zap className="w-5 h-5 fill-current" />
                                                    <span className="absolute -bottom-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">15 Coins</span>
                                                </button>
                                            </div>
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

                                                <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 justify-center">
                                                    <input
                                                        type="text"
                                                        value={guess}
                                                        onChange={handleInputChange}
                                                        placeholder="?"
                                                        className="hidden md:block w-full text-center text-5xl font-black h-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 mb-2 shadow-inner"
                                                        maxLength="1"
                                                        autoFocus
                                                    />
                                                    
                                                    {/* On-Screen Keypad */}
                                                    <div className="grid grid-cols-3 gap-2 mb-2 w-full max-w-[260px] mx-auto">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                            <button
                                                                type="button"
                                                                key={num}
                                                                disabled={disabledKeys.includes(num)}
                                                                onClick={() => handleKeypadPress(num)}
                                                                className={`h-14 rounded-xl text-2xl font-black transition-all shadow-sm active:scale-95 ${guess === num.toString() 
                                                                    ? 'bg-indigo-600 text-white shadow-indigo-500/30' 
                                                                    : disabledKeys.includes(num)
                                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                                                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-400 hover:text-indigo-600'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>

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

                                        {(gameState === 'won' || gameState === 'lost' || gameState === 'completed') && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col h-full items-center justify-center text-center transition-colors"
                                            >
                                                <div className="mb-4">
                                                    {gameState === 'completed'
                                                        ? <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors"><Flag className="w-8 h-8" /></div>
                                                        : gameState === 'won'
                                                        ? <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors"><Trophy className="w-8 h-8" /></div>
                                                        : <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-colors"><XCircle className="w-8 h-8" /></div>}
                                                </div>

                                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                                                    {gameState === 'completed' ? 'Level 100 Cleared!' : (gameState === 'won' ? 'Great job!' : 'Round Over')}
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

                                                {(gameState === 'lost' || gameState === 'completed') ? (
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <button onClick={startGame} className="btn-gradient w-full py-3 shadow-lg shadow-indigo-500/20">Play Again</button>
                                                        <button onClick={() => setGameState('mode-selection')} className="btn-secondary w-full py-3">Change Mode</button>
                                                    </div>
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
            {/* Confetti Celebration */}
            {gameState === 'completed' || (gameState === 'won' && gameMode === 'level' && currentLevel % 10 === 1 && currentLevel > 1) ? (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                />
            ) : null}
        </div>
    );
};

export default Game;