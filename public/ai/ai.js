let derivWs;
let tickHistory = [];
let currentSymbol = "R_100";  // Default symbol
let tickCount = 120;          // Default tick count
let decimalPlaces = 2;

let digitChart, evenOddChart, riseFallChart;

// Function to start WebSocket
function startWebSocket() {
    if (derivWs) {
        derivWs.close();
    }

    derivWs = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=80058');

    derivWs.onopen = function () {
        requestTickHistory();
    };

    derivWs.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.history) {
            tickHistory = data.history.prices.map((price, index) => ({
                time: data.history.times[index],
                quote: parseFloat(price)
            }));

            detectDecimalPlaces();
            updateUI();
        } else if (data.tick) {
            let tickQuote = parseFloat(data.tick.quote);
            tickHistory.push({ time: data.tick.epoch, quote: tickQuote });

            if (tickHistory.length > tickCount) tickHistory.shift();

            updateUI();
        }
    };
}

// Function to request tick history
function requestTickHistory() {
    const request = {
        ticks_history: currentSymbol,
        count: tickCount,
        end: "latest",
        style: "ticks",
        subscribe: 1
    };
    derivWs.send(JSON.stringify(request));
}

// Function to update symbol
function updateSymbol(newSymbol) {
    currentSymbol = newSymbol;
    tickHistory = [];
    startWebSocket();
}

// Function to update tick count
function updateTickCount(newTickCount) {
    tickCount = newTickCount;
    tickHistory = [];
    startWebSocket();
}

// Add event listeners for symbol and tick count inputs
document.getElementById("symbol-select").addEventListener("change", function (event) {
    updateSymbol(event.target.value);
});

document.getElementById("tick-count-input").addEventListener("change", function (event) {
    const newTickCount = parseInt(event.target.value, 10);
    if (newTickCount > 0) {
        updateTickCount(newTickCount);
    } else {
        console.warn("⚠️ Tick count must be greater than 0.");
    }
});

// Function to detect the number of decimal places dynamically
function detectDecimalPlaces() {
    if (tickHistory.length === 0) return;

    let decimalCounts = tickHistory.map(tick => {
        let decimalPart = tick.quote.toString().split(".")[1] || "";
        return decimalPart.length;
    });

    decimalPlaces = Math.max(...decimalCounts, 2);
}

// Function to extract the last digit
function getLastDigit(price) {
    let priceStr = price.toString();
    let priceParts = priceStr.split(".");
    let decimals = priceParts[1] || "";

    while (decimals.length < decimalPlaces) {
        decimals += "0";
    }

    return Number(decimals.slice(-1));
}

// Function to update the UI
function updateUI() {
    const currentPriceElement = document.getElementById("current-price");
    if (tickHistory.length > 0) {
        const currentPrice = tickHistory[tickHistory.length - 1].quote.toFixed(decimalPlaces);
        currentPriceElement.textContent = `${currentPrice}`;
    } else {
        currentPriceElement.textContent = "N/A";
    }
    updateDigitDisplay();
    updateCharts();
    updateLast50OE();
}

// Function to update the digit display
function updateDigitDisplay() {
    const digitCounts = new Array(10).fill(0);
    tickHistory.forEach(tick => {
        const lastDigit = getLastDigit(tick.quote);
        digitCounts[lastDigit]++;
    });

    const digitPercentages = digitCounts.map(count => (count / tickHistory.length) * 100);
    const maxPercentage = Math.max(...digitPercentages);
    const minPercentage = Math.min(...digitPercentages);

    const currentDigit = tickHistory.length > 0 ? getLastDigit(tickHistory[tickHistory.length - 1].quote) : null;

    const digitDisplayContainer = document.getElementById("digit-display-container");
    digitDisplayContainer.innerHTML = ""; // Clear existing content

    digitPercentages.forEach((percentage, digit) => {
        const digitContainer = document.createElement("div");
        digitContainer.classList.add("digit-container");

        // Add the yellow arrow and apply the current class for the current digit
        if (digit === currentDigit) {
            digitContainer.classList.add("current");
            const arrow = document.createElement("div");
            arrow.classList.add("arrow");
            digitContainer.appendChild(arrow);
        }

        const digitBox = document.createElement("div");
        digitBox.classList.add("digit-box");

        // Apply the highest and lowest styles to only one digit each
        if (percentage === maxPercentage && digitPercentages.indexOf(maxPercentage) === digit) {
            digitBox.classList.add("highest");
        } else if (percentage === minPercentage && digitPercentages.indexOf(minPercentage) === digit) {
            digitBox.classList.add("lowest");
        }

        digitBox.textContent = digit;

        const percentageText = document.createElement("div");
        percentageText.classList.add("digit-percentage");
        percentageText.textContent = `${percentage.toFixed(2)}`;

        digitContainer.appendChild(digitBox);
        digitContainer.appendChild(percentageText);
        digitDisplayContainer.appendChild(digitContainer);
    });
}

