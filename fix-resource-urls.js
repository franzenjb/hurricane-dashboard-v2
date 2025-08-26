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

let fixedCount = 0;
let removedShapefiles = 0;
let removedArchives = 0;

storms.forEach(storm => {
    // Extract storm number from storm_id (e.g., AL092022 -> 09)
    const stormNum = storm.storm_id.substring(2, 4);
    
    // Fix NHC Archive URL (only for 1998 and later)
    if (storm.year >= 1998) {
        // Pattern: https://www.nhc.noaa.gov/archive/[year]/al[nn]/
        const newArchiveUrl = `https://www.nhc.noaa.gov/archive/${storm.year}/al${stormNum}/`;
        if (storm.resources.nhc_archive !== newArchiveUrl) {
            storm.resources.nhc_archive = newArchiveUrl;
            fixedCount++;
        }
    } else {
        // Remove archive URL for pre-1998 storms
        if (storm.resources.nhc_archive) {
            delete storm.resources.nhc_archive;
            removedArchives++;
        }
    }
    
    // Fix GIS Shapefile URL (only for 2005 and later)
    if (storm.year >= 2005) {
        // Pattern: https://www.nhc.noaa.gov/gis/best_track/[storm_id_lowercase]_best_track.zip
        const newShapefileUrl = `https://www.nhc.noaa.gov/gis/best_track/${storm.storm_id.toLowerCase()}_best_track.zip`;
        if (storm.resources.tcr_shp !== newShapefileUrl) {
            storm.resources.tcr_shp = newShapefileUrl;
            fixedCount++;
        }
    } else {
        // Remove shapefile URL for pre-2005 storms
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

console.log('\n✅ URL Fix Complete!');
console.log(`Fixed ${fixedCount} URLs`);
console.log(`Removed ${removedShapefiles} invalid shapefile links (pre-2005)`);
console.log(`Removed ${removedArchives} invalid archive links (pre-1998)`);
console.log('\nResource availability:');
console.log('- NHC Archive: 1998 onwards');
console.log('- GIS Shapefiles: 2005 onwards');
console.log('- TCR PDFs: 1995 onwards (already working)');