const API_BASE_URL = 'https://countriesnow.space/api/v0.1/countries';
const WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive';
const CSV_PATH = 'ufo-sightings-transformed.csv';

// DOM Elements
const dateFilter = document.getElementById('date-filter');
const countrySelect = document.getElementById('country-filter');
const regionSelect = document.getElementById('region-filter');
const localeSelect = document.getElementById('locale-filter');
const applyButton = document.getElementById('apply-filters');

// Data storage
let ufoData = [];
let map = null;
let weatherChart = null;
let tempChart = null;
let windChart = null;
let currentDisplayCount = 0;
let currentFilteredData = [];

// Max API calls to avoid overloading
const MAX_WEATHER_CALLS = 50;
const MAX_DISPLAY_RESULTS = 50;
const RESULTS_PER_PAGE = 20;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadCSVData();
    loadCountries();
    setupEventListeners();
    updateApplyButtonState();
});

// Setup event listeners
function setupEventListeners() {
    dateFilter.addEventListener('change', updateApplyButtonState);
    countrySelect.addEventListener('change', handleCountryChange);
    regionSelect.addEventListener('change', handleRegionChange);
    localeSelect.addEventListener('change', updateApplyButtonState);
    applyButton.addEventListener('click', handleApplyFilters);
}

// Update apply button state based on filter selections
function updateApplyButtonState() {
    // Enable button if at least date OR country is selected
    const hasDateOrCountry = dateFilter.value || countrySelect.value;
    applyButton.disabled = !hasDateOrCountry;
}

// Load and parse CSV data
async function loadCSVData() {
    try {
        const response = await fetch(CSV_PATH);
        const csvText = await response.text();
        ufoData = parseCSV(csvText);
        console.log(`Loaded ${ufoData.length} UFO sightings`);
    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        data.push(row);
    }

    return data;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Load all countries
async function loadCountries() {
    try {
        countrySelect.classList.add('loading');

        const response = await fetch(`${API_BASE_URL}`);
        const data = await response.json();

        if (!data.error && data.data) {
            const countries = data.data.map(item => item.country).sort();

            countrySelect.innerHTML = '<option value="">Select a country</option>';
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        countrySelect.innerHTML = '<option value="">Error loading</option>';
    } finally {
        countrySelect.classList.remove('loading');
    }
}

// Handle country selection change
async function handleCountryChange() {
    const selectedCountry = countrySelect.value;

    // Reset dependent selects
    regionSelect.innerHTML = '<option value="">Loading...</option>';
    regionSelect.disabled = true;
    localeSelect.innerHTML = '<option value="">Select a region first</option>';
    localeSelect.disabled = true;
    updateApplyButtonState();

    if (!selectedCountry) {
        regionSelect.innerHTML = '<option value="">Select a country first</option>';
        return;
    }

    try {
        regionSelect.classList.add('loading');

        const response = await fetch(`${API_BASE_URL}/states`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ country: selectedCountry })
        });

        const data = await response.json();

        if (!data.error && data.data && data.data.states) {
            const states = data.data.states;

            if (states.length > 0) {
                regionSelect.innerHTML = '<option value="">Select a region</option>';
                states.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state.name;
                    option.textContent = state.name;
                    regionSelect.appendChild(option);
                });
                regionSelect.disabled = false;
            } else {
                regionSelect.innerHTML = '<option value="">No regions available</option>';
            }
        } else {
            regionSelect.innerHTML = '<option value="">No regions available</option>';
        }
    } catch (error) {
        console.error('Error loading regions:', error);
        regionSelect.innerHTML = '<option value="">Error loading</option>';
    } finally {
        regionSelect.classList.remove('loading');
        updateApplyButtonState();
    }
}

