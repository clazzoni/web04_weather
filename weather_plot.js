// Default coordinates for Älta, Sweden

let currentLocation = {
    name: "Älta, Sweden",
    latitude: 59.26,
    longitude: 18.18
};

// API endpoint for MET Norway Locationforecast 2.0 (Compact format)
function getApiUrl() {
    return `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`;
}

// Get the canvas element from HTML
const ctx = document.getElementById('weatherChart').getContext('2d');
let weatherChart; // Variable to hold the chart instance

// --- Fetch Weather Data ---
async function getWeatherData(timeSpan = 48) {
    const apiUrl = getApiUrl();
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
        
        // Update location display
        document.getElementById('currentLocationDisplay').textContent = currentLocation.name;

    } catch (error) {
        console.error("Error fetching weather data:", error);
        // Display error message on the page (optional)
        const canvasContainer = document.querySelector('.chart-container');
        canvasContainer.innerHTML = `<p style="color: red;">Could not load weather data. Error: ${error.message}. Please check the console for more details.</p>`;
    }
}

// --- Helper: Get accurate sunrise/sunset times for a given date ---
function getSunTimes(date) {
    // Use SunCalc library to get accurate sunrise/sunset times based on location
    // If SunCalc is not available, fall back to simplified times
    if (typeof SunCalc !== 'undefined') {
        const sunTimes = SunCalc.getTimes(date, currentLocation.latitude, currentLocation.longitude);
        return { 
            sunrise: sunTimes.sunrise, 
            sunset: sunTimes.sunset,
            date: new Date(date)
        };
    } else {
        console.warn('SunCalc library not available. Using simplified sunrise/sunset times.');
        // Fallback to simplified times
        const sunrise = new Date(date);
        sunrise.setHours(6, 0, 0, 0);
        const sunset = new Date(date);
        sunset.setHours(18, 0, 0, 0);
        return { 
            sunrise, 
            sunset,
            date: new Date(date)
        };
    }
}

