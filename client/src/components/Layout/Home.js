import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Target, Timer, Trophy, CheckCircle2 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        viewport={{ once: true }}
        className="group relative p-8 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300"
    >
        <div className="w-12 h-12 mb-6 rounded-xl bg-indigo-50 dark:bg-slate-700 border border-indigo-100 dark:border-slate-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm transition-colors">{description}</p>
    </motion.div>
);

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
            {/* Colorful Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-40 animate-float transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-40 animate-float transition-all duration-500" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -ml-48 -mt-48 w-96 h-96 bg-rose-400 dark:bg-indigo-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-30 animate-float transition-all duration-500" style={{ animationDelay: '4s' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center w-full relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm shadow-indigo-500/5 mb-2 transition-colors">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 dark:bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 dark:bg-indigo-400"></span>
                        </span>
                        v2.0 Beta Now Available
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] transition-colors">
                        Master your focus.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Hunt the Bananas.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors">
                        A modern cognitive training tool disguised as a delightful game. Count quickly, react faster, and climb the global leaderboards.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        {isAuthenticated ? (
                            <Link to="/play">
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="btn-gradient text-lg px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Go to Dashboard
                                </motion.button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="btn-gradient text-lg px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-2"
                                    >
                                        Start Playing
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </Link>
                                <Link to="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="btn-secondary dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 text-lg px-10 py-4 w-full sm:w-auto transition-colors"
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-32 w-full max-w-5xl">
                    <FeatureCard
                        icon={Target}
                        title="Precision Training"
                        description="Hone your quick-counting skills with dynamically generated, unpredictable image patterns."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Timer}
                        title="Time Pressure"
                        description="60 seconds on the clock. Make split-second decisions to maximize your score multiplier."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Trophy}
                        title="Global Rankings"
                        description="Track your performance metrics securely, build your daily streak, and compete worldwide."
                        delay={0.3}
                    />
                </div>

            </div>
        </div>
    );
};

export default Home;