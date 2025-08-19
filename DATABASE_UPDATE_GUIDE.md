# Hurricane Database Update Guide

## Master Database: `atlantic-storms-enhanced.js`

This database is the single source of truth for all hurricane data across the application.

## Data Sources

### 1. HURDAT2 (Primary Source)
- **URL**: https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2024-040825.txt
- **Format**: Fixed-width text format
- **Contains**: Storm tracks, intensities, positions
- **Updated**: Annually (usually April-May)

### 2. Tropical Cyclone Reports (TCRs)
- **URL**: https://www.nhc.noaa.gov/data/tcr/index.php
- **Available Formats**:
  - PDF: Detailed narratives and analysis
  - KMZ: Google Earth visualization files
  - SHP: GIS shapefiles with precise track data
- **Contains**: 
  - Detailed meteorological analysis
  - Casualty and damage statistics
  - Forecast verification
  - Storm surge data

### 3. IBTrACS (International Best Track Archive)
- **URL**: https://www.ncei.noaa.gov/products/international-best-track-archive
- **Format**: CSV, netCDF, shapefiles
- **Contains**: Global tropical cyclone best track data

## Update Process

### Step 1: Download Latest HURDAT2
```bash
# Download latest HURDAT2 file
curl -O https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2024-040825.txt

# Backup existing database
cp atlantic-storms-enhanced.js atlantic-storms-enhanced.backup.js
```

### Step 2: Parse HURDAT2 Data
```javascript
// Parse HURDAT2 format
// Each storm header line: AL092022,                IAN,     27,
// Each data line: 20220928, 1800,  , HU, 26.7N,  82.2W, 140, 937,
```

### Step 3: Enhance with TCR Data
For each storm, fetch the corresponding TCR:
```javascript
// Example TCR URL pattern
const tcrUrl = `https://www.nhc.noaa.gov/data/tcr/AL${stormNumber}${year}_${stormName}.pdf`;
```

### Step 4: Add Custom Enhancements
- **Narratives**: AI-generated historical descriptions
- **Multi-state landfall**: Track analysis for state impacts
- **Red Cross data**: Response operations, shelter statistics
- **Economic impact**: Damage estimates, insurance claims

### Step 5: Validate and Test
```bash
# Validate JSON syntax
node -e "require('./atlantic-storms-enhanced.js')"

# Check storm count
grep -c "storm_id" atlantic-storms-enhanced.js

# Test in application
./run-local.sh
```

## Database Schema

```javascript
{
  "storm_id": "AL092022",           // HURDAT2 identifier
  "name": "IAN",                    // Storm name
  "year": 2022,                     // Year
  "month": 9,                       // Month (1-12)
  "day": 28,                        // Day of landfall
  "category": 4,                    // Saffir-Simpson (0-5)
  "wind_mph": 150,                  // Max sustained winds
  "wind_knots": 130,                // Max winds in knots
  "pressure": 937,                  // Min pressure (mb)
  "ace": 12.5,                      // Accumulated Cyclone Energy
  "lat": 26.7,                      // Landfall latitude
  "lon": -82.2,                     // Landfall longitude
  "landfall_states": ["FL"],        // Affected states
  "deaths": 150,                    // Fatalities
  "damage_millions": 112900,        // Damage in millions USD
  "narrative": "...",               // Historical narrative
  
  // Future enhancements
  "tcr_url": "...",                 // Link to TCR PDF
  "kmz_url": "...",                 // Link to KMZ file
  "shp_url": "...",                 // Link to shapefile
  "red_cross_response": {...},      // RC operations data
  "storm_surge_ft": 15,             // Peak storm surge
  "rainfall_inches": 20,            // Max rainfall
  "tornado_count": 12               // Associated tornadoes
}
```

## Automation Scripts

### Fetch Latest TCRs
```javascript
// fetchTCRs.js
const year = new Date().getFullYear();
const tcrIndex = `https://www.nhc.noaa.gov/data/tcr/index.php?season=${year}&basin=atl`;
// Parse HTML, extract PDF/KMZ/SHP links
// Download and store in /data/tcr/ directory
```

### Update Narratives
```javascript
// updateNarratives.js
// For storms without narratives:
// 1. Gather TCR summary
// 2. Generate narrative using AI
// 3. Add to database
```

## Regular Update Schedule

- **Daily** (Hurricane Season Jun-Nov): Check for new storms
- **Weekly**: Update active storm tracks
- **Monthly**: Validate data integrity
- **Annually** (April): Full HURDAT2 update
- **Post-Season** (December): Final TCR integration

## Quality Checks

1. **Data Completeness**
   - All storms have storm_id
   - Major hurricanes have narratives
   - Landfall storms have coordinates

2. **Cross-Validation**
   - Compare HURDAT2 vs TCR data
   - Verify state landfall assignments
   - Check category classifications

3. **Historical Accuracy**
   - Validate against historical records
   - Cross-reference damage/casualty figures
   - Verify dates and locations

## Backup Strategy

1. Version control all database updates
2. Keep previous 3 versions as backups
3. Document all manual corrections
4. Store original source files

## Red Cross Integration

Future fields to add:
- Shelters opened
- Meals served  
- Relief items distributed
- Volunteers deployed
- Blood drives conducted
- Financial assistance provided

## Contact

- **NOAA/NHC Data**: nhcwebmaster@noaa.gov
- **Project Lead**: jeff.franzen2@redcross.org
- **GitHub**: https://github.com/franzenjb/hurricane-dashboard-v2