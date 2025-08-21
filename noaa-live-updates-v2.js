// NOAA Live Updates V2 - Using Cloudflare Worker
// This version fetches real NOAA data through your Cloudflare Worker

class NOAALiveUpdates {
    constructor() {
        // IMPORTANT: Update this URL after deploying your Cloudflare Worker!
        this.workerUrl = 'https://noaa-hurricane-proxy.jbf-395.workers.dev';
        
        // Cache duration in milliseconds
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.cache = new Map();
    }

    // Fetch data from worker with caching
    async fetchFromWorker(endpoint) {
        const cacheKey = `noaa-${endpoint}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`Using cached data for ${endpoint}`);
                return cached.data;
            }
        }

        try {
            console.log(`Fetching ${endpoint} from worker...`);
            const response = await fetch(`${this.workerUrl}?endpoint=${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`Worker returned ${response.status}`);
            }
            
            const contentType = response.headers.get('Content-Type');
            const data = contentType?.includes('json') 
                ? await response.json() 
                : await response.text();
            
            // Cache the data
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    // Fetch and process active storms
    async fetchActiveStorms() {
        try {
            const data = await this.fetchFromWorker('storms');
            
            // NOAA CurrentStorms.json format
            if (!data.activeStorms || !Array.isArray(data.activeStorms)) {
                return { activeStorms: [], basinStatus: 'quiet' };
            }
            
            // Filter for Atlantic storms (AL prefix)
            const atlanticStorms = data.activeStorms.filter(storm => {
                const id = storm.id || storm.stormId || '';
                return id.toLowerCase().startsWith('al');
            });
            
            // Process each storm
            const processedStorms = atlanticStorms.map(storm => {
                const windMph = storm.intensity || storm.maxWindMph || 0;
                const category = this.getCategory(windMph);
                
                return {
                    id: (storm.id || storm.stormId || '').toUpperCase(),
                    name: storm.name || 'UNNAMED',
                    status: this.getStatus(storm.classification || storm.status),
                    category: category,
                    wind_mph: windMph,
                    wind_knots: Math.round(windMph / 1.15078),
                    pressure_mb: storm.pressure || storm.minimumPressure || null,
                    position: {
                        lat: storm.latitude || storm.lat || 0,
                        lon: storm.longitude || storm.lon || 0
                    },
                    movement: storm.movement || storm.movementText || 'Stationary',
                    lastUpdate: storm.lastUpdate || new Date().toISOString()
                };
            });
            
            return {
                activeStorms: processedStorms,
                basinStatus: processedStorms.length > 0 ? 'active' : 'quiet',
                lastUpdate: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error processing active storms:', error);
            return { 
                activeStorms: [], 
                basinStatus: 'error',
                error: error.message 
            };
        }
    }

    // Fetch and process Atlantic outlook
    async fetchAtlanticOutlook() {
        try {
            const xmlText = await this.fetchFromWorker('outlook');
            return this.parseOutlookXML(xmlText);
        } catch (error) {
            console.error('Error fetching outlook:', error);
            return this.getDefaultOutlook();
        }
    }

    // Parse outlook from RSS XML
    parseOutlookXML(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for parse errors
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('Invalid XML');
            }
            
            // Find the Atlantic Tropical Weather Outlook item
            const items = xmlDoc.querySelectorAll('item');
            let outlookItem = null;
            
            for (let item of items) {
                const title = item.querySelector('title')?.textContent || '';
                if (title.includes('Atlantic Tropical Weather Outlook')) {
                    outlookItem = item;
                    break;
                }
            }
            
            if (!outlookItem) {
                return this.getDefaultOutlook();
            }
            
            const description = outlookItem.querySelector('description')?.textContent || '';
            const pubDate = outlookItem.querySelector('pubDate')?.textContent || '';
            
            // Extract formation chances using regex
            const formation48hr = this.extractPercentage(description, '48 hours|two days|2 days');
            const formation7day = this.extractPercentage(description, '7 days|seven days|one week');
            
            // Determine outlook status based on percentages
            const maxChance = Math.max(formation48hr, formation7day);
            let status = 'QUIET';
            if (maxChance >= 70) status = 'HIGH';
            else if (maxChance >= 40) status = 'MEDIUM';
            else if (maxChance >= 20) status = 'LOW';
            
            return {
                title: 'Atlantic Tropical Weather Outlook',
                issued: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                discussion: this.cleanDescription(description),
                formation_chance_48hr: formation48hr,
                formation_chance_7day: formation7day,
                status: status,
                areas_of_interest: this.extractAreasOfInterest(description),
                lastUpdate: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error parsing outlook XML:', error);
            return this.getDefaultOutlook();
        }
    }

