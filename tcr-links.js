/**
 * TCR Link Generator
 * Generates proper NOAA Tropical Cyclone Report links
 */

function getTCRLink(storm) {
    // TCRs are generally available from 1995 onwards
    if (storm.year < 1995) {
        return null;
    }
    
    // Format storm name for URL
    const stormName = storm.name ? storm.name.toUpperCase() : 'UNNAMED';
    
    // TCR filename format: AL##YYYY_NAME.pdf
    // Example: AL092022_IAN.pdf
    const tcrFilename = `${storm.storm_id}_${stormName}.pdf`;
    
    // Full URL
    return `https://www.nhc.noaa.gov/data/tcr/${tcrFilename}`;
}

function hasTCR(storm) {
    // TCRs exist for:
    // 1. Storms from 1995 onwards
    // 2. That made landfall or had significant impacts
    // 3. Named storms (not all TDs have TCRs)
    
    if (storm.year < 1995) return false;
    if (!storm.name || storm.name === 'UNNAMED') return false;
    
    // Major storms almost always have TCRs
    if (storm.category >= 3) return true;
    
    // Storms with US landfall usually have TCRs
    if (storm.landfall_states && storm.landfall_states.length > 0) return true;
    
    // Storms with significant deaths/damage have TCRs
    if (storm.deaths > 0 || storm.damage_millions > 100) return true;
    
    // Otherwise, maybe (depends on specific impacts)
    return false;
}

// Known TCR links for major storms (can be expanded)
const KNOWN_TCRS = {
    'AL182005': 'AL182005_RITA.pdf',         // Rita 2005
    'AL122005': 'AL122005_KATRINA.pdf',      // Katrina 2005
    'AL092022': 'AL092022_IAN.pdf',          // Ian 2022
    'AL082024': 'AL082024_HELENE.pdf',       // Helene 2024
    'AL142024': 'AL142024_MILTON.pdf',       // Milton 2024
    'AL062004': 'AL062004_FRANCES.pdf',      // Frances 2004
    'AL092004': 'AL092004_IVAN.pdf',         // Ivan 2004
    'AL052004': 'AL052004_CHARLEY.pdf',      // Charley 2004
    'AL112017': 'AL112017_IRMA.pdf',         // Irma 2017
    'AL152017': 'AL152017_MARIA.pdf',        // Maria 2017
    'AL092017': 'AL092017_HARVEY.pdf',       // Harvey 2017
    'AL142018': 'AL142018_MICHAEL.pdf',      // Michael 2018
    'AL062019': 'AL062019_DORIAN.pdf',       // Dorian 2019
    'AL132024': 'AL132024_LESLIE.pdf',       // Leslie 2024
    'AL092021': 'AL092021_IDA.pdf',          // Ida 2021
    'AL042020': 'AL042020_LAURA.pdf',        // Laura 2020
    'AL142016': 'AL142016_MATTHEW.pdf',      // Matthew 2016
    'AL302012': 'AL302012_SANDY.pdf',        // Sandy 2012
    'AL092011': 'AL092011_IRENE.pdf',        // Irene 2011
    'AL182012': 'AL182012_RAFAEL.pdf',       // Rafael 2012
    'AL042017': 'AL042017_CINDY.pdf',        // Cindy 2017
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getTCRLink, hasTCR, KNOWN_TCRS };
}