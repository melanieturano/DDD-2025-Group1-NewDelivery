const fs = require('fs');
const https = require('https');

const DATA_PATH = './data.json';
const OUTPUT_PATH = './data.json';
const WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

// Configuration - slower but more reliable
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 500;
const MAX_RETRIES = 3;
const MIN_YEAR = 2000; // Only fix recent records

// Fetch weather with retry
async function fetchWeatherWithRetry(lat, lon, date, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await fetchWeather(lat, lon, date);
            if (result) return result;

            // If null, wait and retry
            if (attempt < retries) {
                await sleep(1000 * attempt);
            }
        } catch (e) {
            if (attempt < retries) {
                await sleep(1000 * attempt);
            }
        }
    }
    return null;
}

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

        const req = https.get(url, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.daily && json.daily.weather_code && json.daily.weather_code[0] !== null) {
                        resolve({
                            weather_code: json.daily.weather_code[0],
                            temperature_max: json.daily.temperature_2m_max[0],
                            temperature_min: json.daily.temperature_2m_min[0],
                            temperature_mean: json.daily.temperature_2m_mean[0],
                            precipitation: json.daily.precipitation_sum[0],
                            rain: json.daily.rain_sum[0],
                            snowfall: json.daily.snowfall_sum[0],
                            wind_speed_max: json.daily.wind_speed_10m_max[0],
                            wind_gusts_max: json.daily.wind_gusts_10m_max[0],
                            wind_direction: json.daily.wind_direction_10m_dominant[0]
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
    });
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall', 77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Loading data.json...');
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    // Find records with null weather and year >= MIN_YEAR
    const toFix = [];
    data.forEach((record, index) => {
        if (record.weather === null && record.date) {
            const year = parseInt(record.date.split('-')[0]);
            if (year >= MIN_YEAR && record.latitude && record.longitude) {
                toFix.push({ index, record });
            }
        }
    });

    console.log(`Found ${toFix.length} records to fix (year >= ${MIN_YEAR})`);

    // Create unique requests
    const uniqueRequests = new Map();
    toFix.forEach(({ index, record }) => {
        const key = `${record.date}_${record.latitude.toFixed(2)}_${record.longitude.toFixed(2)}`;
        if (!uniqueRequests.has(key)) {
            uniqueRequests.set(key, {
                date: record.date,
                lat: record.latitude,
                lon: record.longitude,
                indices: []
            });
        }
        uniqueRequests.get(key).indices.push(index);
    });

    const requests = Array.from(uniqueRequests.values());
    console.log(`${requests.length} unique API calls needed`);

    // Process in batches
    let processed = 0;
    let fixed = 0;

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
        const batch = requests.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async req => {
                const weather = await fetchWeatherWithRetry(req.lat, req.lon, req.date);
                return { req, weather };
            })
        );

        results.forEach(({ req, weather }) => {
            if (weather) {
                const weatherObj = {
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

                req.indices.forEach(idx => {
                    data[idx].weather = weatherObj;
                    fixed++;
                });
            }
        });

        processed += batch.length;
        const percent = ((processed / requests.length) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${processed}/${requests.length} (${percent}%) - Fixed: ${fixed}`);

        if (i + BATCH_SIZE < requests.length) {
            await sleep(DELAY_BETWEEN_BATCHES);
        }
    }

    console.log('\n\nSaving updated data.json...');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));

    // Count final stats
    const withWeather = data.filter(r => r.weather !== null).length;
    console.log(`\nDone!`);
    console.log(`- Total records: ${data.length}`);
    console.log(`- Records with weather: ${withWeather}`);
    console.log(`- Fixed in this run: ${fixed}`);
}

main().catch(console.error);
