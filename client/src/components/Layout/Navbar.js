import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, Gamepad2, Banana, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = isAuthenticated ? [
        { label: 'Play Game', path: '/play', icon: Gamepad2 },
        { label: 'Profile', path: '/profile', icon: User },
    ] : [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-shrink-0 flex items-center"
                    >
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="p-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl shadow-lg group-hover:shadow-yellow-400/50 transition duration-300">
                                <Banana className="w-6 h-6 text-yellow-900" />
                            </span>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight ml-1">
                                Banana Hunt
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated && (
                            <motion.span
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-sm font-medium text-slate-500 mr-4"
                            >
                                Welcome, <span className="text-indigo-600 font-bold">{user?.username}</span>!
                            </motion.span>
                        )}
                        <div className="flex items-center space-x-2">
                            {navItems.map((item) => (
                                <Link key={item.path} to={item.path}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        {item.icon && <item.icon className="w-4 h-4" />}
                                        {item.label}
                                    </motion.button>
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden border-t border-slate-100 bg-white"
                >
                    <div className="px-4 py-6 space-y-4">
                        {isAuthenticated && (
                            <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 font-medium">
                                Welcome, {user?.username}
                            </div>
                        )}
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${location.pathname === item.path
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                {item.label}
                            </Link>
                        ))}
                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;