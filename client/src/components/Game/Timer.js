import React from 'react';

const Timer = ({ timeLeft }) => {
    const getColor = () => {
        if (timeLeft > 30) return '#27ae60';
        if (timeLeft > 10) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <div className="timer" style={{ color: getColor() }}>
            ⏱️ {timeLeft}s
        </div>
    );
};

export default Timer;