const ticksStorage = {
    R_10: [],
    R_25: [],
    R_50: [],
    R_75: [],
    R_100: []
};

let selectedMarket = null;
let isTrading = false;
let oauthToken = null;
let tradeHistory = [];

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=80058');

ws.onopen = () => {
    Object.keys(ticksStorage).forEach(subscribeTicks);
};

function subscribeTicks(symbol) {
    ws.send(JSON.stringify({
        ticks_history: symbol,
        count: 255,
        end: 'latest',
        style: 'ticks',
        subscribe: 1
    }));
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.history?.prices) {
        const symbol = data.echo_req.ticks_history;
        ticksStorage[symbol] = data.history.prices.map(parseFloat);
    } else if (data.tick) {
        const symbol = data.tick.symbol;
        ticksStorage[symbol].push(parseFloat(data.tick.quote));
        if (ticksStorage[symbol].length > 255) ticksStorage[symbol].shift();
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

        const { risePercentage, fallPercentage } = calculateTrendPercentage(symbol, 255);
        const isBuy = risePercentage > 57;
        const isSell = fallPercentage > 57;

        const rowRiseFall = document.createElement("tr");
        rowRiseFall.innerHTML = `<td>${symbol}</td><td>${isBuy ? "Rise" : "----"}</td><td>${isSell ? "Fall" : "----"}</td>`;
        rowRiseFall.addEventListener("click", () => selectMarket(symbol, rowRiseFall));
        if (symbol === selectedMarket) rowRiseFall.classList.add("selected");
        riseFallTable.appendChild(rowRiseFall);

        const digitCounts = new Array(10).fill(0);
        ticks.forEach(tick => {
            const lastDigit = parseInt(tick.toString().slice(-1));
            digitCounts[lastDigit]++;
        });

        const totalTicks = ticks.length;
        const digitPercentages = digitCounts.map(count => (count / totalTicks) * 100);
        const isOver = digitPercentages[7] < 10 && digitPercentages[8] < 10 && digitPercentages[9] < 10;
        const isUnder = digitPercentages[0] < 10 && digitPercentages[1] < 10 && digitPercentages[2] < 10;

        const rowOverUnder = document.createElement("tr");
        rowOverUnder.innerHTML = `<td>${symbol}</td><td>${isOver ? "Over 2" : "----"}</td><td>${isUnder ? "Under 7" : "----"}</td>`;
        rowOverUnder.addEventListener("click", () => selectMarket(symbol, rowOverUnder));
        if (symbol === selectedMarket) rowOverUnder.classList.add("selected");
        overUnderTable.appendChild(rowOverUnder);
    });
}

function calculateTrendPercentage(symbol, ticksCount) {
    const ticks = ticksStorage[symbol].slice(-ticksCount);
    if (ticks.length < 2) return { risePercentage: 0, fallPercentage: 0 };

    let riseCount = 0, fallCount = 0;
    for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] > ticks[i - 1]) riseCount++;
        else if (ticks[i] < ticks[i - 1]) fallCount++;
    }

    const total = riseCount + fallCount;
    return {
        risePercentage: total > 0 ? (riseCount / total) * 100 : 0,
        fallPercentage: total > 0 ? (fallCount / total) * 100 : 0
    };
}

function selectMarket(symbol, row) {
    if (selectedMarket === symbol) {
        selectedMarket = null;
        row.classList.remove("selected");
        document.getElementById("startButton").disabled = true;
    } else {
        selectedMarket = symbol;
        document.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
        row.classList.add("selected");
        document.getElementById("startButton").disabled = false;
    }
}

document.getElementById("oauthButton").addEventListener("click", () => {
    const authUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=1089&response_type=token&scope=read,trade`;
    window.open(authUrl, "_blank");
});

function setToken(token) {
    oauthToken = token;
    alert("Logged in successfully!");
    document.getElementById("startButton").disabled = false;
    fetchUserData();
}

async function fetchUserData() {
    const response = await fetch("https://ws.derivws.com/websockets/v3", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${oauthToken}`
        },
        body: JSON.stringify({ authorize: oauthToken })
    });

    const result = await response.json();
    if (result.authorize) {
        const { fullname, balance } = result.authorize;
        document.getElementById("userInfo").innerHTML = `Welcome, ${fullname}. Balance: $${balance}`;
    } else {
        console.error("Failed to fetch user data", result);
    }
}

document.getElementById("startButton").addEventListener("click", () => {
    if (!oauthToken) return alert("Please log in first.");
    if (!selectedMarket) return alert("Please select a market.");
    
    isTrading = true;
    document.getElementById("stopButton").disabled = false;
    trade();
});

document.getElementById("stopButton").addEventListener("click", () => {
    isTrading = false;
    document.getElementById("stopButton").disabled = true;
    alert("Trading stopped.");
});

async function trade() {
    if (!isTrading || !selectedMarket) return;

    const { risePercentage, fallPercentage } = calculateTrendPercentage(selectedMarket, 255);
    const isBuy = risePercentage > 57;
    const isSell = fallPercentage > 57;

    let tradeType = null;
    if (isBuy) tradeType = "CALL";
    if (isSell) tradeType = "PUT";

    if (!tradeType) {
        setTimeout(trade, 3000);
        return;
    }

    const tradeData = {
        buy: 1,
        price: 10,
        parameters: {
            amount: 10,
            basis: "stake",
            contract_type: tradeType,
            currency: "USD",
            duration: 1,
            duration_unit: "t",
            symbol: selectedMarket
        }
    };

    const response = await fetch("https://ws.derivws.com/websockets/v3", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${oauthToken}`
        },
        body: JSON.stringify(tradeData)
    });

    const result = await response.json();
    if (result.buy) {
        const contractId = result.buy.contract_id;
        trackTrade(contractId);
    } else {
        console.error("Trade failed", result);
        tradeHistory.unshift(`Trade failed: ${result.error?.message}`);
        updateTradeHistory();
    }
}

async function trackTrade(contractId) {
    if (!isTrading) return;

    const response = await fetch(`https://ws.derivws.com/websockets/v3?contract_id=${contractId}`);
    const result = await response.json();

    if (result.contract) {
        const tradeResult = result.contract.profit > 0 ? "Win" : "Loss";
        tradeHistory.unshift(`Trade on ${selectedMarket}: ${tradeResult} ($${result.contract.profit})`);
        updateTradeHistory();
    }

    setTimeout(trade, 3000);
}

function updateTradeHistory() {
    const tradeHistoryDiv = document.getElementById("tradeHistory");
    tradeHistoryDiv.innerHTML = tradeHistory.map(entry => `<p>${entry}</p>`).join("");
}

setInterval(updateTables, 1000);
