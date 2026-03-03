import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">🍌 Banana Hunt</Link>
            </div>

            <div className="nav-links">
                {isAuthenticated ? (
                    <>
                        <span className="welcome-text">Welcome, {user?.username}!</span>
                        <Link to="/play" className="nav-link">Play Game</Link>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        <button onClick={handleLogout} className="btn btn-danger">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;