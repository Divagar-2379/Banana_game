import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Play, UserPlus, Target, Timer, Trophy, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="glass-card p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300"
    >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
);

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center w-full">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="text-center max-w-3xl mx-auto z-10 space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm mb-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        New Game Mode Available
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 tracking-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Banana Hunt!</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Test your observation skills in this exciting modern number guessing game. Find all the bananas before time runs out!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        {isAuthenticated ? (
                            <Link to="/play">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="btn-primary group text-lg px-8 py-4"
                                >
                                    <Play className="w-5 h-5 mr-no group-hover:translate-x-1 transition-transform" />
                                    Start Playing
                                </motion.button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="btn-primary group text-lg px-8 py-4 w-full sm:w-auto flex items-center gap-2"
                                    >
                                        <Play className="w-5 h-5" />
                                        Login to Play
                                    </motion.button>
                                </Link>
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto flex items-center gap-2"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl relative z-10">
                    <FeatureCard
                        icon={Target}
                        title="Guess the Number"
                        description="Count the bananas in the vibrant images and enter your best guess quickly."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Timer}
                        title="Beat the Clock"
                        description="You have exactly 60 seconds to make your guess. Feel the pressure!"
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Trophy}
                        title="Compete Globally"
                        description="Track your high scores, build your streak, and compete against friends."
                        delay={0.3}
                    />
                </div>

                {/* Tech Stack Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 glass-card p-8 w-full max-w-4xl text-center"
                >
                    <h3 className="text-lg font-semibold text-slate-500 uppercase tracking-wider mb-6">Built with the ultimate stack</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind', 'Framer Motion'].map((tech, i) => (
                            <span key={tech} className="px-5 py-2.5 rounded-xl bg-white/60 text-slate-700 font-medium border border-slate-200 shadow-sm hover:shadow hover:-translate-y-1 transition duration-300">
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