// Handle region selection change
async function handleRegionChange() {
    const selectedCountry = countrySelect.value;
    const selectedRegion = regionSelect.value;

    // Reset locale select
    localeSelect.innerHTML = '<option value="">Loading...</option>';
    localeSelect.disabled = true;
    updateApplyButtonState();

    if (!selectedRegion) {
        localeSelect.innerHTML = '<option value="">Select a region first</option>';
        return;
    }

    try {
        localeSelect.classList.add('loading');

        const response = await fetch(`${API_BASE_URL}/state/cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                country: selectedCountry,
                state: selectedRegion
            })
        });

        const data = await response.json();

        if (!data.error && data.data) {
            const cities = data.data;

            if (cities.length > 0) {
                localeSelect.innerHTML = '<option value="">Select a locale</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    localeSelect.appendChild(option);
                });
                localeSelect.disabled = false;
            } else {
                localeSelect.innerHTML = '<option value="">No locales available</option>';
            }
        } else {
            localeSelect.innerHTML = '<option value="">No locales available</option>';
        }
    } catch (error) {
        console.error('Error loading locales:', error);
        localeSelect.innerHTML = '<option value="">Error loading</option>';
    } finally {
        localeSelect.classList.remove('loading');
        updateApplyButtonState();
    }
}

// Handle apply filters button click
async function handleApplyFilters() {
    const filters = {
        date: dateFilter.value,
        country: countrySelect.value,
        region: regionSelect.value,
        locale: localeSelect.value
    };

    // Show loading state
    const contentArea = document.querySelector('.content');
    contentArea.innerHTML = '<p>Loading sightings and weather data...</p>';

    // Filter the UFO data
    const filteredData = filterUFOData(filters);

    // Get coordinates for map
    let coords = null;
    if (filteredData.length > 0) {
        coords = {
            lat: parseFloat(filteredData[0].latitude),
            lon: parseFloat(filteredData[0].longitude)
        };
    } else {
        const matchingSighting = ufoData.find(row => {
            if (filters.locale && row.Locale === filters.locale &&
                row.Region === filters.region && row.Country === filters.country) {
                return true;
            }
            if (!filters.locale && filters.region &&
                row.Region === filters.region && row.Country === filters.country) {
                return true;
            }
            if (!filters.locale && !filters.region && filters.country &&
                row.Country === filters.country) {
                return true;
            }
            return false;
        });

        if (matchingSighting) {
            coords = {
                lat: parseFloat(matchingSighting.latitude),
                lon: parseFloat(matchingSighting.longitude)
            };
        }
    }

    // Fetch weather data for all sightings (for correlation analysis)
    let allWeatherData = [];
    if (filteredData.length > 0) {
        contentArea.innerHTML = `<p>Loading weather data for ${Math.min(filteredData.length, MAX_WEATHER_CALLS)} sightings...</p>`;
        allWeatherData = await fetchWeatherForSightings(filteredData);
    }

    // Log results as JSON
    console.log('Filters applied:', filters);
    console.log('Filtered results:', JSON.stringify(filteredData, null, 2));
    console.log('All weather data:', JSON.stringify(allWeatherData, null, 2));
    console.log(`Found ${filteredData.length} matching sightings with ${allWeatherData.length} weather records`);

    // Display results in the content area
    displayResults(filteredData, filters, allWeatherData, coords);
}

// Fetch weather data for multiple sightings
async function fetchWeatherForSightings(sightings) {
    // Create unique date+location combinations to avoid duplicate API calls
    const uniqueRequests = new Map();

    sightings.forEach(sighting => {
        const date = sighting.Date_time ? sighting.Date_time.split(' ')[0] : null;
        const lat = parseFloat(sighting.latitude);
        const lon = parseFloat(sighting.longitude);

        if (date && !isNaN(lat) && !isNaN(lon)) {
            // Round coordinates to reduce duplicate calls for nearby locations
            const key = `${date}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
            if (!uniqueRequests.has(key)) {
                uniqueRequests.set(key, { date, lat, lon, sightings: [] });
            }
            uniqueRequests.get(key).sightings.push(sighting);
        }
    });

    // Limit number of API calls
    const requests = Array.from(uniqueRequests.values()).slice(0, MAX_WEATHER_CALLS);

    // Fetch weather data in parallel batches
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async req => {
                const weather = await fetchHistoricalWeather(req.lat, req.lon, req.date);
                return {
                    ...req,
                    weather
                };
            })
        );
        results.push(...batchResults);
    }

    return results;
}