// --- Create a table showing sunrise/sunset times ---
function renderSunTimesTable(sunTimes) {
    // Check if the table container exists, if not create it
    let tableContainer = document.getElementById('sunTimesTableContainer');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.id = 'sunTimesTableContainer';
        tableContainer.style.width = '95%';
        tableContainer.style.margin = '20px auto';
        tableContainer.style.maxWidth = '1800px';
        
        // Insert after chart container
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer.nextSibling) {
            chartContainer.parentNode.insertBefore(tableContainer, chartContainer.nextSibling);
        } else {
            chartContainer.parentNode.appendChild(tableContainer);
        }
    }
    
    // Clear previous content
    tableContainer.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Sunrise and Sunset Times';
    heading.style.textAlign = 'center';
    tableContainer.appendChild(heading);
    
    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Date', 'Day', 'Sunrise', 'Sunset', 'Daylight Duration'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    sunTimes.forEach((times, index) => {
        const row = document.createElement('tr');
        
        // Style alternating rows
        if (index % 2 === 0) {
            row.style.backgroundColor = '#f9f9f9';
        }
        
        // Format date: YYYY-MM-DD
        const dateCell = document.createElement('td');
        const year = times.date.getFullYear();
        const month = String(times.date.getMonth() + 1).padStart(2, '0');
        const day = String(times.date.getDate()).padStart(2, '0');
        dateCell.textContent = `${year}-${month}-${day}`;
        dateCell.style.padding = '8px';
        dateCell.style.border = '1px solid #ddd';
        dateCell.style.textAlign = 'center';
        
        // Day name
        const dayCell = document.createElement('td');
        dayCell.textContent = times.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayCell.style.padding = '8px';
        dayCell.style.border = '1px solid #ddd';
        dayCell.style.textAlign = 'center';
        
        // Sunrise time
        const sunriseCell = document.createElement('td');
        sunriseCell.textContent = times.sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        sunriseCell.style.padding = '8px';
        sunriseCell.style.border = '1px solid #ddd';
        sunriseCell.style.textAlign = 'center';
        
        // Sunset time
        const sunsetCell = document.createElement('td');
        sunsetCell.textContent = times.sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        sunsetCell.style.padding = '8px';
        sunsetCell.style.border = '1px solid #ddd';
        sunsetCell.style.textAlign = 'center';
        
        // Daylight duration
        const daylightDuration = times.sunset - times.sunrise;
        const hours = Math.floor(daylightDuration / (1000 * 60 * 60));
        const minutes = Math.floor((daylightDuration % (1000 * 60 * 60)) / (1000 * 60));
        
        const durationCell = document.createElement('td');
        durationCell.textContent = `${hours}h ${minutes}m`;
        durationCell.style.padding = '8px';
        durationCell.style.border = '1px solid #ddd';
        durationCell.style.textAlign = 'center';
        
        // Add cells to row
        row.appendChild(dateCell);
        row.appendChild(dayCell);
        row.appendChild(sunriseCell);
        row.appendChild(sunsetCell);
        row.appendChild(durationCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

// --- Create a solar system diagram showing planetary positions ---
function renderSolarSystemDiagram() {
    // Check if the container exists, if not create it
    let solarSystemContainer = document.getElementById('solarSystemContainer');
    if (!solarSystemContainer) {
        solarSystemContainer = document.createElement('div');
        solarSystemContainer.id = 'solarSystemContainer';
        solarSystemContainer.style.width = '95%';
        solarSystemContainer.style.margin = '40px auto';
        solarSystemContainer.style.maxWidth = '1000px';
        solarSystemContainer.style.height = '500px';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Current Planetary Positions';
        heading.style.textAlign = 'center';
        solarSystemContainer.appendChild(heading);
        
        // Create canvas for the diagram
        const canvas = document.createElement('canvas');
        canvas.id = 'solarSystemCanvas';
        canvas.width = 1000;
        canvas.height = 500;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        solarSystemContainer.appendChild(canvas);
        
        // Add a time display
        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'planetaryTimeDisplay';
        timeDisplay.style.textAlign = 'center';
        timeDisplay.style.marginTop = '10px';
        timeDisplay.style.fontSize = '14px';
        solarSystemContainer.appendChild(timeDisplay);
        
        // Insert after the controls container (which contains Time Span dropdown and location input)
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.after(solarSystemContainer);
        } else {
            // Fallback to inserting after chart container
            const chartContainer = document.querySelector('.chart-container');
            chartContainer.after(solarSystemContainer);
        }
    }
    
    // Now draw the solar system
    drawSolarSystem();
}

