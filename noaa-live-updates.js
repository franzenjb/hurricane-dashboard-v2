// NOAA Live Updates - Real-time Atlantic hurricane data
class NOAALiveUpdates {
    constructor() {
        // NOAA provides JSON feeds that are CORS-enabled
        this.feeds = {
            // Current storms GeoJSON feed
            activeStorms: 'https://www.nhc.noaa.gov/CurrentStorms.json',
            // RSS feed (XML) - we'll use a CORS proxy for this
            rssAtlantic: 'https://www.nhc.noaa.gov/nhc_at.xml'
        };
        
        // Use a public CORS proxy for XML feeds
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
    }

    async fetchActiveStorms() {
        try {
            console.log('Fetching active storms from:', this.feeds.activeStorms);
            const response = await fetch(this.feeds.activeStorms);
            
            if (!response.ok) {
                console.error('NOAA API response not OK:', response.status);
                throw new Error(`Failed to fetch active storms: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Active storms data received:', data);
            return this.processActiveStorms(data);
        } catch (error) {
            console.error('Error fetching active storms:', error);
            // Return sample data during development/testing
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                console.log('Using fallback data due to CORS/network issues');
                return {
                    activeStorms: [],
                    basinStatus: 'Data unavailable - CORS restriction',
                    error: true
                };
            }
            return { activeStorms: [], basinStatus: 'unknown' };
        }
    }

    processActiveStorms(data) {
        if (!data || !data.activeStorms) {
            return { activeStorms: [], basinStatus: 'quiet' };
        }

        const atlanticStorms = data.activeStorms.filter(storm => 
            storm.id && storm.id.startsWith('al')
        );

        return {
            activeStorms: atlanticStorms.map(storm => ({
                id: storm.id.toUpperCase(),
                name: storm.name || 'Unnamed',
                status: this.getStormStatus(storm),
                category: this.getStormCategory(storm),
                wind_mph: storm.maxWindMph || storm.intensity || 0,
                wind_knots: storm.maxWindKt || Math.round((storm.maxWindMph || 0) * 0.868976),
                pressure_mb: storm.minimumPressure || null,
                position: {
                    lat: storm.lat || storm.latitude,
                    lon: storm.lon || storm.longitude
                },
                movement: storm.movementText || 'Stationary',
                lastUpdate: storm.lastUpdate || storm.pubDate || new Date().toISOString()
            })),
            basinStatus: atlanticStorms.length > 0 ? 'active' : 'quiet',
            lastUpdate: new Date().toISOString()
        };
    }

    getStormStatus(storm) {
        const intensity = storm.intensity || storm.maxWindMph || 0;
        if (intensity >= 74) return 'Hurricane';
        if (intensity >= 39) return 'Tropical Storm';
        if (intensity >= 23) return 'Tropical Depression';
        return 'Disturbance';
    }

    getStormCategory(storm) {
        const wind = storm.maxWindMph || storm.intensity || 0;
        if (wind >= 157) return 5;
        if (wind >= 130) return 4;
        if (wind >= 111) return 3;
        if (wind >= 96) return 2;
        if (wind >= 74) return 1;
        if (wind >= 39) return 0; // TS
        return -1; // TD
    }

    async fetchAtlanticOutlook() {
        try {
            // Fetch the RSS feed through CORS proxy
            const response = await fetch(this.corsProxy + encodeURIComponent(this.feeds.rssAtlantic));
            if (!response.ok) throw new Error('Failed to fetch outlook');
            
            const xmlText = await response.text();
            return this.parseOutlookFromRSS(xmlText);
        } catch (error) {
            console.error('Error fetching Atlantic outlook:', error);
            return this.getDefaultOutlook();
        }
    }

    parseOutlookFromRSS(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            // Find the Tropical Weather Outlook item
            const items = xmlDoc.querySelectorAll('item');
            let outlookItem = null;
            
            for (let item of items) {
                const title = item.querySelector('title')?.textContent || '';
                if (title.includes('Tropical Weather Outlook')) {
                    outlookItem = item;
                    break;
                }
            }

            if (!outlookItem) {
                return this.getDefaultOutlook();
            }

            const description = outlookItem.querySelector('description')?.textContent || '';
            const pubDate = outlookItem.querySelector('pubDate')?.textContent || '';
            
            // Parse formation chances from description
            const formation48hr = this.parseFormationChance(description, '48 hours');
            const formation7day = this.parseFormationChance(description, '7 days');
            
            return {
                title: 'Atlantic Tropical Weather Outlook',
                issued: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                discussion: this.cleanDescription(description),
                formation_chance_48hr: formation48hr,
                formation_chance_7day: formation7day,
                status: this.getOutlookStatus(formation7day),
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing RSS:', error);
            return this.getDefaultOutlook();
        }
    }

    parseFormationChance(text, timeframe) {
        const regex = new RegExp(`(\\d+)\\s*(?:percent|%).*?${timeframe}`, 'i');
        const match = text.match(regex);
        return match ? parseInt(match[1]) : 0;
    }

    cleanDescription(desc) {
        // Remove HTML tags and clean up text
        return desc.replace(/<[^>]*>/g, '')
                   .replace(/&nbsp;/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim()
                   .substring(0, 200) + '...';
    }

    getOutlookStatus(formation7day) {
        if (formation7day >= 60) return 'HIGH';
        if (formation7day >= 40) return 'MEDIUM';
        if (formation7day >= 20) return 'LOW';
        return 'QUIET';
    }

    getDefaultOutlook() {
        const currentMonth = new Date().getMonth();
        const isHurricaneSeason = currentMonth >= 5 && currentMonth <= 10; // June-November
        
        return {
            title: 'Atlantic Tropical Weather Outlook',
            issued: new Date().toISOString(),
            discussion: isHurricaneSeason 
                ? 'Tropical weather conditions are being monitored.'
                : 'No tropical cyclone activity is expected at this time.',
            formation_chance_48hr: 0,
            formation_chance_7day: 0,
            status: 'QUIET',
            lastUpdate: new Date().toISOString()
        };
    }

    async updateDashboard() {
        console.log('Updating NOAA dashboard...');
        
        // Update both outlook and active storms
        const [outlook, storms] = await Promise.all([
            this.fetchAtlanticOutlook(),
            this.fetchActiveStorms()
        ]);

        // Update Atlantic Outlook
        const outlookStatus = document.querySelector('.bg-white .text-green-800');
        const outlookText = document.querySelector('.bg-white .text-gray-600');
        const outlookTime = document.getElementById('outlookTime');

        if (outlookStatus) {
            if (outlook.error) {
                outlookStatus.textContent = 'ERROR';
                outlookStatus.className = 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
            } else {
                outlookStatus.textContent = outlook.status;
                outlookStatus.className = `px-2 py-1 text-xs rounded-full ${this.getStatusColor(outlook.status)}`;
            }
        }
        
        if (outlookText) {
            if (outlook.error) {
                outlookText.textContent = 'Unable to fetch NOAA data. Check console for details.';
            } else if (outlook.formation_chance_7day > 0) {
                outlookText.textContent = `${outlook.formation_chance_48hr}% chance in 48 hours, ${outlook.formation_chance_7day}% chance in 7 days.`;
            } else {
                outlookText.textContent = outlook.discussion;
            }
        }

        if (outlookTime) {
            outlookTime.textContent = this.getTimeAgo(new Date(outlook.lastUpdate));
        }

        // Update Active Storms
        const activeStormsCount = document.querySelector('.text-blue-800');
        const activeStormsList = document.querySelector('.bg-white:nth-child(2) .text-gray-600');

        if (activeStormsCount) {
            activeStormsCount.textContent = `${storms.activeStorms.length} ACTIVE`;
        }

        if (activeStormsList) {
            if (storms.activeStorms.length > 0) {
                const stormList = storms.activeStorms.map(storm => 
                    `<div class="mb-2">
                        <strong>${storm.status} ${storm.name}</strong><br>
                        <span class="text-xs">Wind: ${storm.wind_mph} mph | ${storm.movement}</span>
                    </div>`
                ).join('');
                activeStormsList.innerHTML = stormList;
            } else {
                activeStormsList.textContent = 'No active tropical cyclones in the Atlantic basin.';
            }
        }

        return { outlook, storms };
    }

    getStatusColor(status) {
        const colors = {
            'QUIET': 'bg-green-100 text-green-800',
            'LOW': 'bg-yellow-100 text-yellow-800',
            'MEDIUM': 'bg-orange-100 text-orange-800',
            'HIGH': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        
        return date.toLocaleDateString();
    }

    // Initialize auto-refresh
    startAutoRefresh(intervalMinutes = 15) {
        // Update immediately
        this.updateDashboard();
        
        // Then update every X minutes
        this.refreshInterval = setInterval(() => {
            this.updateDashboard();
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.noaaLiveUpdates = new NOAALiveUpdates();
}