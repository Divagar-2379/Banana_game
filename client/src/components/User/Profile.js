import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Stats from './Stats';
import { motion } from 'framer-motion';
import { Calendar, Mail, Edit3, Settings, Shield, Activity, User, ChevronRight } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return (
        <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
            {/* Colorful Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-5xl mx-auto space-y-6 relative z-10">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Area */}
                    <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Settings</div>
                        <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-indigo-100 shadow-sm text-sm font-semibold text-indigo-700 shadow-indigo-500/5">
                            <span className="flex items-center gap-2.5"><User className="w-4 h-4 text-indigo-500" /> General</span>
                            <ChevronRight className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/60 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                            <span className="flex items-center gap-2.5"><Settings className="w-4 h-4 text-slate-400" /> Preferences</span>
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/60 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                            <span className="flex items-center gap-2.5"><Activity className="w-4 h-4 text-slate-400" /> Activity Log</span>
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-2xl border border-indigo-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] shadow-indigo-500/5 overflow-hidden"
                        >
                            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100">
                                <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-500 shadow-inner">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.username}</h2>
                                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5 font-medium">
                                        <Shield className="w-4 h-4 text-emerald-500" /> Verified Player
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-slate-50/50">
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                        <p className="font-semibold text-slate-900 text-sm truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                                        <p className="font-semibold text-slate-900 text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <Stats stats={user.stats} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;