// Function to initialize charts
function initializeCharts() {
    const ctxDigit = document.getElementById('digit-chart').getContext('2d');
    digitChart = new Chart(ctxDigit, {
        type: 'bar',
        data: {
            labels: Array.from({ length: 10 }, (_, i) => i.toString()),
            datasets: [{
                label: 'Digit Distribution (%)',
                data: Array(10).fill(0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: Array(10).fill('rgba(54, 162, 235, 1)'),
                borderWidth: 2,
                borderRadius: 10,
                barPercentage: 0.80, // Bars span full width
                categoryPercentage: 0.8 // No spacing between bars
            }]
        },
        options: {
            indexAxis: 'x', // Vertical bars
            plugins: {
                legend: { display: false }, // Hide legend
                tooltip: { enabled: true } // Enable tooltips
            },
            scales: {
                x: { display: true }, // Show x-axis
                y: { display: true }  // Show y-axis
            }
        }
    });

    const ctxEvenOdd = document.getElementById('even-odd-chart').getContext('2d');
    evenOddChart = new Chart(ctxEvenOdd, {
        type: 'bar',
        data: {
            labels: ['Even', 'Odd'],
            datasets: [{
                label: 'Even/Odd Distribution',
                data: [0, 0],
                backgroundColor: ['#8BEDA6', '#FF7F7F'],
                borderColor: ['#8BEDA6', '#FF7F7F'],
                borderWidth: 1,
                barPercentage: 0.9, // Bars span full width
                categoryPercentage: 0.9 // No spacing between bars
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            plugins: {
                legend: { display: false }, // Hide legend
                tooltip: { enabled: true } // Enable tooltips
            },
            scales: {
                x: { display: false }, // Hide x-axis
                y: { display: false }  // Hide y-axis
            }
        }
    });

    const ctxRiseFall = document.getElementById('rise-fall-chart').getContext('2d');
    riseFallChart = new Chart(ctxRiseFall, {
        type: 'bar',
        data: {
            labels: ['Rise', 'Fall'],
            datasets: [{
                label: 'Rise/Fall Distribution',
                data: [0, 0],
                backgroundColor: ['#8BEDA6', '#FF7F7F'],
                borderColor: ['#8BEDA6', '#FF7F7F'],
                borderWidth: 1,
                barPercentage: 0.9, // Bars span full width
                categoryPercentage: 0.9 // No spacing between bars
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            plugins: {
                legend: { display: false }, // Hide legend
                tooltip: { enabled: true } // Enable tooltips
            },
            scales: {
                x: { display: false }, // Hide x-axis
                y: { display: false }  // Hide y-axis
            }
        }
    });
}

// Function to update charts
function updateCharts() {
    const digitCounts = new Array(10).fill(0);
    tickHistory.forEach(tick => {
        const lastDigit = getLastDigit(tick.quote);
        digitCounts[lastDigit]++;
    });
    const digitPercentages = digitCounts.map(count => (count / tickHistory.length) * 100);

    // Update digit chart
    digitChart.data.datasets[0].data = digitPercentages;
    digitChart.update();

    // Display highest and lowest percentages
    const maxPercentage = Math.max(...digitPercentages).toFixed(2);
    const minPercentage = Math.min(...digitPercentages).toFixed(2);
    document.getElementById("digit-percentage").textContent = `Highest: ${maxPercentage}%, Lowest: ${minPercentage}%`;

    // Update even/odd chart
    const evenCount = digitCounts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const oddCount = digitCounts.filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0);
    const evenPercentage = ((evenCount / tickHistory.length) * 100).toFixed(2);
    const oddPercentage = ((oddCount / tickHistory.length) * 100).toFixed(2);

    evenOddChart.data.datasets[0].data = [evenPercentage, oddPercentage];
    evenOddChart.update();

    // Display even and odd percentages
    document.getElementById("even-odd-percentage").textContent = `Even: ${evenPercentage}%, Odd: ${oddPercentage}%`;

    // Update rise/fall chart
    let riseCount = 0, fallCount = 0;
    for (let i = 1; i < tickHistory.length; i++) {
        if (tickHistory[i].quote > tickHistory[i - 1].quote) riseCount++;
        else if (tickHistory[i].quote < tickHistory[i - 1].quote) fallCount++;
    }
    const risePercentage = ((riseCount / (tickHistory.length - 1)) * 100).toFixed(2);
    const fallPercentage = ((fallCount / (tickHistory.length - 1)) * 100).toFixed(2);

    riseFallChart.data.datasets[0].data = [risePercentage, fallPercentage];
    riseFallChart.update();

    // Display rise and fall percentages
    document.getElementById("rise-fall-percentage").textContent = `Rise: ${risePercentage}%, Fall: ${fallPercentage}%`;
}

// Function to update the last 50 digits as "E" (Even) or "O" (Odd)
function updateLast50OE() {
    const last50Digits = tickHistory.slice(-50).map(tick => getLastDigit(tick.quote));
    const oeValues = last50Digits.map(digit => ({
        value: digit % 2 === 0 ? "E" : "O",
        class: digit % 2 === 0 ? "even" : "odd"
    }));

    const last50OEContainer = document.getElementById("last-50-oe-container");
    last50OEContainer.innerHTML = ""; // Clear existing content

    oeValues.forEach(({ value, class: oeClass }) => {
        const oeBox = document.createElement("div");
        oeBox.classList.add("oe-box", oeClass);
        oeBox.textContent = value;
        last50OEContainer.appendChild(oeBox);
    });
}

// Start WebSocket on page load
startWebSocket();
initializeCharts();
