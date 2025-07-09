// Default coordinates for Älta, Sweden

let currentLocation = {
    name: "Älta, Sweden",
    latitude: 59.26,
    longitude: 18.18
};

// --- Weather Source ---
// Using MET Norway as the sole weather data provider
const weatherSource = { 
    name: 'MET Norway', 
    url: 'https://api.met.no/weatherapi/locationforecast/2.0/compact' 
};

// API endpoint for MET Norway Locationforecast 2.0 (Compact format)
function getApiUrl() {
    return `${weatherSource.url}?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`;
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
    heading.style.fontFamily = "'Roboto', sans-serif";
    tableContainer.appendChild(heading);
    
    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    table.style.fontFamily = "'Roboto', sans-serif";
    
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
// function renderSolarSystemDiagram() {
//     // Check if the container exists, if not create it
//     let solarSystemContainer = document.getElementById('solarSystemContainer');
//     if (!solarSystemContainer) {
//         solarSystemContainer = document.createElement('div');
//         solarSystemContainer.id = 'solarSystemContainer';
//         solarSystemContainer.style.width = '95%';
//         solarSystemContainer.style.margin = '40px auto';
//         solarSystemContainer.style.maxWidth = '1000px';
//         solarSystemContainer.style.height = '700px'; // Increased from 500px to 700px for more vertical space
        
//         // Create heading
//         const heading = document.createElement('h3');
//         heading.textContent = 'Current Planetary Positions';
//         heading.style.textAlign = 'center';
//         heading.style.fontFamily = "'Roboto', sans-serif";
//         solarSystemContainer.appendChild(heading);
        
//         // Create canvas for the diagram
//         const canvas = document.createElement('canvas');
//         canvas.id = 'solarSystemCanvas';
//         canvas.width = 1000;
//         canvas.height = 700; // Increased from 500px to 700px to match container
//         canvas.style.width = '100%';
//         canvas.style.height = '100%';
//         canvas.style.display = 'block';
//         canvas.style.margin = '0 auto';
//         solarSystemContainer.appendChild(canvas);
        
//         // Add a time display
//         const timeDisplay = document.createElement('div');
//         timeDisplay.id = 'planetaryTimeDisplay';
//         timeDisplay.style.textAlign = 'center';
//         timeDisplay.style.marginTop = '10px';
//         timeDisplay.style.fontSize = '14px';
//         timeDisplay.style.fontFamily = "'Roboto', sans-serif";
//         solarSystemContainer.appendChild(timeDisplay);
        
//         // Insert after the controls container (which contains Time Span dropdown and location input)
//         const controlsContainer = document.querySelector('.controls-container');
//         if (controlsContainer) {
//             controlsContainer.after(solarSystemContainer);
//         } else {
//             // Fallback to inserting after chart container
//             const chartContainer = document.querySelector('.chart-container');
//             chartContainer.after(solarSystemContainer);
//         }
//     }
    
//     // Now draw the solar system
//     drawSolarSystem();
// }

// --- Calculate and draw the solar system ---
// function drawSolarSystem() {
//     const canvas = document.getElementById('solarSystemCanvas');
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     const width = canvas.width;
//     const height = canvas.height;
//     const centerX = width / 2;
//     const centerY = height / 2;
    
//     // Clear canvas
//     ctx.clearRect(0, 0, width, height);
    
//     // Set current date
//     const now = new Date();
//     document.getElementById('planetaryTimeDisplay').textContent = 
//         `Planetary positions for: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
//     // Draw Sun
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
//     ctx.fillStyle = 'yellow';
//     ctx.fill();
    
//     // Draw orbit circles
//     const orbits = [0.39, 0.72, 1, 1.52, 5.2, 9.58, 19.18, 30.07];
//     const orbitLabels = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
//     const orbitColors = ['gray', 'orange', 'blue', 'red', 'brown', 'goldenrod', 'lightblue', 'blue'];
//     const scaleFactor = 35; // Reduced from 50 to 35 to fit all planets in the visible area
    
//     // Draw orbits
//     for (let i = 0; i < orbits.length; i++) {
//         const radius = orbits[i] * scaleFactor;
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//         ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
//         ctx.stroke();
//     }
    
//     // Calculate planet positions
//     // These are simplified calculations; in a real scenario, you would use more precise formulas
//     const planetPositions = calculatePlanetPositions(now);
    
//     // Draw planets
//     for (let i = 0; i < orbits.length; i++) {
//         const radius = orbits[i] * scaleFactor;
//         const angle = planetPositions[i]; // Angle in radians
        
//         // Calculate position
//         const x = centerX + radius * Math.cos(angle);
//         const y = centerY + radius * Math.sin(angle);
        
//         // Draw planet
//         ctx.beginPath();
//         ctx.arc(x, y, i === 4 || i === 5 ? 8 : 5, 0, Math.PI * 2); // Make Jupiter and Saturn larger
//         ctx.fillStyle = orbitColors[i];
//         ctx.fill();
        
//         // Add label
//         ctx.font = "12px 'Roboto', sans-serif";
//         ctx.fillStyle = 'black';
        
//         // Position labels to avoid overlap with orbits
//         const labelX = x + (i === 4 || i === 5 ? 10 : 7) * Math.cos(angle);
//         const labelY = y + (i === 4 || i === 5 ? 10 : 7) * Math.sin(angle);
        
//         ctx.fillText(orbitLabels[i], labelX, labelY);
//     }
// }

// --- Calculate more accurate planet positions ---
function calculatePlanetPositions(date) {
    // Orbital periods in days
    const orbitalPeriods = [88, 225, 365.25, 687, 4333, 10759, 30687, 60190];
    
    // Reference epoch (J2000.0 - January 1, 2000, 12:00 UTC)
    const epoch = new Date(2000, 0, 1, 12, 0, 0, 0);
    
    // Calculate days since epoch
    const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
    
    // Initial angles at epoch (in radians) - approximated values
    const initialAngles = [
        1.5, // Mercury - ~85 degrees
        4.9, // Venus - ~280 degrees
        1.8, // Earth - ~100 degrees
        0.3, // Mars - ~20 degrees
        0.6, // Jupiter - ~35 degrees
        5.9, // Saturn - ~340 degrees
        3.1, // Uranus - ~180 degrees
        4.2  // Neptune - ~240 degrees
    ];
    
    // Calculate angles based on orbital periods and initial positions
    return orbitalPeriods.map((period, index) => {
        // Convert to angle in radians (2π = full orbit)
        const angularVelocity = 2 * Math.PI / period;
        const angle = (initialAngles[index] + angularVelocity * daysSinceEpoch) % (2 * Math.PI);
        
        return angle;
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
        
        // Draw markers and time labels above them
        sunTimes.forEach(function(times) {
            let sunrisePx = xScale.getPixelForValue(times.sunrise);
            let sunsetPx = xScale.getPixelForValue(times.sunset);
            
            // Format sunrise/sunset times as HH:MM
            const sunriseTime = times.sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
            const sunsetTime = times.sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
            
            // Draw time labels above the icons
            ctx.font = "12px 'Roboto', sans-serif";
            ctx.textAlign = "center";
            
            // Position above the sun icon (25 pixels above the bottom of the x-axis)
            const labelY = xScale.bottom - 40;
            
            // Add white background for better visibility
            const sunriseWidth = ctx.measureText(sunriseTime).width;
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(sunrisePx - sunriseWidth/2 - 2, labelY - 10, sunriseWidth + 4, 14);
            
            // Draw sunrise time
            ctx.fillStyle = "#FF6600"; // Orange color for sunrise
            ctx.fillText(sunriseTime, sunrisePx, labelY);
            
            // Add background for sunset time
            const sunsetWidth = ctx.measureText(sunsetTime).width;
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(sunsetPx - sunsetWidth/2 - 2, labelY - 10, sunsetWidth + 4, 14);
            
            // Draw sunset time
            ctx.fillStyle = "#444444"; // Dark gray for sunset
            ctx.fillText(sunsetTime, sunsetPx, labelY);
            
            // Use Roboto font with emoji support for the sun/moon icons
            ctx.font = "24px 'Roboto', 'Segoe UI Emoji', sans-serif";
            
            // Draw the sun and moon icons
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

    // --- ULTRA-HIGH SAMPLING DENSITY ---
    // Use different sampling rates based on the timespan with even higher density
    let samplingIntervalMinutes;
    if (timeSpan <= 72) {
        samplingIntervalMinutes = 5; // 5 min sampling (six times higher than original 30 min)
    } else if (timeSpan <= 168) {
        samplingIntervalMinutes = 10; // 10 min sampling (six times higher than original 60 min)
    } else {
        samplingIntervalMinutes = 15; // 15 min sampling (six times higher than original 90 min)
    }
    
    console.log(`Using ultra-high sampling interval of ${samplingIntervalMinutes} minutes for ${timeSpan} hour graph`);

    const labels = []; // X-axis labels (time)
    const temps = [];  // Y-axis data (temperature)
    const rain = [];   // Y-axis data (precipitation)
    const clouds = []; // Y-axis data (cloud cover)
    const wind = [];   // Y-axis data (wind speed)

    // Create interpolation function
    function linearInterpolate(value1, value2, factor) {
        if (value1 === null || value2 === null) return null;
        return value1 + (value2 - value1) * factor;
    }

    // First collect raw data points
    const rawPoints = [];
    
    timeseries.forEach(entry => {
        const time = new Date(entry.time);
        if (time >= now && time <= endTime) {
            rawPoints.push({
                time: time,
                temp: entry.data?.instant?.details?.air_temperature,
                rain: entry.data?.next_1_hours?.details?.precipitation_amount || 0,
                cloud: entry.data?.instant?.details?.cloud_area_fraction,
                wind: entry.data?.instant?.details?.wind_speed
            });
        }
    });
    
    // Generate ultra-high-density data points through interpolation
    if (rawPoints.length > 1) {
        // Calculate how many points we need for the desired density
        const targetCount = Math.ceil((endTime - now) / (samplingIntervalMinutes * 60 * 1000));
        console.log(`Generating ${targetCount} data points (ultra-high density sampling)`);
        
        // Sort raw points by time to ensure proper interpolation
        rawPoints.sort((a, b) => a.time - b.time);
        
        // Pre-calculate time ranges for better performance with ultra-high density
        const timeRanges = [];
        for (let j = 0; j < rawPoints.length - 1; j++) {
            timeRanges.push({
                start: rawPoints[j].time.getTime(),
                end: rawPoints[j+1].time.getTime(),
                index: j
            });
        }
        
        for (let i = 0; i < targetCount; i++) {
            const targetTime = new Date(now.getTime() + i * samplingIntervalMinutes * 60 * 1000);
            const targetTimeMs = targetTime.getTime();
            
            // Find the raw data points surrounding our target time using optimized lookup
            let lowerIndex = -1;
            for (let j = 0; j < timeRanges.length; j++) {
                const range = timeRanges[j];
                if (range.start <= targetTimeMs && targetTimeMs <= range.end) {
                    lowerIndex = range.index;
                    break;
                }
            }
            
            if (lowerIndex >= 0) {
                // We found surrounding points, so interpolate between them
                const lowerPoint = rawPoints[lowerIndex];
                const upperPoint = rawPoints[lowerIndex + 1];
                const totalTimeDiff = upperPoint.time - lowerPoint.time;
                const currentTimeDiff = targetTime - lowerPoint.time;
                const factor = currentTimeDiff / totalTimeDiff;
                
                labels.push(targetTime);
                temps.push(linearInterpolate(lowerPoint.temp, upperPoint.temp, factor));
                // For precipitation, use the nearest value instead of interpolating
                rain.push(targetTime - lowerPoint.time < upperPoint.time - targetTime ? 
                          lowerPoint.rain : upperPoint.rain);
                clouds.push(linearInterpolate(lowerPoint.cloud, upperPoint.cloud, factor));
                wind.push(linearInterpolate(lowerPoint.wind, upperPoint.wind, factor));
            }
        }
    } else {
        // Fallback to direct sampling if we don't have enough raw points
        console.log("Falling back to direct sampling - not enough raw data points for interpolation");
        
        let lastSampleTime = null;
        timeseries.forEach(entry => {
            const time = new Date(entry.time);
            if (time >= now && time <= endTime) {
                if (!lastSampleTime || (time - lastSampleTime) >= samplingIntervalMinutes * 60 * 1000) {
                    labels.push(time);
                    temps.push(entry.data?.instant?.details?.air_temperature ?? null);
                    rain.push(entry.data?.next_1_hours?.details?.precipitation_amount || 0);
                    clouds.push(entry.data?.instant?.details?.cloud_area_fraction ?? null);
                    wind.push(entry.data?.instant?.details?.wind_speed ?? null);
                    lastSampleTime = time;
                }
            }
        });
    }

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
            font: {
                family: "'Roboto', sans-serif" // Set default font family for all text
            },
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
                        // Adaptive step size based on timespan
                        unitStepSize: timeSpan <= 72 ? 6 : (timeSpan <= 168 ? 12 : 24),
                        bounds: 'ticks',
                        distribution: 'linear'
                    },
                    title: {
                        display: false // Changed to false to remove the title
                    },
                    ticks: {
                        source: 'auto', // Changed from 'data' to use automatic tick generation
                        maxRotation: 0, // Prevent label rotation
                        autoSkip: true, // Allow skipping some ticks for better readability
                        autoSkipPadding: 20, // Add padding between ticks that are shown
                        includeBounds: true,
                        font: {
                            family: "'Roboto', sans-serif" // Set font for x-axis ticks
                        },
                        major: {
                            enabled: true, // Enable major ticks for midnight
                            font: {
                                family: "'Roboto', sans-serif",
                                weight: 'bold', // Make day names bold
                                size: 56 // Double the size from 28 to 56
                            }
                        },
                        callback: function(value, index, ticks) {
                            // Safety check
                            if (!value) return '';
                            
                            const date = new Date(value);
                            const hours = date.getHours();
                            
                            // Always show day names at midnight (in uppercase and bold)
                            if (hours === 0) {
                                // Add the date to make each day fully identifiable
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'short', 
                                    day: 'numeric'
                                }).toUpperCase();
                            } 
                            
                            // For other hours, show time based on density
                            if (ticks.length > 48) {
                                // For longer periods, only show every 6 hours
                                return hours % 6 === 0 ? 
                                    date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false}) : '';
                            }
                            
                            return date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
                        }
                    },
                    afterBuildTicks: function(scale) {
                        const ticks = scale.ticks;

                        // Find the first day in our data range
                        const startDay = new Date(ticks[0].value);
                        startDay.setHours(0, 0, 0, 0); // Set to midnight

                        const endDay = new Date(ticks[ticks.length - 1].value);
                        endDay.setHours(0, 0, 0, 0); // Set to midnight

                        // Calculate number of days
                        const dayDiff = Math.ceil((endDay - startDay) / (24 * 60 * 60 * 1000));

                        // Clear any existing midnight dates
                        scale._midnightDates = [];

                        // For each day, add a midnight marker
                        for (let i = 0; i <= dayDiff; i++) {
                            const midnightDate = new Date(startDay);
                            midnightDate.setDate(startDay.getDate() + i);

                            // Only add if it's within our time range
                            if (midnightDate >= new Date(ticks[0].value) && 
                                midnightDate <= new Date(ticks[ticks.length - 1].value)) {
                                scale._midnightDates.push(midnightDate.getTime());
                            }
                        }
                    },
                    grid: {
                        color: function(context) {
                            const scale = context.chart.scales.x;
                            if (scale._midnightDates && context.tick && 
                                scale._midnightDates.includes(context.tick.value)) {
                                return 'rgba(0, 0, 0, 0.7)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            const scale = context.chart.scales.x;
                            if (scale._midnightDates && context.tick && 
                                scale._midnightDates.includes(context.tick.value)) {
                                return 3;
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
                        text: 'Temperature (°C)',
                        font: {
                            family: "'Roboto', sans-serif" // Set font for axis title
                        }
                    },
                    grid: {
                        drawOnChartArea: true // Draw grid lines based on temperature axis
                    },
                    beginAtZero: false, // Allow negative temperatures
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif" // Set font for temperature axis
                        }
                    }
                },
                yRain: {
                    type: 'linear',
                    position: 'right', // Place rain axis on the right
                    title: {
                        display: true,
                        text: 'Precipitation (mm)',
                        font: {
                            family: "'Roboto', sans-serif" // Set font for axis title
                        }
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for rain axis
                    },
                    ticks: {
                        beginAtZero: true, // Rain starts at 0
                        font: {
                            family: "'Roboto', sans-serif" // Set font for rain axis
                        }
                    },
                    suggestedMax: 5 // Adjust max rain value based on expected amounts
                },
                yCloud: {
                    type: 'linear',
                    position: 'right', // Can also be 'left' if preferred
                    title: {
                        display: true,
                        text: 'Cloud Cover (%)',
                        font: {
                            family: "'Roboto', sans-serif" // Set font for axis title
                        }
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for cloud axis
                    },
                    min: 0,
                    max: 100, // Cloud cover is 0-100%
                    display: true, // Ensure this axis is shown
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif" // Set font for cloud axis
                        }
                    }
                },
                // Add Y-axis for wind speed
                yWind: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)',
                        font: {
                            family: "'Roboto', sans-serif" // Set font for axis title
                        }
                    },
                    grid: {
                        drawOnChartArea: false // Don't draw grid for wind axis
                    },
                    ticks: {
                        beginAtZero: true, // Wind starts at 0
                        font: {
                            family: "'Roboto', sans-serif" // Set font for wind axis
                        }
                    },
                    suggestedMax: 15 // Adjust max wind value based on expected amounts
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index', // Show tooltips for all datasets at the same time index
                    intersect: false,
                    titleFont: {
                        family: "'Roboto', sans-serif"
                    },
                    bodyFont: {
                        family: "'Roboto', sans-serif"
                    },
                    footerFont: {
                        family: "'Roboto', sans-serif"
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Roboto', sans-serif" // Set font for legend labels
                        }
                    }
                },
                title: {
                    display: false // Ensure no chart title is displayed
                },
                // Pass our calculated sunTimes to the plugin if available
                sunMoonMarker: { 
                    sunTimes: sunTimes 
                }
            },
            interaction: { // Enhance interaction
                mode: 'index',
                intersect: false
            }
        }
    });
    
    // First render the solar system diagram (below controls)
    // renderSolarSystemDiagram();
    
    // Then render the sunrise/sunset times table (will appear below the diagram)
    renderSunTimesTable(allSunTimes);
    
    // Finally, render the data table showing all graph data
    renderDataTable(labels, temps, rain, clouds, wind);
}

