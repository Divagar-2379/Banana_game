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
        className="group relative p-8 bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
    >
        <div className="w-12 h-12 mb-6 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">{description}</p>
    </motion.div>
);

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center overflow-hidden bg-slate-50 relative">
            {/* Colorful Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -ml-48 -mt-48 w-96 h-96 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center w-full relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 font-bold text-xs shadow-sm shadow-indigo-500/5 mb-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        v2.0 Beta Now Available
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                        Master your focus.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Hunt the Bananas.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
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
                                        className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto"
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

                {/* Proof Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 w-full max-w-4xl text-center flex flex-col items-center"
                >
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Powered by modern web technologies</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 gap-y-6 opacity-80">
                        {['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind CSS'].map((tech) => (
                            <span key={tech} className="text-lg font-bold text-slate-700 tracking-tight flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-default">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;