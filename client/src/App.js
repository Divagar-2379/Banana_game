/**
 * Main App Component
 * Implements Event-Driven Programming through React's event system
 * Router handles navigation events
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Layout/Navbar';
import Home from './components/Layout/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import IntroVideo from './components/Layout/IntroVideo';
import Game from './components/Game/Game';
import Profile from './components/User/Profile';
import Leaderboards from './components/User/Leaderboards';
import Shop from './components/User/Shop';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
    const [showIntro, setShowIntro] = useState(false);

    useEffect(() => {
        // Check if intro has played this session
        const hasPlayed = sessionStorage.getItem('intro_played');
        if (!hasPlayed) {
            setShowIntro(true);
        }
    }, []);

    const handleIntroComplete = () => {
        setShowIntro(false);
        sessionStorage.setItem('intro_played', 'true');
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}>
        <AuthProvider>
            <Router>
                <div className="app relative">
                    {showIntro && <IntroVideo onComplete={handleIntroComplete} />}
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Protected routes - require authentication */}
                            <Route path="/play" element={
                                <PrivateRoute>
                                    <Game />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                            <Route path="/leaderboards" element={
                                <PrivateRoute>
                                    <Leaderboards />
                                </PrivateRoute>
                            } />
                            <Route path="/shop" element={
                                <PrivateRoute>
                                    <Shop />
                                </PrivateRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;