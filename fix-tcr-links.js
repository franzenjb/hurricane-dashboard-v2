/**
 * Fix TCR Links Script
 * Updates atlantic-storms-enhanced.js with correct NOAA TCR links
 * TCRs only exist from 1995 onwards
 */

const fs = require('fs');

// Read the current database
const dbContent = fs.readFileSync('atlantic-storms-enhanced.js', 'utf8');

// Extract the ATLANTIC_STORMS_ENHANCED array
const stormsMatch = dbContent.match(/const ATLANTIC_STORMS_ENHANCED = (\[[\s\S]*?\]);/);
if (!stormsMatch) {
    console.error('Could not find ATLANTIC_STORMS_ENHANCED array in file');
    process.exit(1);
}

// Parse the storms data
let storms;
try {
    // Use eval to parse the JavaScript array (since it's not pure JSON)
    eval('storms = ' + stormsMatch[1]);
} catch (e) {
    console.error('Error parsing storms data:', e);
    process.exit(1);
}

// Function to convert name to proper case
function toProperCase(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Function to generate correct TCR link
function getCorrectTCRLink(storm) {
    // TCRs only exist from 1995 onwards
    if (storm.year < 1995) {
        return null;
    }
    
    // Skip unnamed storms (they don't have TCRs)
    if (!storm.name || storm.name === 'UNNAMED' || storm.name === 'NOT_NAMED') {
        return null;
    }
    
    // Format: https://www.nhc.noaa.gov/data/tcr/{STORM_ID}_{ProperCaseName}.pdf
    const properName = toProperCase(storm.name);
    return `https://www.nhc.noaa.gov/data/tcr/${storm.storm_id}_${properName}.pdf`;
}

// Function to generate NHC archive link
function getNHCArchiveLink(storm) {
    // NHC archives exist from 1995 onwards
    if (storm.year < 1995) {
        return null;
    }
    
    // Skip unnamed storms
    if (!storm.name || storm.name === 'UNNAMED' || storm.name === 'NOT_NAMED') {
        return null;
    }
    
    // Format: https://www.nhc.noaa.gov/archive/{year}/{storm_id}/
    return `https://www.nhc.noaa.gov/archive/${storm.year}/${storm.storm_id.toLowerCase()}/`;
}

// Update each storm
let fixedCount = 0;
let removedCount = 0;

storms.forEach(storm => {
    const tcrLink = getCorrectTCRLink(storm);
    const archiveLink = getNHCArchiveLink(storm);
    
    if (storm.year < 1995) {
        // Remove TCR links for pre-1995 storms
        if (storm.resources && (storm.resources.tcr_pdf || storm.resources.tcr_kmz)) {
            delete storm.resources.tcr_pdf;
            delete storm.resources.tcr_kmz;
            removedCount++;
            
            // If resources object is now empty, remove it
            if (Object.keys(storm.resources).length === 0) {
                delete storm.resources;
            }
        }
    } else if (tcrLink) {
        // Update or add correct TCR link for 1995+ storms
        if (!storm.resources) {
            storm.resources = {};
        }
        
        const oldLink = storm.resources.tcr_pdf;
        storm.resources.tcr_pdf = tcrLink;
        storm.resources.nhc_archive = archiveLink;
        
        // Remove the tcr_kmz links (we'll just use PDFs)
        delete storm.resources.tcr_kmz;
        
        if (oldLink !== tcrLink) {
            fixedCount++;
            console.log(`Fixed ${storm.year} ${storm.name} (${storm.storm_id})`);
        }
    }
});

// Create the updated file content
const updatedContent = dbContent.replace(
    /const ATLANTIC_STORMS_ENHANCED = \[[\s\S]*?\];/,
    `const ATLANTIC_STORMS_ENHANCED = ${JSON.stringify(storms, null, 2)};`
);

// Write the updated file
fs.writeFileSync('atlantic-storms-enhanced.js', updatedContent);

console.log(`\n✅ TCR Links Fixed!`);
console.log(`- Fixed ${fixedCount} incorrect links`);
console.log(`- Removed ${removedCount} invalid pre-1995 links`);
console.log(`- TCR links now only exist for storms from 1995 onwards`);
console.log(`- Added NHC archive links for reference`);

// Create a sample verification list
console.log('\nSample TCR URLs for verification:');
const samples = [
    { year: 2022, name: 'IAN', id: 'AL092022' },
    { year: 2005, name: 'KATRINA', id: 'AL122005' },
    { year: 2024, name: 'HELENE', id: 'AL092024' },
    { year: 2024, name: 'MILTON', id: 'AL142024' },
    { year: 2017, name: 'HARVEY', id: 'AL092017' }
];

samples.forEach(sample => {
    const properName = toProperCase(sample.name);
    console.log(`- ${sample.year} ${properName}: https://www.nhc.noaa.gov/data/tcr/${sample.id}_${properName}.pdf`);
});