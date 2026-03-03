import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>🍌 Welcome to Banana Hunt!</h1>
                <p className="subtitle">
                    Test your observation skills in this exciting number guessing game
                </p>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>🎯 Guess the Number</h3>
                        <p>Count the bananas in the image and enter your guess</p>
                    </div>
                    <div className="feature-card">
                        <h3>⏱️ Beat the Clock</h3>
                        <p>You have 60 seconds to make your guess</p>
                    </div>
                    <div className="feature-card">
                        <h3>🏆 Compete</h3>
                        <p>Track your scores and compete for the best streak</p>
                    </div>
                </div>

                <div className="cta-section">
                    {isAuthenticated ? (
                        <Link to="/play" className="btn btn-primary btn-large">
                            Start Playing
                        </Link>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-primary btn-large">
                                Login to Play
                            </Link>
                            <Link to="/register" className="btn btn-secondary btn-large">
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>

                <div className="tech-stack">
                    <h3>Built with MERN Stack</h3>
                    <div className="tech-badges">
                        <span className="badge">MongoDB</span>
                        <span className="badge">Express</span>
                        <span className="badge">React</span>
                        <span className="badge">Node.js</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;