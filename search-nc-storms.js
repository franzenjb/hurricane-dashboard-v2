const fs = require('fs');

// Read the file and extract the data
const fileContent = fs.readFileSync('atlantic-storms-enhanced.js', 'utf8');

// Extract the array from the file content
const match = fileContent.match(/const ATLANTIC_STORMS_ENHANCED = (\[[\s\S]*\]);/);
if (!match) {
    console.error('Could not find storm data');
    process.exit(1);
}

const storms = JSON.parse(match[1]);

// Filter for NC storms 2020-2022
const ncStorms = storms.filter(s => 
    s.year >= 2020 && 
    s.year <= 2022 && 
    s.landfall_states && 
    s.landfall_states.includes('NC')
);

console.log('Hurricanes that hit North Carolina (2020-2022):');
console.log('================================================\n');

ncStorms.forEach(s => {
    console.log(`${s.name} (${s.year})`);
    console.log(`  Storm ID: ${s.storm_id}`);
    console.log(`  Category: ${s.category}`);
    console.log(`  Date: ${s.month}/${s.day}/${s.year}`);
    console.log(`  Max Wind: ${s.wind_mph} mph`);
    console.log(`  Landfall States: ${s.landfall_states.join(', ')}`);
    if (s.deaths !== null && s.deaths !== undefined) {
        console.log(`  Deaths: ${s.deaths}`);
    }
    if (s.damage_billions) {
        console.log(`  Damage: $${s.damage_billions} billion`);
    }
    console.log('');
});

console.log(`Total storms that hit NC (2020-2022): ${ncStorms.length}`);