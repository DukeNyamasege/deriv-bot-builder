import React from 'react';
import './loading-screen.scss';

interface LoadingScreenProps {
    message?: string;
    progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    message = 'Loading Trading Bot Builder...', 
    progress 
}) => {
    return (
        <div className="loading-screen">
            <div className="loading-screen__container">
                <div className="loading-screen__logo">
                    <img src="/deriv-logo.png" alt="Deriv Bot Builder" />
                </div>
                
                <div className="loading-screen__content">
                    <h2>TICKSHARK</h2>
                    <p>{message}</p>
                    
                    <div className="loading-screen__progress">
                        <div className="loading-screen__progress-bar">
                            <div 
                                className="loading-screen__progress-fill"
                                style={{ width: progress ? `${progress}%` : '0%' }}
                            />
                        </div>
                        {progress && (
                            <span className="loading-screen__progress-text">
                                {Math.round(progress)}%
                            </span>
                        )}
                    </div>
                    
                    <div className="loading-screen__spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