// Fetch historical weather data from Open-Meteo
async function fetchHistoricalWeather(latitude, longitude, date) {
    try {
        const params = new URLSearchParams({
            latitude: latitude,
            longitude: longitude,
            start_date: date,
            end_date: date,
            daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,snowfall_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code',
            timezone: 'auto'
        });

        const response = await fetch(`${WEATHER_API_URL}?${params}`);
        const data = await response.json();

        if (data.daily) {
            return {
                date: data.daily.time[0],
                temperature_max: data.daily.temperature_2m_max[0],
                temperature_min: data.daily.temperature_2m_min[0],
                temperature_mean: data.daily.temperature_2m_mean[0],
                precipitation: data.daily.precipitation_sum[0],
                rain: data.daily.rain_sum[0],
                snowfall: data.daily.snowfall_sum[0],
                precipitation_hours: data.daily.precipitation_hours[0],
                wind_speed_max: data.daily.wind_speed_10m_max[0],
                wind_gusts_max: data.daily.wind_gusts_10m_max[0],
                wind_direction: data.daily.wind_direction_10m_dominant[0],
                weather_code: data.daily.weather_code[0],
                units: data.daily_units
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Get weather description from WMO weather code
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
}

// Display filtered results in the content area
function displayResults(data, filters, allWeatherData, coords) {
    const contentArea = document.querySelector('.content');

    // Store for pagination
    currentFilteredData = data;
    currentDisplayCount = RESULTS_PER_PAGE;

    // Build map section HTML (only if we have coordinates and limited markers)
    let mapHtml = '';
    const mapData = data.slice(0, MAX_DISPLAY_RESULTS); // Limit markers on map
    if (coords || data.length > 0) {
        mapHtml = `
            <div class="map-section">
                <div id="map"></div>
            </div>
        `;
    }

    // Build charts section HTML (only if we have weather data)
    let chartsHtml = '';
    if (allWeatherData.length > 0) {
        const totalSightingsAnalyzed = allWeatherData.reduce((sum, item) => sum + item.sightings.length, 0);
        chartsHtml = `
            <div class="charts-section">
                <h3>Weather Correlation Analysis (${totalSightingsAnalyzed} sightings analyzed)</h3>
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="weatherConditionChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="temperatureChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="windChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="precipitationChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    if (data.length === 0) {
        contentArea.innerHTML = `
            <div class="results-container">
                ${mapHtml}
                ${chartsHtml}
                <div class="no-results">
                    <h2>No sightings found</h2>
                    <p>No UFO sightings match your filters.</p>
                </div>
            </div>
        `;
        if (coords) {
            initMap(coords, [], filters);
        }
        return;
    }

    // Only display first batch
    const displayData = data.slice(0, RESULTS_PER_PAGE);

    let html = `
        <div class="results-container">
            ${mapHtml}
            ${chartsHtml}
            <h2>Found ${data.length.toLocaleString()} sighting${data.length !== 1 ? 's' : ''}</h2>
            <div class="results-list" id="results-list">
    `;

    displayData.forEach((sighting, index) => {
        html += createSightingCard(sighting, index);
    });

    html += `
            </div>
    `;

    // Add "Load More" button if there are more results
    if (data.length > RESULTS_PER_PAGE) {
        html += `
            <div class="load-more-container">
                <button id="load-more-btn" class="btn-load-more">
                    Load More (showing ${displayData.length} of ${data.length.toLocaleString()})
                </button>
            </div>
        `;
    }

    // Add JSON data accordions
    html += `
        <div class="json-accordions">
            <div class="accordion">
                <button class="accordion-header" onclick="toggleAccordion(this)">
                    <span>CSV Data (JSON)</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <div class="json-toolbar">
                        <span class="json-info">${data.length.toLocaleString()} records</span>
                        <button class="btn-copy" onclick="copyToClipboard('csv-json')">Copy</button>
                    </div>
                    <pre id="csv-json">${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
            <div class="accordion">
                <button class="accordion-header" onclick="toggleAccordion(this)">
                    <span>Weather API Data (JSON)</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <div class="json-toolbar">
                        <span class="json-info">${allWeatherData.length} weather records</span>
                        <button class="btn-copy" onclick="copyToClipboard('weather-json')">Copy</button>
                    </div>
                    <pre id="weather-json">${JSON.stringify(allWeatherData, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;

    html += `</div>`;

    contentArea.innerHTML = html;

    // Add load more event listener
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreResults);
    }

    // Initialize map after DOM is updated (with limited markers)
    if (coords || data.length > 0) {
        const mapCoords = coords || {
            lat: parseFloat(data[0].latitude),
            lon: parseFloat(data[0].longitude)
        };
        initMap(mapCoords, mapData, filters);
    }

    // Initialize charts if we have weather data
    if (allWeatherData.length > 0) {
        initCharts(allWeatherData);
    }
}

// Create a sighting card HTML
function createSightingCard(sighting, index) {
    return `
        <div class="sighting-card">
            <div class="sighting-header">
                <span class="sighting-shape">${sighting.UFO_shape || 'Unknown shape'}</span>
                <span class="sighting-date">${sighting.Date_time}</span>
            </div>
            <div class="sighting-location">
                ${sighting.Locale}, ${sighting.Region}, ${sighting.Country}
            </div>
            <div class="sighting-duration">
                Duration: ${sighting.Encounter_Duration || 'Unknown'}
            </div>
            <div class="sighting-description">
                ${decodeHTMLEntities(sighting.Description || 'No description available')}
            </div>
            <div class="sighting-coords">
                Coordinates: ${sighting.latitude}, ${sighting.longitude}
            </div>
        </div>
    `;
}

// Load more results
function loadMoreResults() {
    const resultsList = document.getElementById('results-list');
    const loadMoreBtn = document.getElementById('load-more-btn');

    const nextBatch = currentFilteredData.slice(currentDisplayCount, currentDisplayCount + RESULTS_PER_PAGE);

    nextBatch.forEach((sighting, index) => {
        resultsList.insertAdjacentHTML('beforeend', createSightingCard(sighting, currentDisplayCount + index));
    });

    currentDisplayCount += nextBatch.length;

    // Update or hide button
    if (currentDisplayCount >= currentFilteredData.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.textContent = `Load More (showing ${currentDisplayCount} of ${currentFilteredData.length.toLocaleString()})`;
    }
}

// Initialize weather correlation charts
function initCharts(weatherData) {
    // Destroy existing charts
    if (weatherChart) weatherChart.destroy();
    if (tempChart) tempChart.destroy();
    if (windChart) windChart.destroy();

    // Aggregate data for charts
    const conditionCounts = {};
    const tempRanges = { 'Below 0°C': 0, '0-10°C': 0, '10-20°C': 0, '20-30°C': 0, 'Above 30°C': 0 };
    const windRanges = { 'Calm (0-10)': 0, 'Light (10-20)': 0, 'Moderate (20-40)': 0, 'Strong (40+)': 0 };
    const precipRanges = { 'None (0mm)': 0, 'Light (0-5mm)': 0, 'Moderate (5-20mm)': 0, 'Heavy (20+mm)': 0 };

    weatherData.forEach(item => {
        if (!item.weather) return;

        // Count weather conditions
        const condition = getWeatherCategory(item.weather.weather_code);
        conditionCounts[condition] = (conditionCounts[condition] || 0) + item.sightings.length;

        // Count temperature ranges
        const temp = item.weather.temperature_mean;
        if (temp !== null && temp !== undefined) {
            if (temp < 0) tempRanges['Below 0°C'] += item.sightings.length;
            else if (temp < 10) tempRanges['0-10°C'] += item.sightings.length;
            else if (temp < 20) tempRanges['10-20°C'] += item.sightings.length;
            else if (temp < 30) tempRanges['20-30°C'] += item.sightings.length;
            else tempRanges['Above 30°C'] += item.sightings.length;
        }

        // Count wind ranges
        const wind = item.weather.wind_speed_max;
        if (wind !== null && wind !== undefined) {
            if (wind < 10) windRanges['Calm (0-10)'] += item.sightings.length;
            else if (wind < 20) windRanges['Light (10-20)'] += item.sightings.length;
            else if (wind < 40) windRanges['Moderate (20-40)'] += item.sightings.length;
            else windRanges['Strong (40+)'] += item.sightings.length;
        }

        // Count precipitation ranges
        const precip = item.weather.precipitation;
        if (precip !== null && precip !== undefined) {
            if (precip === 0) precipRanges['None (0mm)'] += item.sightings.length;
            else if (precip < 5) precipRanges['Light (0-5mm)'] += item.sightings.length;
            else if (precip < 20) precipRanges['Moderate (5-20mm)'] += item.sightings.length;
            else precipRanges['Heavy (20+mm)'] += item.sightings.length;
        }
    });

    const chartColors = {
        green: 'rgba(0, 255, 136, 0.8)',
        blue: 'rgba(0, 150, 255, 0.8)',
        purple: 'rgba(150, 50, 255, 0.8)',
        orange: 'rgba(255, 150, 0, 0.8)',
        red: 'rgba(255, 100, 100, 0.8)',
        yellow: 'rgba(255, 255, 0, 0.8)',
        cyan: 'rgba(0, 255, 255, 0.8)'
    };

    // Weather Condition Chart (Doughnut)
    const conditionCtx = document.getElementById('weatherConditionChart').getContext('2d');
    weatherChart = new Chart(conditionCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    chartColors.green,
                    chartColors.blue,
                    chartColors.purple,
                    chartColors.orange,
                    chartColors.red,
                    chartColors.yellow,
                    chartColors.cyan
                ],
                borderColor: '#1a1a2e',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sightings by Weather Condition',
                    color: '#e0e0e0',
                    font: { size: 14 }
                },
                legend: {
                    position: 'bottom',
                    labels: { color: '#e0e0e0', font: { size: 11 } }
                }
            }
        }
    });

    // Temperature Chart (Bar)
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(tempRanges),
            datasets: [{
                label: 'Number of Sightings',
                data: Object.values(tempRanges),
                backgroundColor: chartColors.orange,
                borderColor: '#1a1a2e',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sightings by Temperature',
                    color: '#e0e0e0',
                    font: { size: 14 }
                },
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#888' }, grid: { color: '#333' } },
                y: { ticks: { color: '#888' }, grid: { color: '#333' } }
            }
        }
    });

    // Wind Chart (Bar)
    const windCtx = document.getElementById('windChart').getContext('2d');
    windChart = new Chart(windCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(windRanges),
            datasets: [{
                label: 'Number of Sightings',
                data: Object.values(windRanges),
                backgroundColor: chartColors.cyan,
                borderColor: '#1a1a2e',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sightings by Wind Speed (km/h)',
                    color: '#e0e0e0',
                    font: { size: 14 }
                },
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#888' }, grid: { color: '#333' } },
                y: { ticks: { color: '#888' }, grid: { color: '#333' } }
            }
        }
    });

    // Precipitation Chart (Polar Area)
    const precipCtx = document.getElementById('precipitationChart').getContext('2d');
    new Chart(precipCtx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(precipRanges),
            datasets: [{
                data: Object.values(precipRanges),
                backgroundColor: [
                    'rgba(0, 255, 136, 0.7)',
                    'rgba(0, 150, 255, 0.7)',
                    'rgba(150, 50, 255, 0.7)',
                    'rgba(255, 100, 100, 0.7)'
                ],
                borderColor: '#1a1a2e',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sightings by Precipitation',
                    color: '#e0e0e0',
                    font: { size: 14 }
                },
                legend: {
                    position: 'bottom',
                    labels: { color: '#e0e0e0', font: { size: 11 } }
                }
            },
            scales: {
                r: {
                    ticks: { color: '#888', backdropColor: 'transparent' },
                    grid: { color: '#333' }
                }
            }
        }
    });
}