    // Extract percentage from text
    extractPercentage(text, timePattern) {
        const regex = new RegExp(`(\\d+)\\s*(?:percent|%).*?(?:${timePattern})`, 'i');
        const reverseRegex = new RegExp(`(?:${timePattern}).*?(\\d+)\\s*(?:percent|%)`, 'i');
        
        let match = text.match(regex) || text.match(reverseRegex);
        return match ? parseInt(match[1]) : 0;
    }

    // Extract areas of interest from outlook
    extractAreasOfInterest(text) {
        const areas = [];
        
        // Look for invest areas (e.g., "Invest 90L")
        const investRegex = /invest\s+(\d+[A-Z])/gi;
        let match;
        while ((match = investRegex.exec(text)) !== null) {
            areas.push({
                type: 'invest',
                name: match[0],
                id: match[1]
            });
        }
        
        // Look for disturbance mentions
        if (text.match(/tropical wave|disturbance|area of low pressure/i)) {
            areas.push({
                type: 'disturbance',
                name: 'Area of Interest'
            });
        }
        
        return areas;
    }

    // Clean description text
    cleanDescription(desc) {
        return desc
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 300) + '...';
    }

    // Get storm category from wind speed
    getCategory(windMph) {
        if (windMph >= 157) return 5;
        if (windMph >= 130) return 4;
        if (windMph >= 111) return 3;
        if (windMph >= 96) return 2;
        if (windMph >= 74) return 1;
        if (windMph >= 39) return 0; // TS
        return -1; // TD
    }

    // Get storm status from classification
    getStatus(classification) {
        const statusMap = {
            'TD': 'Tropical Depression',
            'TS': 'Tropical Storm',
            'HU': 'Hurricane',
            'MH': 'Major Hurricane',
            'PTC': 'Potential Tropical Cyclone',
            'STD': 'Subtropical Depression',
            'STS': 'Subtropical Storm'
        };
        return statusMap[classification] || classification || 'Unknown';
    }

    // Get default outlook for quiet periods
    getDefaultOutlook() {
        const currentMonth = new Date().getMonth();
        const isHurricaneSeason = currentMonth >= 5 && currentMonth <= 10;
        
        return {
            title: 'Atlantic Tropical Weather Outlook',
            issued: new Date().toISOString(),
            discussion: isHurricaneSeason 
                ? 'Tropical cyclone formation is not expected during the next 7 days.'
                : 'The Atlantic hurricane season runs from June 1st through November 30th.',
            formation_chance_48hr: 0,
            formation_chance_7day: 0,
            status: 'QUIET',
            areas_of_interest: [],
            lastUpdate: new Date().toISOString()
        };
    }

    // Update dashboard with latest data
    async updateDashboard() {
        console.log('Updating NOAA dashboard...');
        
        try {
            // Fetch both data sources in parallel
            const [outlook, storms] = await Promise.all([
                this.fetchAtlanticOutlook(),
                this.fetchActiveStorms()
            ]);
            
            // Update Atlantic Outlook
            this.updateOutlookDisplay(outlook);
            
            // Update Active Storms
            this.updateStormsDisplay(storms);
            
            // Update season year
            const seasonYear = document.getElementById('seasonYear');
            if (seasonYear) {
                seasonYear.textContent = new Date().getFullYear();
            }
            
            console.log('Dashboard updated successfully');
            return { outlook, storms };
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError('Unable to fetch NOAA data');
        }
    }

    // Update outlook display
    updateOutlookDisplay(outlook) {
        const outlookStatus = document.querySelector('.bg-white .text-green-800');
        const outlookText = document.querySelector('.bg-white .text-gray-600');
        const outlookTime = document.getElementById('outlookTime');
        
        if (outlookStatus) {
            outlookStatus.textContent = outlook.status;
            outlookStatus.className = `px-2 py-1 text-xs rounded-full ${this.getStatusColor(outlook.status)}`;
        }
        
        if (outlookText) {
            if (outlook.formation_chance_7day > 0 || outlook.formation_chance_48hr > 0) {
                outlookText.innerHTML = `
                    <div class="space-y-1">
                        <div class="flex justify-between">
                            <span>48 hours:</span>
                            <span class="font-semibold">${outlook.formation_chance_48hr}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>7 days:</span>
                            <span class="font-semibold">${outlook.formation_chance_7day}%</span>
                        </div>
                        ${outlook.areas_of_interest.length > 0 ? `
                            <div class="text-xs mt-2 text-gray-500">
                                Monitoring: ${outlook.areas_of_interest.map(a => a.name).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                outlookText.textContent = outlook.discussion;
            }
        }
        
        if (outlookTime) {
            outlookTime.textContent = this.getTimeAgo(new Date(outlook.lastUpdate));
        }
    }

    // Update storms display
    updateStormsDisplay(storms) {
        const stormsCount = document.querySelector('.text-blue-800');
        const stormsList = document.querySelector('.bg-white:nth-child(2) .text-gray-600');
        
        if (stormsCount) {
            stormsCount.textContent = `${storms.activeStorms.length} ACTIVE`;
            
            // Update color based on storm count
            const bgColor = storms.activeStorms.length > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            stormsCount.className = `px-2 py-1 text-xs rounded-full ${bgColor}`;
        }
        
        if (stormsList) {
            if (storms.activeStorms.length > 0) {
                stormsList.innerHTML = storms.activeStorms.map(storm => {
                    const catColor = this.getCategoryColor(storm.category);
                    return `
                        <div class="border-b border-gray-200 pb-2 mb-2 last:border-0">
                            <div class="flex items-center gap-2">
                                <span class="inline-block w-3 h-3 rounded-full ${catColor}"></span>
                                <span class="font-bold text-sm">${storm.status} ${storm.name}</span>
                            </div>
                            <div class="text-xs text-gray-600 mt-1">
                                Wind: ${storm.wind_mph} mph | Pressure: ${storm.pressure_mb || 'N/A'} mb
                            </div>
                            <div class="text-xs text-gray-500">
                                Location: ${storm.position.lat.toFixed(1)}°N, ${Math.abs(storm.position.lon).toFixed(1)}°W
                            </div>
                            <div class="text-xs text-gray-500">
                                Movement: ${storm.movement}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                stormsList.innerHTML = `
                    <div class="text-center text-gray-500">
                        <p>No active tropical cyclones in the Atlantic basin.</p>
                        ${storms.basinStatus === 'error' ? 
                            '<p class="text-xs text-red-600 mt-2">Error loading data</p>' : 
                            ''
                        }
                    </div>
                `;
            }
        }
    }

    // Get status color classes
    getStatusColor(status) {
        const colors = {
            'QUIET': 'bg-green-100 text-green-800',
            'LOW': 'bg-yellow-100 text-yellow-800',
            'MEDIUM': 'bg-orange-100 text-orange-800',
            'HIGH': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // Get category color for storm dots
    getCategoryColor(category) {
        const colors = {
            '-1': 'bg-blue-300',    // TD
            '0': 'bg-green-400',    // TS
            '1': 'bg-yellow-400',   // Cat 1
            '2': 'bg-orange-400',   // Cat 2
            '3': 'bg-red-500',      // Cat 3
            '4': 'bg-red-700',      // Cat 4
            '5': 'bg-purple-700'    // Cat 5
        };
        return colors[category] || 'bg-gray-400';
    }

    // Get time ago string
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        
        return date.toLocaleDateString();
    }

    // Show error message
    showError(message) {
        const outlookText = document.querySelector('.bg-white .text-gray-600');
        if (outlookText) {
            outlookText.innerHTML = `<span class="text-red-600">${message}</span>`;
        }
    }

    // Initialize auto-refresh
    startAutoRefresh(intervalMinutes = 15) {
        // Update immediately
        this.updateDashboard();
        
        // Then update every X minutes
        this.refreshInterval = setInterval(() => {
            this.updateDashboard();
        }, intervalMinutes * 60 * 1000);
        
        console.log(`NOAA auto-refresh started (every ${intervalMinutes} minutes)`);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            console.log('NOAA auto-refresh stopped');
        }
    }
}

// Initialize when ready
if (typeof window !== 'undefined') {
    window.NOAALiveUpdatesV2 = NOAALiveUpdates;
}