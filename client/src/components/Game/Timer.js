import React from 'react';
import { motion } from 'framer-motion';
import { Timer as TimerIcon } from 'lucide-react';

const Timer = ({ timeLeft, maxTime = 60 }) => {
    let colorClass = 'text-indigo-600';
    let progressColor = 'bg-indigo-500';
    let isUrgent = false;

    if (timeLeft <= 10) {
        colorClass = 'text-rose-600';
        progressColor = 'bg-rose-500';
        isUrgent = true;
    } else if (timeLeft <= 30) {
        colorClass = 'text-orange-500';
        progressColor = 'bg-orange-500';
    }

    const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

    return (
        <div className="w-full flex items-center justify-between gap-4">
            <motion.div
                animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                transition={isUrgent ? { repeat: Infinity, duration: 0.8 } : {}}
                className={`flex items-center gap-2 font-bold text-2xl tracking-tight ${colorClass}`}
            >
                <TimerIcon className={`w-6 h-6 ${isUrgent ? 'animate-pulse' : 'text-indigo-400'}`} />
                <span className="tabular-nums">00:{timeLeft.toString().padStart(2, '0')}</span>
            </motion.div>

            <div className="flex-1 hidden sm:block h-2 bg-indigo-50 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    className={`h-full rounded-full ${progressColor}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                />
            </div>
        </div>
    );
};

export default Timer;