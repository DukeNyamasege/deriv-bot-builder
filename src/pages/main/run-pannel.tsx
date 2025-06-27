import React, { useState } from 'react';

const RunPanel = () => {
    const [stake, setStake] = useState(1);
    const [martingale, setMartingale] = useState(2);
    const [isRunning, setIsRunning] = useState(false);
    const [useSignals, setUseSignals] = useState(false); // Toggle for trading source

    const stopBotBuilderTrading = () => {
        console.log('Stopping bot builder trading');
        // TODO: Add logic to stop the bot builder's trading
        if (window.DBot && typeof window.DBot.stopBot === 'function') {
            window.DBot.stopBot();
        }
    };

    const handleRunClick = () => {
        if (!isRunning) {
            if (useSignals) {
                stopBotBuilderTrading(); // Ensure bot builder trading is stopped
                window.startTrading(stake, martingale); // Start trading from signals
            } else {
                console.log('Trading from bot builder logic');
                // TODO: Add logic to start trading from the bot builder
                if (window.DBot && typeof window.DBot.runBot === 'function') {
                    window.DBot.runBot();
                }
            }
            setIsRunning(true);
        } else {
            if (useSignals) {
                window.stopTrading(); // Stop trading from signals
            } else {
                stopBotBuilderTrading(); // Stop trading from bot builder
            }
            setIsRunning(false);
        }
    };

    const handleToggleChange = (e) => {
        const useSignalsToggle = e.target.checked;
        setUseSignals(useSignalsToggle);

        if (useSignalsToggle) {
            stopBotBuilderTrading(); // Stop bot builder trading immediately when toggled
        }
    };

    return (
        <div className="run-panel">
            <div className="settings">
                <label>
                    Stake:
                    <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                    />
                </label>
                <label>
                    Martingale Factor:
                    <input
                        type="number"
                        value={martingale}
                        onChange={(e) => setMartingale(Number(e.target.value))}
                    />
                </label>
                <label>
                    Use Signals:
                    <input
                        type="checkbox"
                        checked={useSignals}
                        onChange={handleToggleChange}
                    />
                </label>
            </div>
            <button onClick={handleRunClick}>
                {isRunning ? 'Stop' : 'Run'}
            </button>
        </div>
    );
};

export default RunPanel;