// --- Calculate and draw the solar system ---
function drawSolarSystem() {
    const canvas = document.getElementById('solarSystemCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set current date
    const now = new Date();
    document.getElementById('planetaryTimeDisplay').textContent = 
        `Planetary positions for: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    // Draw Sun
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    
    // Draw orbit circles
    const orbits = [0.39, 0.72, 1, 1.52, 5.2, 9.58, 19.18, 30.07];
    const orbitLabels = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const orbitColors = ['gray', 'orange', 'blue', 'red', 'brown', 'goldenrod', 'lightblue', 'blue'];
    const scaleFactor = 50; // Adjust this to change the scale of the diagram
    
    // Draw orbits
    for (let i = 0; i < orbits.length; i++) {
        const radius = orbits[i] * scaleFactor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.stroke();
    }
    
    // Calculate planet positions
    // These are simplified calculations; in a real scenario, you would use more precise formulas
    const planetPositions = calculatePlanetPositions(now);
    
    // Draw planets
    for (let i = 0; i < orbits.length; i++) {
        const radius = orbits[i] * scaleFactor;
        const angle = planetPositions[i]; // Angle in radians
        
        // Calculate position
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Draw planet
        ctx.beginPath();
        ctx.arc(x, y, i === 4 || i === 5 ? 8 : 5, 0, Math.PI * 2); // Make Jupiter and Saturn larger
        ctx.fillStyle = orbitColors[i];
        ctx.fill();
        
        // Add label
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        
        // Position labels to avoid overlap with orbits
        const labelX = x + (i === 4 || i === 5 ? 10 : 7) * Math.cos(angle);
        const labelY = y + (i === 4 || i === 5 ? 10 : 7) * Math.sin(angle);
        
        ctx.fillText(orbitLabels[i], labelX, labelY);
    }
}

// --- Calculate simplified planet positions ---
function calculatePlanetPositions(date) {
    // Orbital periods in days
    const orbitalPeriods = [88, 225, 365.25, 687, 4333, 10759, 30687, 60190];
    
    // Reference epoch (J2000.0 - January 1, 2000, 12:00 UTC)
    const epoch = new Date(2000, 0, 1, 12, 0, 0, 0);
    
    // Calculate days since epoch
    const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate angles based on orbital periods (simplified)
    return orbitalPeriods.map(period => {
        // Convert to angle in radians (2π = full orbit)
        const angle = (daysSinceEpoch % period) / period * 2 * Math.PI;
        
        // Add some phase offset to make it look more realistic
        // These offsets are not astronomically accurate but make the diagram more interesting
        const offset = Math.random() * Math.PI; // Random offset between 0 and π
        return (angle + offset) % (2 * Math.PI);
    });
}

// --- Register Chart.js plugin to draw sun and moon markers ---
Chart.register({
    id: 'sunMoonMarker',
    afterDraw: function(chart, args, options) {
        const sunTimes = options.sunTimes;
        if (!sunTimes || sunTimes.length === 0) return;
        const xScale = chart.scales.x;
        const ctx = chart.ctx;
        ctx.save();
        // Use an emoji-supporting font with larger size to ensure visibility
        ctx.font = "24px Segoe UI Emoji";
        ctx.textAlign = "center";
        // Draw markers 10 pixels above the bottom of the x-axis
        sunTimes.forEach(function(times) {
            let sunrisePx = xScale.getPixelForValue(times.sunrise);
            let sunsetPx = xScale.getPixelForValue(times.sunset);
            ctx.fillStyle = "orange";
            ctx.fillText("☀", sunrisePx, xScale.bottom - 10);
            ctx.fillStyle = "gray";
            ctx.fillText("🌙", sunsetPx, xScale.bottom - 10);
        });
        ctx.restore();
    }
});

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
    const wind = [];   // Y-axis data (wind speed)

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
            
            // Get wind speed (usually in instant.details)
            if (entry.data?.instant?.details?.wind_speed !== undefined) {
                wind.push(entry.data.instant.details.wind_speed);
            } else {
                wind.push(null); // Handle missing data
            }
        }
    });

    console.log("Processed Labels:", labels);
    console.log("Processed Temps:", temps);
    console.log("Processed Rain:", rain);
    console.log("Processed Clouds:", clouds);
    console.log("Processed Wind:", wind);

    // Create sunrise/sunset markers only for shorter time spans (24h and 72h)
    let sunTimes = [];
    if (timeSpan <= 72) {
        const dayCount = Math.ceil(timeSpan / 24);
        for (let i = 0; i < dayCount; i++) {
            const dayDate = new Date(now);
            dayDate.setDate(now.getDate() + i);
            sunTimes.push(getSunTimes(dayDate));
        }
    }

    // Always generate sunTimes for the table, even if we don't show them on the graph
    let allSunTimes = [];
    const dayCount = Math.ceil(timeSpan / 24);
    for (let i = 0; i < dayCount; i++) {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() + i);
        allSunTimes.push(getSunTimes(dayDate));
    }

    // Create horizontal reference lines data arrays
    const tempLine0deg = labels.map(() => 0);  // 0°C reference line
    const tempLine10deg = labels.map(() => 10); // 10°C reference line
    const tempLine20deg = labels.map(() => 20); // 20°C reference line

    // --- Create the Chart using Chart.js ---
    if (weatherChart) {
        weatherChart.destroy(); // Destroy previous chart instance if exists
    }

    // Ensure the chart container is wide enough
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.width = '95%'; // Make the chart container use 95% of available width
        chartContainer.style.margin = '0 auto'; // Center the chart container
        chartContainer.style.maxWidth = '1800px'; // Set a reasonable maximum width
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
                    // Remove fixed borderColor to use dynamic colors
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    yAxisID: 'yTemp', // Assign to the temperature axis
                    tension: 0.1, // Makes the line slightly curved
                    pointRadius: 2,
                    borderWidth: 6, // Double thickness temperature line
                    order: 1, // Ensure line is drawn first
                    // Add a segment option to color line segments by temperature
                    segment: {
                        borderColor: function(context) {
                            const value = context.p1.parsed.y;
                            if (value === null || value === undefined) {
                                return 'rgba(0, 0, 0, 0.1)';
                            }
                            
                            // Convert temperature to color
                            // Blue for cold (-10C and below)
                            // Red for hot (25C and above)
                            // Rainbow scale between
                            
                            // Normalize temperature to a value between 0 and 1
                            const minTemp = -10;  // Coldest (blue)
                            const maxTemp = 25;   // Hottest (red)
                            let normalizedTemp = (value - minTemp) / (maxTemp - minTemp);
                            normalizedTemp = Math.min(Math.max(normalizedTemp, 0), 1); // Clamp between 0 and 1
                            
                            // Rainbow color scale function
                            function getTemperatureColor(t) {
                                // RGB values for rainbow spectrum
                                if (t <= 0.2) { // Blue to cyan (0.0 - 0.2)
                                    return `rgb(0, ${Math.round(255 * t * 5)}, 255)`;
                                } else if (t <= 0.4) { // Cyan to green (0.2 - 0.4)
                                    return `rgb(0, 255, ${Math.round(255 * (1 - (t - 0.2) * 5))})`;
                                } else if (t <= 0.6) { // Green to yellow (0.4 - 0.6)
                                    return `rgb(${Math.round(255 * (t - 0.4) * 5)}, 255, 0)`;
                                } else if (t <= 0.8) { // Yellow to orange (0.6 - 0.8)
                                    return `rgb(255, ${Math.round(255 * (1 - (t - 0.6) * 5))}, 0)`;
                                } else { // Orange to red (0.8 - 1.0)
                                    return `rgb(255, 0, 0)`;
                                }
                            }
                            
                            return getTemperatureColor(normalizedTemp);
                        }
                    }
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
                },
                // Add wind speed dataset
                {
                    label: 'Wind Speed (m/s)',
                    data: wind,
                    type: 'line',
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'yWind', // Assign to the wind axis
                    tension: 0.1,
                    pointRadius: 1,
                    borderWidth: 2,
                    borderDash: [],
                    order: 3 // Draw after temperature but before reference lines
                },
                // Reference Lines
                {
                    label: '0°C',
                    data: tempLine0deg,
                    type: 'line',
                    borderColor: 'rgba(0, 0, 255, 0.5)', // Blue
                    borderWidth: 1,
                    borderDash: [5, 5], // Dashed line
                    pointRadius: 0, // No points on the line
                    yAxisID: 'yTemp', // Use temperature axis
                    fill: false,
                    order: 4, // Draw behind other datasets
                    tension: 0,
                    borderJoinStyle: 'round'
                },
                {
                    label: '10°C',
                    data: tempLine10deg,
                    type: 'line',
                    borderColor: 'rgba(0, 175, 0, 0.5)', // Green
                    borderWidth: 1,
                    borderDash: [5, 5], // Dashed line
                    pointRadius: 0, // No points on the line
                    yAxisID: 'yTemp', // Use temperature axis
                    fill: false,
                    order: 4, // Draw behind other datasets
                    tension: 0,
                    borderJoinStyle: 'round'
                },
                {
                    label: '20°C',
                    data: tempLine20deg,
                    type: 'line',
                    borderColor: 'rgba(255, 165, 0, 0.5)', // Orange
                    borderWidth: 1,
                    borderDash: [5, 5], // Dashed line
                    pointRadius: 0, // No points on the line
                    yAxisID: 'yTemp', // Use temperature axis
                    fill: false,
                    order: 4, // Draw behind other datasets
                    tension: 0,
                    borderJoinStyle: 'round'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2.5, // Wider aspect ratio (default is 2)
            scales: {
                x: {
                    type: 'time', // Use time scale
                    time: {
                        unit: 'hour', // Display unit
                        tooltipFormat: 'YYYY-MM-DD HH:mm', // Format for tooltips
                        displayFormats: {
                            hour: 'HH:mm', // Format for hour labels
                            day: 'ddd' // Add day name format (Mon, Tue, Wed, etc.)
                        },
                        // For longer time periods, adjust unit to ensure day lines are visible
                        unitStepSize: 12, // Show tick every 12 hours instead of 6
                        bounds: 'ticks',
                        distribution: 'linear'
                    },
                    title: {
                        display: false, // Changed to false to remove the title
                    },
                    ticks: {
                        source: 'auto', // Changed from 'data' to use automatic tick generation
                        maxRotation: 0, // Prevent label rotation
                        autoSkip: true, // Allow skipping some ticks for better readability
                        autoSkipPadding: 20, // Add padding between ticks that are shown
                        includeBounds: true,
                        major: {
                            enabled: true, // Enable major ticks for midnight
                            font: {
                                weight: 'bold', // Make day names bold
                                size: 56 // Double the size from 28 to 56
                            }
                        },
                        callback: function(value, index, ticks) {
                            // Safety check
                            if (!value) return '';
                            
                            const date = new Date(value);
                            const hours = date.getHours();
                            
                            // Always show day names at midnight (in uppercase)
                            if (hours === 0) {
                                return date.toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase();
                            } 
                            
                            // For other hours, show time based on density
                            if (ticks.length > 48) {
                                // For longer periods, only show noon
                                return hours === 12 ? '12:00' : '';
                            }
                            
                            return date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
                        }
                    },
                    afterBuildTicks: function(scale) {
                        // Ensure midnight ticks are included regardless of time span
                        const ticks = scale.ticks;
                        const startDay = new Date(ticks[0].value);
                        startDay.setHours(0, 0, 0, 0); // Set to midnight
                        
                        const endDay = new Date(ticks[ticks.length - 1].value);
                        endDay.setHours(0, 0, 0, 0); // Set to midnight
                        
                        // Calculate number of days
                        const days = Math.ceil((endDay - startDay) / (24 * 60 * 60 * 1000)) + 1;
                        
                        // For each day, ensure we have a midnight tick
                        for (let i = 0; i < days; i++) {
                            const midnightDate = new Date(startDay);
                            midnightDate.setDate(startDay.getDate() + i);
                            
                            // Mark this date for a grid line
                            scale._midnightDates = scale._midnightDates || [];
                            scale._midnightDates.push(midnightDate.getTime());
                        }
                    },
                    grid: {
                        color: function(context) {
                            // Special handling for midnight lines to ensure they're visible
                            if (context.tick && context.tick.value) {
                                const date = new Date(context.tick.value);
                                const hours = date.getHours();
                                const minutes = date.getMinutes();
                                
                                // Make midnight grid lines significantly darker
                                if (hours === 0 && minutes === 0) {
                                    return 'rgba(0, 0, 0, 0.5)';
                                }
                            }
                            
                            // Check against our saved midnight dates
                            const scale = context.chart.scales.x;
                            if (scale._midnightDates && context.tick && 
                                scale._midnightDates.includes(context.tick.value)) {
                                return 'rgba(0, 0, 0, 0.5)';
                            }
                            
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            // Special handling for midnight lines to ensure they're visible
                            if (context.tick && context.tick.value) {
                                const date = new Date(context.tick.value);
                                const hours = date.getHours();
                                const minutes = date.getMinutes();
                                
                                // Make midnight grid lines thicker (now half as thick: 2px instead of 4px)
                                if (hours === 0 && minutes === 0) {
                                    return 2;
                                }
                            }
                            
                            // Check against our saved midnight dates
                            const scale = context.chart.scales.x;
                            if (scale._midnightDates && context.tick && 
                                scale._midnightDates.includes(context.tick.value)) {
                                return 2; // Also halving the thickness here to maintain consistency
                            }
                            
                            return 1;
                        }
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
                },
                // Add Y-axis for wind speed
                yWind: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)'
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for wind axis
                    },
                    ticks: {
                        beginAtZero: true // Wind starts at 0
                    },
                    suggestedMax: 15 // Adjust max wind value based on expected amounts
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index', // Show tooltips for all datasets at the same time index
                    intersect: false,
                },
                legend: {
                    position: 'top',
                },
                title: {
                    display: false, // Ensure no chart title is displayed
                },
                // Pass our calculated sunTimes to the plugin if available
                sunMoonMarker: { sunTimes: sunTimes }
            },
            interaction: { // Enhance interaction
                mode: 'index',
                intersect: false,
            }
        }
    });
    
    // First render the solar system diagram (below controls)
    renderSolarSystemDiagram();
    
    // Then render the sunrise/sunset times table (will appear below the diagram)
    renderSunTimesTable(allSunTimes);
}

// --- Geocode Location to Coordinates ---
async function geocodeLocation(locationName) {
    try {
        // Using OpenStreetMap's Nominatim service for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
        
        if (!response.ok) {
            throw new Error(`Geocoding error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Location not found. Please try a more specific name.');
        }
        
        // Use the first (most relevant) result
        const result = data[0];
        return {
            name: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        alert(`Error finding location: ${error.message}`);
        return null;
    }
}

