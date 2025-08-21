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
                const windMph = parseInt(storm.intensity) || parseInt(storm.maxWindMph) || 0;
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
            
            // Update combined display
            this.updateCombinedDisplay(storms, outlook);
            
            console.log('Dashboard updated successfully');
            console.log('Active storms:', storms.activeStorms.length);
            console.log('Formation outlook:', outlook.formation_chance_7day + '%');
            
            return { outlook, storms };
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError('Unable to fetch NOAA data');
        }
    }

    // Update combined display
    updateCombinedDisplay(storms, outlook) {
        const statusBadge = document.getElementById('noaaStatusBadge');
        const mainContent = document.getElementById('noaaMainContent');
        const updateTime = document.getElementById('noaaUpdateTime');
        
        // Determine overall status
        let overallStatus = 'QUIET';
        let statusColor = 'bg-green-100 text-green-800';
        
        if (storms.activeStorms.length > 0) {
            const hasHurricane = storms.activeStorms.some(s => s.category >= 1);
            const hasMajor = storms.activeStorms.some(s => s.category >= 3);
            
            if (hasMajor) {
                overallStatus = `${storms.activeStorms.length} ACTIVE - MAJOR HURRICANE`;
                statusColor = 'bg-red-100 text-red-800';
            } else if (hasHurricane) {
                overallStatus = `${storms.activeStorms.length} ACTIVE - HURRICANE`;
                statusColor = 'bg-orange-100 text-orange-800';
            } else {
                overallStatus = `${storms.activeStorms.length} ACTIVE`;
                statusColor = 'bg-yellow-100 text-yellow-800';
            }
        } else if (outlook && (outlook.formation_chance_48hr >= 40 || outlook.formation_chance_7day >= 40)) {
            overallStatus = 'MONITORING AREA';
            statusColor = 'bg-yellow-100 text-yellow-800';
        }
        
        if (statusBadge) {
            statusBadge.textContent = overallStatus;
            statusBadge.className = `px-3 py-1 ${statusColor} text-sm rounded-full font-semibold`;
        }
        
        // Build main content
        let contentHTML = '';
        
        // Active storms section
        if (storms.activeStorms.length > 0) {
            contentHTML += `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 class="font-bold text-red-800 mb-3">Active Tropical Cyclones</h4>
                    <div class="space-y-3">
            `;
            
            storms.activeStorms.forEach(storm => {
                const catColor = this.getCategoryColorClasses(storm.category);
                const catName = this.getCategoryName(storm.category);
                
                contentHTML += `
                    <div class="bg-white rounded border border-red-200 p-3">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="inline-block w-3 h-3 rounded-full ${catColor.dot}"></span>
                                    <span class="font-bold">${catName} ${storm.name}</span>
                                </div>
                                <div class="text-sm text-gray-700 mt-1">
                                    Wind: ${storm.wind_mph} mph • Pressure: ${storm.pressure_mb || 'N/A'} mb
                                </div>
                                <div class="text-xs text-gray-600 mt-1">
                                    ${storm.position.lat.toFixed(1)}°N, ${Math.abs(storm.position.lon).toFixed(1)}°W • ${storm.movement}
                                </div>
                            </div>
                            <a href="https://www.nhc.noaa.gov/graphics_${storm.id.toLowerCase().replace('al', 'at')}.shtml" 
                               target="_blank" 
                               class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                                Track →
                            </a>
                        </div>
                    </div>
                `;
            });
            
            contentHTML += `
                    </div>
                </div>
            `;
        }
        
        // Formation outlook section
        if (outlook && (outlook.formation_chance_48hr > 0 || outlook.formation_chance_7day > 0)) {
            const outlookColor = outlook.formation_chance_7day >= 70 ? 'orange' : 
                               outlook.formation_chance_7day >= 40 ? 'yellow' : 'blue';
            
            contentHTML += `
                <div class="bg-${outlookColor}-50 border border-${outlookColor}-200 rounded-lg p-4">
                    <h4 class="font-bold text-${outlookColor}-800 mb-2">Formation Outlook</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-${outlookColor}-800">${outlook.formation_chance_48hr}%</div>
                            <div class="text-xs text-gray-600">48 hours</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-${outlookColor}-800">${outlook.formation_chance_7day}%</div>
                            <div class="text-xs text-gray-600">7 days</div>
                        </div>
                    </div>
                    ${outlook.areas_of_interest.length > 0 ? `
                        <div class="text-sm text-gray-700 mt-3">
                            Monitoring: ${outlook.areas_of_interest.map(a => a.name).join(', ')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Quiet period message
        if (storms.activeStorms.length === 0 && (!outlook || (outlook.formation_chance_48hr === 0 && outlook.formation_chance_7day === 0))) {
            contentHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-lg font-semibold text-gray-700">All Clear in the Atlantic Basin</p>
                    <p class="text-sm text-gray-600 mt-2">No tropical cyclone activity expected in the next 7 days</p>
                </div>
            `;
        }
        
        if (mainContent) {
            mainContent.innerHTML = contentHTML;
        }
        
        if (updateTime) {
            updateTime.textContent = this.getTimeAgo(new Date());
        }
    }

    // Get category name
    getCategoryName(category) {
        const names = {
            '-1': 'Tropical Depression',
            '0': 'Tropical Storm',
            '1': 'Category 1 Hurricane',
            '2': 'Category 2 Hurricane',
            '3': 'Category 3 Hurricane',
            '4': 'Category 4 Hurricane',
            '5': 'Category 5 Hurricane'
        };
        return names[category] || 'Unknown';
    }
    
    // Get category color classes
    getCategoryColorClasses(category) {
        const colors = {
            '-1': { dot: 'bg-blue-300', text: 'text-blue-700' },
            '0': { dot: 'bg-green-400', text: 'text-green-700' },
            '1': { dot: 'bg-yellow-400', text: 'text-yellow-700' },
            '2': { dot: 'bg-orange-400', text: 'text-orange-700' },
            '3': { dot: 'bg-red-500', text: 'text-red-700' },
            '4': { dot: 'bg-red-700', text: 'text-red-800' },
            '5': { dot: 'bg-purple-700', text: 'text-purple-800' }
        };
        return colors[category] || { dot: 'bg-gray-400', text: 'text-gray-700' };
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