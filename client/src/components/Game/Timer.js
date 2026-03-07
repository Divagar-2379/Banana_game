import React from 'react';
import { motion } from 'framer-motion';
import { Timer as TimerIcon } from 'lucide-react';

const Timer = ({ timeLeft }) => {
    // Determine the color and pulsing behavior based on time left
    let colorClass = 'text-emerald-500 bg-emerald-50 border-emerald-100';
    let isUrgent = false;

    if (timeLeft <= 10) {
        colorClass = 'text-rose-500 bg-rose-50 border-rose-100';
        isUrgent = true;
    } else if (timeLeft <= 30) {
        colorClass = 'text-amber-500 bg-amber-50 border-amber-100';
    }

    return (
        <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={isUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colorClass} font-bold text-lg shadow-sm w-32 justify-center`}
        >
            <TimerIcon className={`w-5 h-5 ${isUrgent ? 'animate-pulse' : ''}`} />
            <span className="tabular-nums">
                00:{timeLeft.toString().padStart(2, '0')}
            </span>
        </motion.div>
    );
};

export default Timer;