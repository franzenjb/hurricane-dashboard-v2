#!/usr/bin/env node

/**
 * NOAA TCR Data Fetcher and Parser
 * Automatically downloads and integrates Tropical Cyclone Reports
 * 
 * Features:
 * - Downloads PDF reports with detailed narratives
 * - Fetches KMZ files for Google Earth visualization
 * - Gets shapefiles for precise GIS analysis
 * - Extracts key statistics from reports
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class TCRFetcher {
    constructor() {
        this.baseUrl = 'https://www.nhc.noaa.gov/data/tcr';
        this.dataDir = './data/tcr';
        this.enhancedData = [];
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Fetch all TCRs for a given year
     */
    async fetchYearData(year) {
        console.log(`🌀 Fetching TCR data for ${year}...`);
        
        const indexUrl = `${this.baseUrl}/index.php?season=${year}&basin=atl`;
        
        try {
            // Get the index page
            const html = await this.fetchUrl(indexUrl);
            
            // Parse storm reports from HTML
            const storms = this.parseStormList(html, year);
            
            // Download each storm's resources
            for (const storm of storms) {
                await this.downloadStormResources(storm);
                await this.extractStormData(storm);
            }
            
            return storms;
        } catch (error) {
            console.error(`Error fetching ${year} data:`, error);
            return [];
        }
    }

    /**
     * Parse storm list from TCR index page
     */
    parseStormList(html, year) {
        const storms = [];
        const stormRegex = /AL(\d{2})(\d{4})_([A-Z]+)\.pdf/g;
        let match;
        
        while ((match = stormRegex.exec(html)) !== null) {
            const [fullMatch, stormNum, stormYear, name] = match;
            
            if (stormYear === year.toString()) {
                storms.push({
                    storm_id: `AL${stormNum}${stormYear}`,
                    storm_number: stormNum,
                    year: parseInt(stormYear),
                    name: name,
                    tcr_pdf: `${this.baseUrl}/AL${stormNum}${stormYear}_${name}.pdf`,
                    tcr_kmz: `${this.baseUrl}/AL${stormNum}${stormYear}_${name}.kmz`,
                    tcr_shp: `${this.baseUrl}/AL${stormNum}${stormYear}_${name}_5day.zip`,
                    local_files: {}
                });
            }
        }
        
        return storms;
    }

    /**
     * Download all resources for a storm
     */
    async downloadStormResources(storm) {
        console.log(`  📥 Downloading resources for ${storm.name} (${storm.storm_id})...`);
        
        const stormDir = path.join(this.dataDir, storm.storm_id);
        if (!fs.existsSync(stormDir)) {
            fs.mkdirSync(stormDir, { recursive: true });
        }
        
        // Download PDF report
        if (storm.tcr_pdf) {
            const pdfPath = path.join(stormDir, `${storm.storm_id}_report.pdf`);
            await this.downloadFile(storm.tcr_pdf, pdfPath);
            storm.local_files.pdf = pdfPath;
        }
        
        // Download KMZ file
        if (storm.tcr_kmz) {
            const kmzPath = path.join(stormDir, `${storm.storm_id}_track.kmz`);
            await this.downloadFile(storm.tcr_kmz, kmzPath);
            storm.local_files.kmz = kmzPath;
        }
        
        // Download shapefile
        if (storm.tcr_shp) {
            const shpPath = path.join(stormDir, `${storm.storm_id}_gis.zip`);
            await this.downloadFile(storm.tcr_shp, shpPath);
            storm.local_files.shp = shpPath;
        }
    }

    /**
     * Extract key data from TCR (would need PDF parsing library)
     */
    async extractStormData(storm) {
        // This is where we'd extract data from the PDF
        // For now, we'll create a structure for the enhanced data
        
        storm.tcr_data = {
            // Meteorological Statistics
            peak_intensity_mph: null,
            peak_intensity_mb: null,
            peak_intensity_date: null,
            
            // Impact Statistics
            total_fatalities: null,
            direct_deaths: null,
            indirect_deaths: null,
            missing_persons: null,
            
            // Damage Assessment
            total_damage_usd: null,
            insured_losses_usd: null,
            agricultural_losses_usd: null,
            
            // Storm Surge
            peak_surge_ft: null,
            surge_location: null,
            
            // Rainfall
            peak_rainfall_inches: null,
            rainfall_location: null,
            
            // Tornadoes
            tornado_count: null,
            ef2_plus_tornadoes: null,
            
            // Response Metrics
            evacuations_ordered: null,
            shelters_opened: null,
            power_outages_peak: null,
            
            // Red Cross Response (to be added)
            red_cross_response: {
                shelters_managed: null,
                meals_served: null,
                relief_items: null,
                volunteers_deployed: null,
                mental_health_contacts: null,
                health_services_contacts: null,
                casework_households: null,
                financial_assistance_usd: null
            },
            
            // Official Narrative (extracted from PDF)
            official_summary: null,
            synoptic_history: null,
            
            // Links to resources
            resources: {
                pdf_url: storm.tcr_pdf,
                kmz_url: storm.tcr_kmz,
                shp_url: storm.tcr_shp,
                noaa_page: `https://www.nhc.noaa.gov/data/tcr/index.php?season=${storm.year}&basin=atl`,
                best_track: `https://www.nhc.noaa.gov/data/hurdat/hurdat2-format-atl-1851-${storm.year}.txt`
            }
        };
        
        return storm;
    }

    /**
     * Merge TCR data with existing database
     */
    async mergeWithDatabase() {
        console.log('🔄 Merging TCR data with master database...');
        
        // Load existing database
        const dbPath = './atlantic-storms-enhanced.js';
        let existingDb = require(dbPath);
        
        // Create a map for quick lookup
        const stormMap = new Map();
        existingDb.forEach(storm => {
            stormMap.set(storm.storm_id, storm);
        });
        
        // Merge TCR data
        this.enhancedData.forEach(tcrStorm => {
            if (stormMap.has(tcrStorm.storm_id)) {
                const existingStorm = stormMap.get(tcrStorm.storm_id);
                
                // Merge TCR data into existing storm
                existingStorm.tcr_data = tcrStorm.tcr_data;
                existingStorm.tcr_resources = tcrStorm.resources;
                
                // Update fields if TCR has better data
                if (tcrStorm.tcr_data.total_fatalities !== null) {
                    existingStorm.deaths = tcrStorm.tcr_data.total_fatalities;
                }
                if (tcrStorm.tcr_data.total_damage_usd !== null) {
                    existingStorm.damage_millions = tcrStorm.tcr_data.total_damage_usd / 1000000;
                }
                if (tcrStorm.tcr_data.official_summary) {
                    existingStorm.tcr_narrative = tcrStorm.tcr_data.official_summary;
                }
            }
        });
        
        // Convert map back to array
        const enhancedDb = Array.from(stormMap.values());
        
        // Write enhanced database
        const output = `// Enhanced Atlantic Hurricane Database (HURDAT2) 1851-2024
// Includes multi-state landfall detection, AI narratives, and TCR integration
// Last updated: ${new Date().toISOString()}

const ATLANTIC_STORMS_ENHANCED = ${JSON.stringify(enhancedDb, null, 2)};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ATLANTIC_STORMS_ENHANCED;
}`;
        
        fs.writeFileSync(dbPath, output);
        console.log('✅ Database updated successfully!');
    }

    /**
     * Helper function to fetch URL content
     */
    fetchUrl(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    }

    /**
     * Helper function to download file
     */
    downloadFile(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(err);
            });
        });
    }
}

// Run the fetcher
async function main() {
    const fetcher = new TCRFetcher();
    
    // Fetch recent years
    const currentYear = new Date().getFullYear();
    const yearsToFetch = [currentYear, currentYear - 1, currentYear - 2];
    
    for (const year of yearsToFetch) {
        const storms = await fetcher.fetchYearData(year);
        fetcher.enhancedData.push(...storms);
    }
    
    // Merge with database
    await fetcher.mergeWithDatabase();
    
    console.log('🎉 TCR integration complete!');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = TCRFetcher;