const fs = require('fs');

// Read the database file
const data = fs.readFileSync('atlantic-storms-enhanced.js', 'utf8');

// Parse the storms array - handle both possible variable names
let startIndex = data.indexOf('const ATLANTIC_STORMS_ENHANCED = [');
let varName = 'ATLANTIC_STORMS_ENHANCED';
if (startIndex === -1) {
    startIndex = data.indexOf('const atlanticStorms = [');
    varName = 'atlanticStorms';
}
if (startIndex === -1) {
    console.error('Could not find storms array in file');
    process.exit(1);
}
const endIndex = data.indexOf('];', startIndex);
if (endIndex === -1) {
    console.error('Could not find end of storms array');
    process.exit(1);
}
const stormsJson = data.substring(startIndex + `const ${varName} = `.length, endIndex + 1);
const storms = JSON.parse(stormsJson);

console.log(`Processing ${storms.length} storms...`);

let removedArchives = 0;
let removedShapefiles = 0;

storms.forEach(storm => {
    // Remove nhc_archive and tcr_shp from all storms
    // These are redundant with TCR PDFs and were causing confusion
    if (storm.resources) {
        if (storm.resources.nhc_archive) {
            delete storm.resources.nhc_archive;
            removedArchives++;
        }
        if (storm.resources.tcr_shp) {
            delete storm.resources.tcr_shp;
            removedShapefiles++;
        }
    }
});

// Rebuild the file content - preserve original format and variable name
const newContent = `// Enhanced Atlantic Hurricane Database (HURDAT2) 1851-2024
// CORRECTED VERSION - ${new Date().toISOString()}
// Total storms: ${storms.length}
// Data sources: NOAA HURDAT2 (peak intensities), Historical death records, AI-enhanced narratives
// CRITICAL: This version contains ACCURATE peak intensity values from HURDAT2

const ${varName} = ${JSON.stringify(storms, null, 2)};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${varName};
}

// Also make it available as atlanticStorms for compatibility
const atlanticStorms = ${varName};`;

// Write the updated file
fs.writeFileSync('atlantic-storms-enhanced.js', newContent);

console.log('\n✅ Resource Cleanup Complete!');
console.log(`Removed ${removedArchives} NHC Archive links`);
console.log(`Removed ${removedShapefiles} GIS Shapefile links`);
console.log('\nSimplified to only show TCR PDFs (1995+) which provide:');
console.log('- Comprehensive storm analysis');
console.log('- Track maps and graphics');
console.log('- Meteorological data');
console.log('- Damage assessments');
console.log('- All the information previously linked via NHC Archive');