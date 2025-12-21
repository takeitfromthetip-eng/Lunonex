import React from 'react';
import './ProgressBar.css';

export function ProgressBar({ progress = 0, showPercentage = true, color = '#8b5cf6' }) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${clampedProgress}%`,
                        backgroundColor: color
                    }}
                >
                    {showPercentage && clampedProgress > 10 && (
                        <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
                    )}
                </div>
            </div>
            {showPercentage && clampedProgress <= 10 && (
                <span className="progress-percentage-external">{Math.round(clampedProgress)}%</span>
            )}
        </div>
    );
}

export function CircularProgress({ size = 40, strokeWidth = 4, progress = 0 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="circular-progress">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#8b5cf6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </svg>
    );
}
