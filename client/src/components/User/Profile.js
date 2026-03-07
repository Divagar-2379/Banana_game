import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Stats from './Stats';
import { motion } from 'framer-motion';
import { User as UserIcon, Calendar, Mail, Edit3, Settings, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                    {/* Profile Section */}
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-12 sm:-mt-16 mb-8">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-xl shrink-0"
                            >
                                <div className="w-full h-full bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl font-bold text-indigo-600">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            </motion.div>

                            <div className="flex-1 space-y-1">
                                <h2 className="text-3xl font-bold text-slate-800">{user.username}</h2>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" /> Verified Player
                                </p>
                            </div>

                            <div className="flex gap-3 mt-4 sm:mt-0">
                                <button className="btn-secondary px-4 py-2 text-sm gap-2">
                                    <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button className="btn-outline px-4 py-2 text-sm gap-2 text-slate-600 border-slate-200">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="font-medium text-slate-700">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</p>
                                    <p className="font-medium text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Stats stats={user.stats} />
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;