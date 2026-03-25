import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, Flame, Gamepad2, Zap } from 'lucide-react';

const Stats = ({ stats }) => {
    const statItems = [
        { label: 'Games Played', value: stats?.gamesPlayed || 0, icon: Gamepad2, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
        { label: 'Games Won', value: stats?.gamesWon || 0, icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        { label: 'Win Rate', value: stats?.gamesPlayed ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%', icon: Target, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Total XP', value: stats?.xp || 0, icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
        { label: 'Current Streak', value: stats?.currentStreak || 0, icon: Flame, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        { label: 'Total Score', value: stats?.totalScore || 0, icon: Star, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] shadow-indigo-500/5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-8 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Your Statistics</h3>
                <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase transition-colors">
                    Global Rank: <span className="text-indigo-600 dark:text-indigo-300 ml-1">Unranked</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 transition-colors">{item.value}</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{item.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Stats;