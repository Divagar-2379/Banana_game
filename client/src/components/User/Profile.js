import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Stats from './Stats';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="card">
            <h2>Player Profile</h2>

            <div className="profile-header">
                <div className="avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                    <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <Stats stats={user.stats} />
        </div>
    );
};

export default Profile;