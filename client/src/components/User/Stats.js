import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, Flame, Crown, Gamepad2 } from 'lucide-react';

const Stats = ({ stats }) => {
    const statItems = [
        { label: 'Games Played', value: stats?.gamesPlayed || 0, icon: Gamepad2, color: 'text-gray-900', bg: 'bg-gray-100' },
        { label: 'Games Won', value: stats?.gamesWon || 0, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Win Rate', value: stats?.gamesPlayed ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Score', value: stats?.totalScore || 0, icon: Star, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Current Streak', value: stats?.currentStreak || 0, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Best Streak', value: stats?.bestStreak || 0, icon: Crown, color: 'text-rose-600', bg: 'bg-rose-50' }
    ];

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-indigo-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Your Statistics</h3>
                <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 text-xs font-bold tracking-widest uppercase">
                    Global Rank: <span className="text-indigo-600 ml-1">Unranked</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{item.value}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Stats;