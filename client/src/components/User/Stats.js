import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, Flame, Crown, Gamepad2 } from 'lucide-react';

const Stats = ({ stats }) => {
    const statItems = [
        {
            label: 'Games Played',
            value: stats?.gamesPlayed || 0,
            icon: Gamepad2,
            color: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Games Won',
            value: stats?.gamesWon || 0,
            icon: Trophy,
            color: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Win Rate',
            value: stats?.gamesPlayed ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%',
            icon: Target,
            color: 'from-indigo-500 to-purple-500',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Total Score',
            value: stats?.totalScore || 0,
            icon: Star,
            color: 'from-yellow-400 to-orange-500',
            bg: 'bg-yellow-50'
        },
        {
            label: 'Current Streak',
            value: stats?.currentStreak || 0,
            icon: Flame,
            color: 'from-orange-500 to-red-500',
            bg: 'bg-orange-50'
        },
        {
            label: 'Best Streak',
            value: stats?.bestStreak || 0,
            icon: Crown,
            color: 'from-pink-500 to-rose-500',
            bg: 'bg-pink-50'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Your Statistics</h3>
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-sm font-semibold">
                    Global Rank: <span className="text-indigo-600">Unranked</span>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            >
                {statItems.map((item, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group cursor-default transition-shadow hover:shadow-md"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="w-7 h-7" style={{ color: 'var(--icon-color, currentColor)' }} />
                            {/* We use a trick with SVG mask or just color if the icon is Lucide */}
                            {/* But for simplicity, we can render the icon and add a background gradient class directly to it */}
                        </div>
                        <h4 className={`text-3xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-br ${item.color}`}>
                            {item.value}
                        </h4>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Stats;