import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Command } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) navigate('/play');
        else setError(result.message);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
            {/* Colorful Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 dark:bg-indigo-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-40 animate-float transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 dark:bg-purple-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-40 animate-float transition-all duration-500" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -ml-48 -mt-48 w-96 h-96 bg-rose-400 dark:bg-rose-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-float transition-all duration-500" style={{ animationDelay: '4s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm z-10"
            >
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="p-2 mb-4 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
                        <Command className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Welcome back</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Please enter your details to sign in.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-colors">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-3 rounded-lg flex items-center gap-2 border border-rose-100 dark:border-rose-800/50 overflow-hidden"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-semibold">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300 dark:hover:border-slate-600"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Password</label>
                                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors">Forgot password?</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300 dark:hover:border-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full mt-2! h-11"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-6 transition-colors">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;