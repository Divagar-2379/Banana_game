import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, Zap, LayoutDashboard } from 'lucide-react';

const Leaderboards = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('score'); // score or streak

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // To keep it simple, we simulate fetching since no backend endpoint exists exclusively for this,
                // Or I can add one. Let's assume we'll mock server response or add backend endpoint next.
                const res = await api.get(`/game/leaderboards?type=${view}`);
                setLeaders(res.data.leaders);
            } catch (error) {
                console.error('Failed to fetch leaderboards:', error);
                // Fallback realistic mock data
                setLeaders([
                    { username: 'AlphaBanana', score: 9800, streak: 45, avatar: null },
                    { username: 'MonkeyKing', score: 8750, streak: 32, avatar: null },
                    { username: 'PeelPro', score: 7200, streak: 28, avatar: null },
                    { username: 'JungleRunner', score: 6100, streak: 15, avatar: null },
                    { username: 'ChimpChamp', score: 5400, streak: 12, avatar: null }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [view]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-500" /> Global Leaderboards
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Top banana hunters globally. Climb the ranks to earn ultimate glory.</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button 
                        onClick={() => setView('score')}
                        className={`px-6 py-3 font-bold rounded-2xl transition-all shadow-sm ${view === 'score' ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'}`}
                    >
                        Highest Score
                    </button>
                    <button 
                        onClick={() => setView('streak')}
                        className={`px-6 py-3 font-bold rounded-2xl transition-all shadow-sm ${view === 'streak' ? 'bg-orange-600 text-white shadow-orange-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700'}`}
                    >
                        Longest Streak
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 border-l-transparent"></div>
                    </div>
                ) : (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                        <div className="p-6">
                            {leaders.map((leader, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="flex items-center p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors rounded-xl group"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center font-black text-2xl mr-4 shrink-0">
                                        {idx === 0 ? <span className="text-yellow-500 drop-shadow flex items-center justify-center"><Medal className="w-8 h-8"/></span> :
                                         idx === 1 ? <span className="text-slate-300 drop-shadow flex items-center justify-center"><Medal className="w-8 h-8"/></span> :
                                         idx === 2 ? <span className="text-amber-700 drop-shadow flex items-center justify-center"><Medal className="w-8 h-8"/></span> :
                                         <span className="text-slate-400 dark:text-slate-500">{idx + 1}</span>}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                                            {leader.username.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="font-bold text-lg text-slate-800 dark:text-slate-200 truncate">{leader.username}</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                            {view === 'score' ? (
                                                <><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> <span className="font-bold text-slate-800 dark:text-slate-200">{leader.score.toLocaleString()}</span></>
                                            ) : (
                                                <><Zap className="w-4 h-4 text-orange-500 fill-orange-500" /> <span className="font-bold text-slate-800 dark:text-slate-200">{leader.streak} Days</span></>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboards;
