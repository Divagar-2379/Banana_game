import React from 'react';

const Stats = ({ stats }) => {
    const statItems = [
        { label: 'Games Played', value: stats?.gamesPlayed || 0, icon: '🎮' },
        { label: 'Games Won', value: stats?.gamesWon || 0, icon: '🏆' },
        {
            label: 'Win Rate', value: stats?.gamesPlayed ?
                `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%',
            icon: '📊'
        },
        { label: 'Total Score', value: stats?.totalScore || 0, icon: '⭐' },
        { label: 'Current Streak', value: stats?.currentStreak || 0, icon: '🔥' },
        { label: 'Best Streak', value: stats?.bestStreak || 0, icon: '👑' }
    ];

    return (
        <div className="stats-container">
            <h3>Your Statistics</h3>
            <div className="stats-grid">
                {statItems.map((item, index) => (
                    <div key={index} className="stat-box">
                        <div className="stat-icon">{item.icon}</div>
                        <div className="stat-value">{item.value}</div>
                        <div className="stat-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stats;