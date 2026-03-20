import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Stats from './Stats';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Mail, Edit3, Settings, Shield, Activity, User, ChevronRight, X, Camera, Bell, Eye, Moon, Check, UploadCloud, Trophy, Target } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Edit Form State
    const [editUsername, setEditUsername] = useState(user?.username || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [editAvatarFile, setEditAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = React.useRef(null);

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ||
                localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    // Theme effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Mock Activity Data
    const activityLog = [
        { id: 1, event: "Game Won - 10 Bananas", date: "2026-03-10 14:30", xp: "+50 XP", type: "success" },
        { id: 2, event: "Daily Streak Bonus (Day 5)", date: "2026-03-09 09:15", xp: "+20 XP", type: "bonus" },
        { id: 3, event: "New High Score! (120)", date: "2026-03-08 19:45", xp: "+100 XP", type: "achievement" },
        { id: 4, event: "Game Lost", date: "2026-03-08 19:30", xp: "+5 XP", type: "neutral" },
    ];

    if (!user) return (
        <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA] dark:bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const getAvatarSrc = (avatar) => {
        if (!avatar || avatar === 'default-avatar.png') return null;
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:5005/uploads/${avatar}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            const formData = new FormData();
            if (editUsername !== user.username) formData.append('username', editUsername);
            if (editEmail !== user.email) formData.append('email', editEmail);
            if (editAvatarFile) formData.append('avatar', editAvatarFile);
            
            const result = await updateProfile(formData);
            if (result.success) {
                setIsEditModalOpen(false);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during update');
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <motion.div
                        key="general"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-indigo-100/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-indigo-500/5 overflow-hidden transition-colors">
                            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100/50 dark:border-slate-700">
                                <div className="relative group">
                                    {getAvatarSrc(user.avatar) ? (
                                        <img src={getAvatarSrc(user.avatar)} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border border-indigo-100 dark:border-slate-600 shadow-inner group-hover:shadow-md transition-all duration-300" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 border border-indigo-100 dark:border-slate-600 flex items-center justify-center text-4xl font-black text-indigo-500 dark:text-indigo-400 shadow-inner group-hover:shadow-md transition-all duration-300">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border border-indigo-100 dark:border-slate-600 shadow-sm flex items-center justify-center text-indigo-500 dark:text-indigo-400 hover:text-white dark:hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:scale-105 hover:border-transparent transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{user.username}</h2>
                                    <div className="flex items-center gap-3 mt-2 text-sm font-medium">
                                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm transition-colors">
                                            <Shield className="w-3.5 h-3.5" /> Verified Player
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-2.5 py-1 rounded-full shadow-sm text-xs font-bold uppercase tracking-wider transition-colors">
                                            Level {Math.floor((user.stats?.totalGames || 0) / 10) + 1}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 sm:mt-0">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
                                <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-600 transition-all duration-200 group">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 border border-indigo-100/50 dark:border-slate-600 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Contact Email</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-purple-100 dark:hover:border-slate-600 transition-all duration-200 group">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-700 border border-purple-100/50 dark:border-slate-600 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0 group-hover:scale-110 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Member Since</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Stats stats={user.stats} />
                        </div>
                    </motion.div>
                );
            case 'preferences':
                return (
                    <motion.div
                        key="preferences"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-indigo-100/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-indigo-500/5 overflow-hidden transition-colors"
                    >
                        <div className="p-6 sm:p-8 border-b border-slate-100/50 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
                                    <Settings className="w-5 h-5" />
                                </div>
                                Account Preferences
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium ml-13">Manage your notifications, privacy, and app settings.</p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                            {/* Notification Settings */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Bell className="w-4 h-4" /> Notifications
                                </h4>
                                <div className="space-y-3">
                                    {['Email Notifications', 'Push Notifications', 'In-game Alerts'].map((item, idx) => (
                                        <div key={item} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receive updates about {item.toLowerCase()}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={idx !== 1} />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3 mt-8">
                                    <Eye className="w-4 h-4" /> Privacy
                                </h4>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="mb-4">
                                        <label className="font-semibold text-slate-800 dark:text-slate-200 text-sm block mb-1">Profile Visibility</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Control who can see your stats and activity.</p>
                                    </div>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 font-semibold outline-none transition-all cursor-pointer">
                                        <option value="public">🌍 Public (Everyone)</option>
                                        <option value="friends">👥 Friends Only</option>
                                        <option value="private">🔒 Private (Only Me)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Theme Settings */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3 mt-8">
                                    <Moon className="w-4 h-4" /> Theme
                                </h4>
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Dark Mode</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toggle dark theme appearance</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isDarkMode}
                                            onChange={() => setIsDarkMode(!isDarkMode)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-indigo-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'activity':
                return (
                    <motion.div
                        key="activity"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-indigo-100/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-indigo-500/5 overflow-hidden flex flex-col h-[700px] transition-colors"
                    >
                        <div className="p-6 sm:p-8 border-b border-slate-100/50 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 transition-colors">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
                                    <Activity className="w-5 h-5" />
                                </div>
                                Activity Log
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium ml-13">Your recent games, achievements, and milestones.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                            <div className="space-y-3">
                                {activityLog.map((log) => (
                                    <div key={log.id} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-600 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${log.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' :
                                                    log.type === 'bonus' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800/50 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white' :
                                                        log.type === 'achievement' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/50 text-amber-500 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white' :
                                                            'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:bg-slate-500 group-hover:text-white'
                                                }`}>
                                                {log.type === 'success' ? <Check className="w-5 h-5" /> :
                                                    log.type === 'bonus' ? <Target className="w-5 h-5" /> :
                                                        log.type === 'achievement' ? <Trophy className="w-5 h-5" /> :
                                                            <Activity className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{log.event}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 tracking-wide">{log.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black border tracking-wide uppercase ${log.type === 'neutral' ? 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600' :
                                                    'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50'
                                                }`}>
                                                {log.xp}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-center pt-6">
                                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                        Load More Activity
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 relative overflow-hidden font-sans transition-colors duration-300">
            {/* Colorful Background Decor */}
            <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-400/20'} rounded-full mix-blend-multiply filter blur-[80px] animate-blob transition-colors duration-500`}></div>
            <div className={`absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-400/20'} rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 transition-colors duration-500`}></div>
            <div className={`absolute top-[40%] left-[20%] w-[300px] h-[300px] ${isDarkMode ? 'bg-indigo-800/20' : 'bg-sky-300/20'} rounded-full mix-blend-multiply filter blur-[60px] animate-blob animation-delay-4000 transition-colors duration-500`}></div>

            <div className="max-w-6xl mx-auto relative z-10 w-full">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Area */}
                    <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                        <div className="px-3 py-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"></span>
                            Account Menu
                        </div>

                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'general'
                                    ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-md text-indigo-700 dark:text-indigo-400 shadow-indigo-500/10 translate-x-1'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white border border-transparent'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <User className={`w-4 h-4 ${activeTab === 'general' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                General Profile
                            </span>
                            {activeTab === 'general' && <ChevronRight className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />}
                        </button>

                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'preferences'
                                    ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-md text-indigo-700 dark:text-indigo-400 shadow-indigo-500/10 translate-x-1'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white border border-transparent'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Settings className={`w-4 h-4 ${activeTab === 'preferences' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                Preferences
                            </span>
                            {activeTab === 'preferences' && <ChevronRight className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />}
                        </button>

                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'activity'
                                    ? 'bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-md text-indigo-700 dark:text-indigo-400 shadow-indigo-500/10 translate-x-1'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white border border-transparent'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Activity className={`w-4 h-4 ${activeTab === 'activity' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                Activity Log
                            </span>
                            {activeTab === 'activity' && <ChevronRight className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />}
                        </button>

                        {/* Logout visual cue only */}
                        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition-all">
                                <span className="w-4 h-4 border-2 border-current rounded border-t-transparent border-l-transparent rotate-45 transform skew-x-12 translate-x-1"></span>
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 relative">
                        <AnimatePresence mode="wait">
                            {renderTabContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-40 transition-opacity"
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100/50 dark:border-slate-700 w-full max-w-md pointer-events-auto overflow-hidden text-slate-900 dark:text-white transition-colors"
                            >
                                <div className="p-6 border-b border-slate-100/50 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 relative transition-colors">
                                    <h3 className="text-xl font-black">Edit Profile</h3>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-2 transition-all border border-transparent shadow-sm hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md"
                                    >
                                        <X className="w-4 h-4 font-bold" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                                    {/* Avatar Upload Placeholder */}
                                    {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                            {(avatarPreview || getAvatarSrc(user.avatar)) ? (
                                                <img src={avatarPreview || getAvatarSrc(user.avatar)} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-dashed border-indigo-200 dark:border-slate-500 shadow-sm transition-all" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-slate-700 border-2 border-dashed border-indigo-200 dark:border-slate-500 flex flex-col items-center justify-center text-indigo-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/50 dark:group-hover:bg-slate-600 group-hover:border-indigo-400 transition-all shadow-sm">
                                                    <UploadCloud className="w-7 h-7 mb-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                                </div>
                                            )}
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                            <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 border-[3px] border-white dark:border-slate-800 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                                                <Camera className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Username</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500"
                                                    value={editUsername}
                                                    onChange={(e) => setEditUsername(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <input
                                                    type="email"
                                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100/50 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-3 items-center transition-colors">
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Check className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;