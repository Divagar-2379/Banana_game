import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroVideo = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // Simple timing sequence for our "Intro Video / Cinematic"
        const timers = [
            setTimeout(() => setPhase(1), 1500), // First text fades out
            setTimeout(() => setPhase(2), 2500), // Banana hunt logo appears
            setTimeout(() => setPhase(3), 4500), // Banana hunt logo fades out
            setTimeout(() => {
                setPhase(4);
                onComplete();
            }, 5500) // End sequence
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase < 4 && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#0b0f19] flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* Background glow effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/30 blur-[100px] rounded-full pointer-events-none" />
                    
                    <AnimatePresence mode="wait">
                        {phase === 0 && (
                            <motion.div
                                key="studio"
                                initial={{ opacity: 0, scale: 0.9, letterSpacing: '0px' }}
                                animate={{ opacity: 1, scale: 1, letterSpacing: '8px' }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-center"
                            >
                                <h1 className="text-sm md:text-xl font-medium text-indigo-300 uppercase tracking-widest">
                                    A Game Studio Production
                                </h1>
                            </motion.div>
                        )}

                        {phase === 2 && (
                            <motion.div
                                key="title"
                                className="text-center flex flex-col items-center justify-center"
                                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0, 
                                    scale: 1,
                                    rotate: [0, -5, 5, -2, 2, 0] // slight shake
                                }}
                                exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            >
                                <motion.div 
                                    className="text-8xl md:text-9xl mb-4"
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    🍌
                                </motion.div>
                                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-orange-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                                    Banana Hunt
                                </h1>
                                <p className="text-amber-100/50 mt-4 tracking-[0.3em] font-bold text-sm">
                                    THE ULTIMATE COUNTING SURVIVAL
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntroVideo;