// --- Create a container for dropdown and location input ---
function createControlsContainer() {
    // Create container for both controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-start'; // Changed from center to flex-start
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '20px';
    controlsContainer.style.marginTop = '15px';
    controlsContainer.style.flexWrap = 'wrap'; // Allow wrapping on small screens
    controlsContainer.style.paddingLeft = '10%'; // Add padding on the left
    
    // Add the container after the chart
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.after(controlsContainer);
    
    return controlsContainer;
}

// --- Create Time Span Dropdown ---
function createTimeSpanDropdown(parentContainer) {
    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'timespan-selector';
    dropdownContainer.style.textAlign = 'center';
    dropdownContainer.style.marginRight = '50px'; // Add extra margin to push it left
    
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
    
    // Add to parent container instead of directly after chart
    parentContainer.appendChild(dropdownContainer);
}

// --- Create Location Input Form ---
function createLocationForm(parentContainer) {
    const formContainer = document.createElement('div');
    formContainer.className = 'location-form';
    formContainer.style.textAlign = 'center';
    
    // Current location display
    const locationDisplay = document.createElement('div');
    locationDisplay.id = 'currentLocationDisplay';
    locationDisplay.textContent = currentLocation.name;
    locationDisplay.style.fontWeight = 'bold';
    locationDisplay.style.marginBottom = '10px';
    
    // Create form
    const form = document.createElement('form');
    form.id = 'locationForm';
    form.style.display = 'flex';
    form.style.justifyContent = 'center';
    form.style.gap = '10px';
    
    // Location input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'locationInput';
    input.placeholder = 'Enter city, country';
    input.required = true;
    
    // Submit button
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Update Location';
    
    // Assemble form
    form.appendChild(input);
    form.appendChild(button);
    
    // Add event listener
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const locationName = document.getElementById('locationInput').value.trim();
        
        if (locationName) {
            const newLocation = await geocodeLocation(locationName);
            if (newLocation) {
                currentLocation = newLocation;
                const timeSpan = parseInt(document.getElementById('timeSpanSelect').value);
                getWeatherData(timeSpan);
            }
        }
    });
    
    // Assemble container
    formContainer.appendChild(locationDisplay);
    formContainer.appendChild(form);
    
    // Add to parent container instead of after the timespan
    parentContainer.appendChild(formContainer);
}

// --- Handle Dropdown Change ---
function handleTimeSpanChange() {
    const timeSpan = parseInt(document.getElementById('timeSpanSelect').value);
    getWeatherData(timeSpan);
}

// --- Initialize the App ---
function initializeWeatherApp() {
    // Style the chart container to take up more space
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.width = '95%';
        chartContainer.style.margin = '0 auto';
        chartContainer.style.maxWidth = '1800px';
    }
    
    // Create a container for controls and add both elements to it
    const controlsContainer = createControlsContainer();
    createTimeSpanDropdown(controlsContainer);
    createLocationForm(controlsContainer);
    
    // Add script for SunCalc library if not already present
    if (typeof SunCalc === 'undefined') {
        const suncalcScript = document.createElement('script');
        suncalcScript.src = 'https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js';
        suncalcScript.async = true;
        document.head.appendChild(suncalcScript);
        
        // Wait for SunCalc to load before initializing
        suncalcScript.onload = function() {
            getWeatherData(48); // Default to 48 hours
        };
    } else {
        getWeatherData(48); // Default to 48 hours
    }
}

// --- Initial Load ---
initializeWeatherApp();