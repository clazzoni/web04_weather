// Coordinates for Älta, Sweden (approximate)
const latitude = 59.26;
const longitude = 18.18;

// API endpoint for MET Norway Locationforecast 2.0 (Compact format)
const apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;

// Get the canvas element from HTML
const ctx = document.getElementById('weatherChart').getContext('2d');
let weatherChart; // Variable to hold the chart instance

// --- Fetch Weather Data ---
async function getWeatherData(timeSpan = 48) {
    console.log(`Fetching weather data from: ${apiUrl} for ${timeSpan} hours`);
    try {
        // IMPORTANT: MET Norway API requires a unique User-Agent header.
        // Replace 'YourAppName/1.0 yourcontact@example.com' with your actual app name/contact.
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'MyWeatherApp/0.1 contact@example.com'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Data Received:", data);
        processWeatherData(data, timeSpan);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        // Display error message on the page (optional)
        const canvasContainer = document.querySelector('.chart-container');
        canvasContainer.innerHTML = `<p style="color: red;">Could not load weather data. Error: ${error.message}. Please check the console for more details.</p>`;
    }
}

// --- Process Data and Create Chart ---
function processWeatherData(apiData, timeSpan = 48) {
    if (!apiData.properties || !apiData.properties.timeseries) {
        console.error("Invalid API data structure:", apiData);
        return;
    }

    const timeseries = apiData.properties.timeseries;

    // Use the provided timeSpan parameter instead of hardcoded 48 hours
    const now = new Date();
    const endTime = new Date(now.getTime() + timeSpan * 60 * 60 * 1000);

    const labels = []; // X-axis labels (time)
    const temps = [];  // Y-axis data (temperature)
    const rain = [];   // Y-axis data (precipitation)
    const clouds = []; // Y-axis data (cloud cover)

    timeseries.forEach(entry => {
        const time = new Date(entry.time);

        // Filter data for the desired time range
        if (time >= now && time <= endTime) {
            labels.push(time); // Use Date objects for time scale

            // Get temperature (usually in instant.details)
            if (entry.data?.instant?.details?.air_temperature !== undefined) {
                temps.push(entry.data.instant.details.air_temperature);
            } else {
                temps.push(null); // Handle missing data
            }

            // Get precipitation (usually in next_1_hours.details)
            if (entry.data?.next_1_hours?.details?.precipitation_amount !== undefined) {
                rain.push(entry.data.next_1_hours.details.precipitation_amount);
            } else {
                 // Check next_6_hours if 1-hour data is missing (API structure varies)
                 if (entry.data?.next_6_hours?.details?.precipitation_amount !== undefined) {
                    // Distribute 6-hour value over 1-hour intervals (approximate)
                    // For simplicity, assign 0 for now, or implement distribution logic
                    rain.push(0);
                 } else {
                     rain.push(0); // Assume 0 if no data for the hour
                 }
            }

            // Get cloud cover (usually in instant.details)
            if (entry.data?.instant?.details?.cloud_area_fraction !== undefined) {
                clouds.push(entry.data.instant.details.cloud_area_fraction);
            } else {
                clouds.push(null); // Handle missing data
            }
        }
    });

    console.log("Processed Labels:", labels);
    console.log("Processed Temps:", temps);
    console.log("Processed Rain:", rain);
    console.log("Processed Clouds:", clouds);


    // --- Create the Chart using Chart.js ---
    if (weatherChart) {
        weatherChart.destroy(); // Destroy previous chart instance if exists
    }

    weatherChart = new Chart(ctx, {
        type: 'bar', // Use bar type to accommodate rain bars
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temps,
                    type: 'line', // Override type for this dataset
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'yTemp', // Assign to the temperature axis
                    tension: 0.1, // Makes the line slightly curved
                    pointRadius: 1,
                    order: 1 // Ensure line is drawn first
                },
                {
                    label: 'Precipitation (mm/hr)',
                    data: rain,
                    type: 'bar', // Keep as bar type
                    backgroundColor: 'rgb(54, 162, 235)',
                    yAxisID: 'yRain', // Assign to the rain axis
                    order: 2 // Draw bars after the line
                },
                {
                    label: 'Cloud Cover (%)',
                    data: clouds,
                    type: 'line', // Plot cloud cover as a line
                    borderColor: 'rgb(160, 160, 160)',
                    backgroundColor: 'rgba(160, 160, 160, 0.2)',
                    yAxisID: 'yCloud', // Assign to the cloud axis
                    tension: 0.1,
                    pointRadius: 1,
                    fill: true, // Optional: fill area under cloud line
                    order: 0 // Draw cloud cover behind others
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time', // Use time scale
                    time: {
                        unit: 'hour', // Display unit
                        tooltipFormat: 'YYYY-MM-DD HH:mm', // Format for tooltips
                        displayFormats: {
                            hour: 'HH:mm' // Format for axis labels
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                // Define multiple Y axes
                yTemp: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawOnChartArea: true // Draw grid lines based on temperature axis
                    },
                    beginAtZero: false // Allow negative temperatures
                },
                yRain: {
                    type: 'linear',
                    position: 'right', // Place rain axis on the right
                    title: {
                        display: true,
                        text: 'Precipitation (mm)'
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for rain axis
                    },
                    ticks: {
                        beginAtZero: true // Rain starts at 0
                    },
                    suggestedMax: 5 // Adjust max rain value based on expected amounts
                },
                yCloud: {
                    type: 'linear',
                    position: 'right', // Can also be 'left' if preferred
                    title: {
                        display: true,
                        text: 'Cloud Cover (%)'
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for cloud axis
                    },
                    min: 0,
                    max: 100, // Cloud cover is 0-100%
                    display: true // Ensure this axis is shown
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index', // Show tooltips for all datasets at the same time index
                    intersect: false,
                },
                legend: {
                    position: 'top',
                }
            },
            interaction: { // Enhance interaction
                mode: 'index',
                intersect: false,
            }
        }
    });
}

// --- Create Time Span Dropdown ---
function createTimeSpanDropdown() {
    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'timespan-selector';
    dropdownContainer.style.marginTop = '15px';
    dropdownContainer.style.textAlign = 'center';
    
    // Create label
    const label = document.createElement('label');
    label.textContent = 'Time Span: ';
    label.setAttribute('for', 'timeSpanSelect');
    
    // Create select element
    const select = document.createElement('select');
    select.id = 'timeSpanSelect';
    
    // Add options
    const options = [
        { value: '24', text: '24 hours' },
        { value: '72', text: '72 hours' },
        { value: '168', text: '1 week (168h)' },
        { value: '240', text: '10 days (240h)' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        // Default to 48 hours to match original behavior
        if (opt.value === '48') {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    // Add event listener
    select.addEventListener('change', handleTimeSpanChange);
    
    // Assemble dropdown
    dropdownContainer.appendChild(label);
    dropdownContainer.appendChild(select);
    
    // Add after the chart container
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.after(dropdownContainer);
}

// --- Handle Dropdown Change ---
function handleTimeSpanChange() {
    const timeSpan = parseInt(document.getElementById('timeSpanSelect').value);
    getWeatherData(timeSpan);
}

// --- Initialize the App ---
function initializeWeatherApp() {
    createTimeSpanDropdown();
    getWeatherData(48); // Default to 48 hours
}

// --- Initial Load ---
initializeWeatherApp();