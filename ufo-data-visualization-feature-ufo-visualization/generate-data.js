const fs = require('fs');
const https = require('https');

const CSV_PATH = './ufo-sightings-transformed.csv';
const OUTPUT_PATH = './data.json';
const WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

// Configuration
const BATCH_SIZE = 50; // Concurrent API calls
const DELAY_BETWEEN_BATCHES = 200; // ms
const MAX_RECORDS = null; // Set to a number to limit, null for all

// Parse CSV
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

// Fetch weather data
function fetchWeather(lat, lon, date) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            start_date: date,
            end_date: date,
            daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code',
            timezone: 'auto'
        });

        const url = `${WEATHER_API_URL}?${params}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.daily) {
                        resolve({
                            weather_code: json.daily.weather_code?.[0],
                            temperature_max: json.daily.temperature_2m_max?.[0],
                            temperature_min: json.daily.temperature_2m_min?.[0],
                            temperature_mean: json.daily.temperature_2m_mean?.[0],
                            precipitation: json.daily.precipitation_sum?.[0],
                            rain: json.daily.rain_sum?.[0],
                            snowfall: json.daily.snowfall_sum?.[0],
                            wind_speed_max: json.daily.wind_speed_10m_max?.[0],
                            wind_gusts_max: json.daily.wind_gusts_10m_max?.[0],
                            wind_direction: json.daily.wind_direction_10m_dominant?.[0]
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// Get weather description from code
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

// Sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
    console.log('Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    let records = parseCSV(csvContent);

    if (MAX_RECORDS) {
        records = records.slice(0, MAX_RECORDS);
    }

    console.log(`Processing ${records.length} records...`);

    // Create unique weather requests (group by date + rounded coords)
    const weatherCache = new Map();
    const recordsWithKeys = records.map(record => {
        const date = record.Date_time ? record.Date_time.split(' ')[0] : null;
        const lat = parseFloat(record.latitude);
        const lon = parseFloat(record.longitude);

        if (date && !isNaN(lat) && !isNaN(lon)) {
            const key = `${date}_${lat.toFixed(1)}_${lon.toFixed(1)}`;
            return { record, key, date, lat, lon };
        }
        return { record, key: null };
    });

    // Get unique keys that need weather data
    const uniqueKeys = [...new Set(recordsWithKeys.filter(r => r.key).map(r => r.key))];
    console.log(`Found ${uniqueKeys.length} unique date/location combinations for weather API`);

    // Fetch weather data in batches
    let processed = 0;
    for (let i = 0; i < uniqueKeys.length; i += BATCH_SIZE) {
        const batch = uniqueKeys.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async key => {
            const [date, lat, lon] = key.split('_');
            const weather = await fetchWeather(parseFloat(lat), parseFloat(lon), date);
            return { key, weather };
        });

        const results = await Promise.all(promises);
        results.forEach(({ key, weather }) => {
            weatherCache.set(key, weather);
        });

        processed += batch.length;
        const percent = ((processed / uniqueKeys.length) * 100).toFixed(1);
        process.stdout.write(`\rFetching weather data: ${processed}/${uniqueKeys.length} (${percent}%)`);

        if (i + BATCH_SIZE < uniqueKeys.length) {
            await sleep(DELAY_BETWEEN_BATCHES);
        }
    }

    console.log('\nBuilding output JSON...');

    // Build final data
    const outputData = recordsWithKeys.map(({ record, key }) => {
        const weather = key ? weatherCache.get(key) : null;

        const entry = {
            date: record.Date_time ? record.Date_time.split(' ')[0] : null,
            time: record.Date_time ? record.Date_time.split(' ')[1] : null,
            country: record.Country,
            region: record.Region,
            locale: record.Locale,
            description: record.Description,
            shape: record.UFO_shape,
            latitude: parseFloat(record.latitude) || null,
            longitude: parseFloat(record.longitude) || null
        };

        if (weather) {
            entry.weather = {
                condition: getWeatherDescription(weather.weather_code),
                weather_code: weather.weather_code,
                temperature_max: weather.temperature_max,
                temperature_min: weather.temperature_min,
                temperature_mean: weather.temperature_mean,
                precipitation_mm: weather.precipitation,
                rain_mm: weather.rain,
                snowfall_cm: weather.snowfall,
                wind_speed_max_kmh: weather.wind_speed_max,
                wind_gusts_max_kmh: weather.wind_gusts_max,
                wind_direction_deg: weather.wind_direction
            };
        } else {
            entry.weather = null;
        }

        return entry;
    });

    // Write output
    console.log(`Writing ${outputData.length} records to ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));

    console.log('Done!');

    // Print summary
    const withWeather = outputData.filter(r => r.weather).length;
    console.log(`\nSummary:`);
    console.log(`- Total records: ${outputData.length}`);
    console.log(`- Records with weather data: ${withWeather}`);
    console.log(`- Records without weather data: ${outputData.length - withWeather}`);
}

main().catch(console.error);
