const data = require('./data.json');

// Count by year for records with null weather
const nullByYear = {};
const withWeatherByYear = {};

data.forEach(r => {
    const year = r.date ? parseInt(r.date.split('-')[0]) : null;
    if (!year) return;

    if (r.weather === null) {
        nullByYear[year] = (nullByYear[year] || 0) + 1;
    } else {
        withWeatherByYear[year] = (withWeatherByYear[year] || 0) + 1;
    }
});

console.log('Records WITHOUT weather by year:');
const nullYears = Object.entries(nullByYear).sort((a,b) => a[0] - b[0]);
nullYears.forEach(([y, c]) => console.log(`  ${y}: ${c}`));

console.log('\nRecords WITH weather by year:');
const withYears = Object.entries(withWeatherByYear).sort((a,b) => a[0] - b[0]);
withYears.forEach(([y, c]) => console.log(`  ${y}: ${c}`));

// Check if there's a pattern
const minYearWithWeather = Math.min(...withYears.map(([y]) => parseInt(y)));
const maxYearWithWeather = Math.max(...withYears.map(([y]) => parseInt(y)));

console.log(`\nWeather data available from ${minYearWithWeather} to ${maxYearWithWeather}`);