// --- Create a data table showing all graph data ---
function renderDataTable(labels, temps, rain, clouds, wind) {
    // Check if the table container exists, if not create it
    let dataTableContainer = document.getElementById('dataTableContainer');
    if (!dataTableContainer) {
        // Create a separator first
        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.margin = '60px 0 20px 0';
        separator.style.borderTop = '2px solid #ccc';
        document.body.appendChild(separator);
        
        // Create the data table container
        dataTableContainer = document.createElement('div');
        dataTableContainer.id = 'dataTableContainer';
        dataTableContainer.style.width = '95%';
        dataTableContainer.style.margin = '30px auto';
        dataTableContainer.style.maxWidth = '1800px';
        dataTableContainer.style.overflowX = 'auto'; // Add horizontal scroll for small screens
        
        // Insert at the very bottom of the page
        document.body.appendChild(dataTableContainer);
    }
    
    // Clear previous content
    dataTableContainer.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h2');
    heading.textContent = 'Weather Data Details';
    heading.style.textAlign = 'center';
    heading.style.fontFamily = "'Roboto', sans-serif";
    heading.style.marginBottom = '10px';
    heading.style.marginTop = '40px';
    heading.style.paddingTop = '20px';
    dataTableContainer.appendChild(heading);
    
    // Add explanatory text
    const explanation = document.createElement('p');
    explanation.textContent = 'The table below shows the complete numerical weather data displayed in the graph above. You can download the full dataset as a CSV file using the button at the bottom of the table.';
    explanation.style.textAlign = 'center';
    explanation.style.fontFamily = "'Roboto', sans-serif";
    explanation.style.marginBottom = '20px';
    explanation.style.color = '#555';
    dataTableContainer.appendChild(explanation);
    
    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = "'Roboto', sans-serif";
    table.style.fontSize = '14px';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Time', 'Date', 'Temperature (°C)', 'Precipitation (mm/hr)', 'Cloud Cover (%)', 'Wind Speed (m/s)'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.border = '1px solid #ddd';
        th.style.position = 'sticky';
        th.style.top = '0';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Limit to max 500 rows to prevent performance issues
    const maxRows = Math.min(labels.length, 500);
    
    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');
        
        // Style alternating rows
        if (i % 2 === 0) {
            row.style.backgroundColor = '#f9f9f9';
        }
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = new Date(labels[i]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
        timeCell.style.padding = '6px';
        timeCell.style.border = '1px solid #ddd';
        timeCell.style.textAlign = 'center';
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(labels[i]).toLocaleDateString();
        dateCell.style.padding = '6px';
        dateCell.style.border = '1px solid #ddd';
        dateCell.style.textAlign = 'center';
        
        // Temperature column
        const tempCell = document.createElement('td');
        tempCell.textContent = temps[i] !== null ? temps[i].toFixed(1) : 'N/A';
        tempCell.style.padding = '6px';
        tempCell.style.border = '1px solid #ddd';
        tempCell.style.textAlign = 'center';
        
        // Precipitation column
        const rainCell = document.createElement('td');
        rainCell.textContent = rain[i] !== null ? rain[i].toFixed(1) : '0.0';
        rainCell.style.padding = '6px';
        rainCell.style.border = '1px solid #ddd';
        rainCell.style.textAlign = 'center';
        
        // Cloud cover column
        const cloudCell = document.createElement('td');
        cloudCell.textContent = clouds[i] !== null ? clouds[i].toFixed(0) : 'N/A';
        cloudCell.style.padding = '6px';
        cloudCell.style.border = '1px solid #ddd';
        cloudCell.style.textAlign = 'center';
        
        // Wind speed column
        const windCell = document.createElement('td');
        windCell.textContent = wind[i] !== null ? wind[i].toFixed(1) : 'N/A';
        windCell.style.padding = '6px';
        windCell.style.border = '1px solid #ddd';
        windCell.style.textAlign = 'center';
        
        // Add cells to row
        row.appendChild(timeCell);
        row.appendChild(dateCell);
        row.appendChild(tempCell);
        row.appendChild(rainCell);
        row.appendChild(cloudCell);
        row.appendChild(windCell);
        
        tbody.appendChild(row);
    }
    
    // Add a message if data was limited
    if (labels.length > maxRows) {
        const infoRow = document.createElement('tr');
        const infoCell = document.createElement('td');
        infoCell.colSpan = 6;
        infoCell.textContent = `Showing ${maxRows} of ${labels.length} data points to maintain performance.`;
        infoCell.style.padding = '8px';
        infoCell.style.textAlign = 'center';
        infoCell.style.fontStyle = 'italic';
        infoCell.style.backgroundColor = '#f2f2f2';
        infoRow.appendChild(infoCell);
        tbody.appendChild(infoRow);
    }
    
    table.appendChild(tbody);
    dataTableContainer.appendChild(table);
    
    // Add a download link for the full data
    const downloadContainer = document.createElement('div');
    downloadContainer.style.textAlign = 'center';
    downloadContainer.style.marginTop = '15px';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Full Data (CSV)';
    downloadBtn.style.padding = '8px 16px';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.backgroundColor = '#4CAF50';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '4px';
    downloadBtn.style.fontFamily = "'Roboto', sans-serif";
    
    downloadBtn.addEventListener('click', function() {
        // Create CSV content
        let csvContent = 'Time,Date,Temperature (°C),Precipitation (mm/hr),Cloud Cover (%),Wind Speed (m/s)\n';
        
        for (let i = 0; i < labels.length; i++) {
            const date = new Date(labels[i]);
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
            const dateStr = date.toLocaleDateString();
            const tempStr = temps[i] !== null ? temps[i].toFixed(1) : 'N/A';
            const rainStr = rain[i] !== null ? rain[i].toFixed(1) : '0.0';
            const cloudStr = clouds[i] !== null ? clouds[i].toFixed(0) : 'N/A';
            const windStr = wind[i] !== null ? wind[i].toFixed(1) : 'N/A';
            
            csvContent += `${timeStr},${dateStr},${tempStr},${rainStr},${cloudStr},${windStr}\n`;
        }
        
        // Create a download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `weather_data_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Add a "Back to Top" button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.textContent = 'Back to Top';
    backToTopBtn.style.marginLeft = '15px';
    backToTopBtn.style.padding = '8px 16px';
    backToTopBtn.style.cursor = 'pointer';
    backToTopBtn.style.backgroundColor = '#2196F3';
    backToTopBtn.style.color = 'white';
    backToTopBtn.style.border = 'none';
    backToTopBtn.style.borderRadius = '4px';
    backToTopBtn.style.fontFamily = "'Roboto', sans-serif";
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    downloadContainer.appendChild(downloadBtn);
    downloadContainer.appendChild(backToTopBtn);
    dataTableContainer.appendChild(downloadContainer);
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

// --- Display Weather Source Info ---
function displayWeatherSource() {
    const sourceContainer = document.getElementById('weatherSourceContainer');
    if (!sourceContainer) {
        const container = document.createElement('div');
        container.id = 'weatherSourceContainer';
        container.style.textAlign = 'center';
        container.style.marginTop = '20px';
        container.style.fontFamily = "'Roboto', sans-serif";
        container.style.fontSize = '14px';
        container.innerHTML = `<p>Weather data provided by <strong>${weatherSource.name}</strong></p>`;

        const chartContainer = document.querySelector('.chart-container');
        chartContainer.after(container);
    } else {
        sourceContainer.innerHTML = `<p>Weather data provided by <strong>${weatherSource.name}</strong></p>`;
    }
}

// --- Handle Dropdown Change ---
function handleTimeSpanChange() {
    const timeSpan = parseInt(document.getElementById('timeSpanSelect').value);
    getWeatherData(timeSpan);
}

// --- Initialize the App ---
function initializeWeatherApp() {
    // Add Roboto font to the page
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Apply Roboto font to the entire page
    document.body.style.fontFamily = 'Roboto, sans-serif';
    
    // Add URL text as a clickable hyperlink at the very top of the page
    const urlHeader = document.createElement('div');
    urlHeader.style.textAlign = 'left';
    urlHeader.style.padding = '10px';
    urlHeader.style.backgroundColor = '#f8f9fa';
    urlHeader.style.marginBottom = '15px';
    urlHeader.style.paddingLeft = '20px';
    
    // Create hyperlink element
    const link = document.createElement('a');
    link.href = 'https://bit.ly/jcweather';
    link.textContent = 'https://bit.ly/jcweather';
    link.style.fontWeight = 'bold';
    link.style.fontSize = '18px';
    link.style.color = '#0066cc';
    link.style.textDecoration = 'none';
    
    // Add hover effect
    link.addEventListener('mouseover', function() {
        link.style.textDecoration = 'underline';
    });
    
    link.addEventListener('mouseout', function() {
        link.style.textDecoration = 'none';
    });
    
    urlHeader.appendChild(link);
    
    // Insert at the beginning of the body or before the chart container
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer && chartContainer.parentNode) {
        chartContainer.parentNode.insertBefore(urlHeader, chartContainer);
    } else {
        document.body.insertBefore(urlHeader, document.body.firstChild);
    }
    
    // Style the chart container to take up more space
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

    displayWeatherSource();
}

// --- Initial Load ---
initializeWeatherApp();