// Get simplified weather category from WMO code
function getWeatherCategory(code) {
    if (code === 0 || code === 1) return 'Clear';
    if (code === 2 || code === 3) return 'Cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
}

// Initialize Leaflet map
function initMap(coords, sightings, filters) {
    // Destroy existing map if any
    if (map) {
        map.remove();
        map = null;
    }

    // Create map
    map = L.map('map');

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom UFO icon
    const ufoIcon = L.divIcon({
        html: '<div class="ufo-marker">👽</div>',
        className: 'ufo-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    // Collect all markers to fit bounds
    const markers = [];

    // Add markers for each sighting
    if (sightings.length > 0) {
        sightings.forEach((sighting, index) => {
            const lat = parseFloat(sighting.latitude);
            const lon = parseFloat(sighting.longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
                const marker = L.marker([lat, lon], { icon: ufoIcon })
                    .addTo(map)
                    .bindPopup(`
                        <strong>#${index + 1} - ${sighting.UFO_shape || 'Unknown shape'}</strong><br>
                        ${sighting.Date_time}<br>
                        ${sighting.Locale}, ${sighting.Region}<br>
                        Duration: ${sighting.Encounter_Duration || 'Unknown'}
                    `);
                markers.push(marker);
            }
        });

        // Fit map to show all markers
        if (markers.length > 1) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        } else if (markers.length === 1) {
            map.setView([parseFloat(sightings[0].latitude), parseFloat(sightings[0].longitude)], 12);
        }
    } else {
        // Just add a marker for the location
        L.marker([coords.lat, coords.lon], { icon: ufoIcon })
            .addTo(map)
            .bindPopup(`${filters.locale}, ${filters.region}, ${filters.country}`);
        map.setView([coords.lat, coords.lon], 10);
    }
}

// Decode HTML entities in description
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// Filter UFO data based on selected filters
function filterUFOData(filters) {
    return ufoData.filter(row => {
        // Match country (if selected)
        if (filters.country && row.Country !== filters.country) {
            return false;
        }

        // Match region (if selected)
        if (filters.region && row.Region !== filters.region) {
            return false;
        }

        // Match locale (if selected)
        if (filters.locale && row.Locale !== filters.locale) {
            return false;
        }

        // Match date (if selected)
        if (filters.date) {
            const filterDate = new Date(filters.date);
            const filterYear = filterDate.getFullYear();
            const filterMonth = filterDate.getMonth() + 1;
            const filterDay = filterDate.getDate();

            const rowYear = parseInt(row.Year, 10);
            const rowMonth = parseInt(row.Month, 10);

            // Extract day from Date_time (format: YYYY-MM-DD HH:MM:SS)
            const rowDateParts = row.Date_time ? row.Date_time.split(' ')[0].split('-') : [];
            const rowDay = rowDateParts.length === 3 ? parseInt(rowDateParts[2], 10) : null;

            if (rowYear !== filterYear || rowMonth !== filterMonth || rowDay !== filterDay) {
                return false;
            }
        }

        return true;
    });
}
