const ticksStorage = {
    R_10: [],
    R_25: [],
    R_50: [],
    R_75: [],
    R_100: []
};

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=80058');

const subscribeTicks = (symbol) => {
    ws.send(JSON.stringify({
        ticks_history: symbol,
        count: 255,
        end: 'latest',
        style: 'ticks',
        subscribe: 1
    }));
};

ws.onopen = () => {
    ['R_10', 'R_25', 'R_50', 'R_75', 'R_100'].forEach(subscribeTicks);
};

const calculateTrendPercentage = (symbol, ticksCount) => {
    const ticks = ticksStorage[symbol].slice(-ticksCount);
    if (ticks.length < 2) return { risePercentage: 0, fallPercentage: 0 };

    let riseCount = 0;
    let fallCount = 0;

    for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] > ticks[i - 1]) riseCount++;
        else if (ticks[i] < ticks[i - 1]) fallCount++;
    }

    const total = riseCount + fallCount;
    return {
        risePercentage: total > 0 ? (riseCount / total) * 100 : 0,
        fallPercentage: total > 0 ? (fallCount / total) * 100 : 0
    };
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.history && data.history.prices) {
        const symbol = data.echo_req.ticks_history;
        ticksStorage[symbol] = data.history.prices.map(price => parseFloat(price));
    } else if (data.tick) {
        const symbol = data.tick.symbol;
        ticksStorage[symbol].push(parseFloat(data.tick.quote));
        if (ticksStorage[symbol].length > 255) ticksStorage[symbol].shift();
    }
};

let isTrading = false;
let stake = 1; // Default stake
let martingaleFactor = 2; // Default martingale factor

const startTrading = (initialStake, martingale) => {
    isTrading = true;
    stake = initialStake;
    martingaleFactor = martingale;
    console.log('Trading started with stake:', stake, 'and martingale factor:', martingaleFactor);
};

const stopTrading = () => {
    isTrading = false;
    console.log('Trading stopped.');
};

const executeTrade = (symbol, action) => {
    if (!isTrading) return; // Ensure trading is active

    console.log(`Executing ${action} trade on ${symbol} with stake ${stake}`);
    // Simulate trade execution
    // TODO: Replace with actual trading API logic
    const tradeResult = Math.random() > 0.5 ? 'win' : 'loss';
    console.log(`Trade result: ${tradeResult}`);

    if (tradeResult === 'loss') {
        stake *= martingaleFactor; // Apply martingale
    } else {
        stake = 1; // Reset stake on win
    }
};

function updateTables() {
    const riseFallTable = document.getElementById("riseFallTable");
    const overUnderTable = document.getElementById("overUnderTable");

    riseFallTable.innerHTML = "";
    overUnderTable.innerHTML = "";

    Object.keys(ticksStorage).forEach(symbol => {
        const ticks = ticksStorage[symbol];
        if (ticks.length < 255) return;

        // Calculate rise/fall percentages for 255 and 55 ticks
        const { risePercentage: rise255, fallPercentage: fall255 } = calculateTrendPercentage(symbol, 255);
        const { risePercentage: rise55, fallPercentage: fall55 } = calculateTrendPercentage(symbol, 55);

        // Check if both conditions are met for a buy/sell signal
        const isBuy = rise255 > 57 && rise55 > 55;
        const isSell = fall255 > 57 && fall55 > 55;

        // Execute trades based on signals
        if (isTrading) { // Ensure trading is active
            if (isBuy) executeTrade(symbol, 'buy');
            if (isSell) executeTrade(symbol, 'sell');
        }

        // Define status classes for signals
        const riseClass = isBuy ? "rise" : "neutral";
        const fallClass = isSell ? "fall" : "neutral";

        // Generate rise/fall table row
        riseFallTable.innerHTML += `<tr>
            <td>Volatility ${symbol.replace("R_", "")} index</td>
            <td><span class="signal-box ${riseClass}">${isBuy ? "Rise" : "----"}</span></td>
            <td><span class="signal-box ${fallClass}">${isSell ? "Fall" : "----"}</span></td>
        </tr>`;

        // Last digit analysis
        const digitCounts = new Array(10).fill(0);
        ticks.forEach(tick => {
            const lastDigit = parseInt(tick.toString().slice(-1));
            digitCounts[lastDigit]++;
        });

        const totalTicks = ticks.length;
        const digitPercentages = digitCounts.map(count => (count / totalTicks) * 100);

        const overClass = digitPercentages[7] < 10 && digitPercentages[8] < 10 && digitPercentages[9] < 10 ? "over" : "neutral";
        const underClass = digitPercentages[0] < 10 && digitPercentages[1] < 10 && digitPercentages[2] < 10 ? "under" : "neutral";

        // Generate over/under table row
        overUnderTable.innerHTML += `<tr>
            <td>Volatility ${symbol.replace("R_", "")} index</td>
            <td><span class="signal-box ${overClass}">${overClass === "over" ? "Over 2" : "----"}</span></td>
            <td><span class="signal-box ${underClass}">${underClass === "under" ? "Under 7" : "----"}</span></td>
        </tr>`;
    });
}

setInterval(updateTables, 1000); // Update every second

// Expose startTrading and stopTrading globally
window.startTrading = (initialStake, martingale) => {
    isTrading = true;
    stake = initialStake;
    martingaleFactor = martingale;
    console.log('Trading started with stake:', stake, 'and martingale factor:', martingaleFactor);
};

window.stopTrading = () => {
    isTrading = false;
    console.log('Trading stopped.');
};
