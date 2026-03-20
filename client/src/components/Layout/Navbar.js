import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Gamepad2, Menu, X, Command } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password') {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = isAuthenticated ? [
        { label: 'Dashboard', path: '/play', icon: Gamepad2 },
        { label: 'Settings', path: '/profile', icon: User },
    ] : [
        { label: 'Sign In', path: '/login' },
        { label: 'Get Started', path: '/register', isButton: true },
    ];

    const getAvatarSrc = (avatar) => {
        if (!avatar || avatar === 'default-avatar.png') return null;
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:5005/uploads/${avatar}`;
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100 dark:border-slate-800 shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-shrink-0 flex items-center"
                    >
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white group-hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20">
                                <Command className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Banana Hunt
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link key={item.path} to={item.path}>
                                    {item.isButton ? (
                                        <button className="btn-gradient ml-4">
                                            {item.label}
                                        </button>
                                    ) : (
                                        <button
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${location.pathname === item.path
                                                ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            {item.label}
                                        </button>
                                    )}
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition ml-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden border-b border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated && (
                                <div className="px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    {getAvatarSrc(user?.avatar) ? (
                                        <img src={getAvatarSrc(user.avatar)} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-indigo-200" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-slate-900 dark:text-white">{user?.username}</span>
                                </div>
                            )}
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${location.pathname === item.path
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    {item.label}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;