const fs = require('fs');

// Read the database
const fileContent = fs.readFileSync('atlantic-storms-enhanced.js', 'utf8');
const match = fileContent.match(/const ATLANTIC_STORMS_ENHANCED = (\[[\s\S]*\]);/);
const storms = JSON.parse(match[1]);

// Find NC storms 1990-2000
const ncStorms = storms.filter(s => 
    s.year >= 1990 && 
    s.year <= 2000 && 
    s.landfall_states && 
    s.landfall_states.includes('NC')
);

console.log('ACTUAL North Carolina Storms (1990-2000):');
console.log('==========================================\n');

// Group by year
const byYear = {};
ncStorms.forEach(s => {
    if (!byYear[s.year]) byYear[s.year] = [];
    byYear[s.year].push(s);
});

// Show year by year
Object.keys(byYear).sort().forEach(year => {
    console.log(`${year}:`);
    byYear[year].forEach(s => {
        console.log(`  - ${s.name} (Category ${s.category}, ${s.month}/${s.day})`);
    });
});

console.log(`\nTOTAL: ${ncStorms.length} storms hit NC between 1990-2000`);

// List just the names for AI training
console.log('\nStorm names for AI:');
ncStorms.forEach(s => {
    console.log(`${s.name} (${s.year})`);
});