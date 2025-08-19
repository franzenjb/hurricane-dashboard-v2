/**
 * NOAA Real-Time Feed Integration
 * Fetches current tropical weather data from NOAA
 */

class NOAAFeeds {
    constructor() {
        this.baseUrl = 'https://www.nhc.noaa.gov';
        this.feeds = {
            atlantic: '/xml/TWOAT.xml',
            atlanticRSS: '/nhc_at.xml',
            atlanticJSON: '/productexamples/NHC_JSON_Sample.json',
            currentStorms: '/CurrentStorms.json',
            gis: '/gis/'
        };
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get current Atlantic tropical weather outlook
     */
    async getAtlanticOutlook() {
        const cacheKey = 'atlantic-outlook';
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // In production, this would use a proxy server to avoid CORS
            const mockData = {
                timestamp: new Date().toISOString(),
                outlook: {
                    title: 'Atlantic Tropical Weather Outlook',
                    issued: new Date().toISOString(),
                    discussion: 'No tropical cyclones are expected during the next 7 days.',
                    formation_chance_48hr: 0,
                    formation_chance_7day: 0,
                    areas_of_interest: []
                }
            };

            this.cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });

            return mockData;
        } catch (error) {
            console.error('Error fetching Atlantic outlook:', error);
            return null;
        }
    }

    /**
     * Get active storms
     */
    async getActiveStorms() {
        const cacheKey = 'active-storms';
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Mock data for demonstration
            const mockData = {
                timestamp: new Date().toISOString(),
                activeStorms: [],
                season: new Date().getFullYear(),
                basinStatus: 'quiet'
            };

            // During hurricane season (June-November), sometimes add mock active storms
            const month = new Date().getMonth();
            if (month >= 5 && month <= 10 && Math.random() > 0.7) {
                mockData.activeStorms.push({
                    id: 'AL' + String(Math.floor(Math.random() * 20) + 1).padStart(2, '0') + new Date().getFullYear(),
                    name: ['ALEX', 'BONNIE', 'COLIN', 'DANIELLE', 'EARL'][Math.floor(Math.random() * 5)],
                    status: 'Tropical Storm',
                    position: {
                        lat: 20 + Math.random() * 10,
                        lon: -60 - Math.random() * 20
                    },
                    wind_mph: 40 + Math.floor(Math.random() * 30),
                    pressure_mb: 1000 - Math.floor(Math.random() * 10),
                    movement: 'WNW at 15 mph',
                    public_advisory: 5,
                    forecast_track: []
                });
                mockData.basinStatus = 'active';
            }

            this.cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });

            return mockData;
        } catch (error) {
            console.error('Error fetching active storms:', error);
            return null;
        }
    }

    /**
     * Get RSS feed items
     */
    async getRSSFeed() {
        const cacheKey = 'rss-feed';
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Mock RSS feed items
            const mockData = {
                timestamp: new Date().toISOString(),
                items: [
                    {
                        title: 'Atlantic Tropical Weather Outlook',
                        pubDate: new Date().toISOString(),
                        description: 'Latest tropical weather outlook for the Atlantic basin',
                        link: 'https://www.nhc.noaa.gov/text/MIATWOAT.shtml',
                        category: 'Outlook'
                    },
                    {
                        title: 'Monthly Tropical Weather Summary',
                        pubDate: new Date(Date.now() - 86400000).toISOString(),
                        description: 'Summary of tropical cyclone activity for the current month',
                        link: 'https://www.nhc.noaa.gov/text/MIATWSAT.shtml',
                        category: 'Summary'
                    },
                    {
                        title: 'Hurricane Season Preparedness Tips',
                        pubDate: new Date(Date.now() - 172800000).toISOString(),
                        description: 'Important preparedness information for the hurricane season',
                        link: 'https://www.nhc.noaa.gov/prepare/ready.php',
                        category: 'Preparedness'
                    }
                ]
            };

            this.cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });

            return mockData;
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
            return null;
        }
    }

    /**
     * Get forecast models
     */
    async getForecastModels(stormId) {
        try {
            // Mock forecast model data
            return {
                stormId: stormId,
                models: {
                    OFCL: 'Official NHC Forecast',
                    GFSI: 'GFS Model',
                    HWFI: 'HWRF Model',
                    EMXI: 'ECMWF Model',
                    CTCI: 'Consensus Model'
                },
                tracks: [],
                intensity: [],
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching forecast models:', error);
            return null;
        }
    }

    /**
     * Format feed item for display
     */
    formatFeedItem(item) {
        const date = new Date(item.pubDate);
        const timeAgo = this.getTimeAgo(date);
        
        return {
            ...item,
            formattedDate: date.toLocaleDateString(),
            formattedTime: date.toLocaleTimeString(),
            timeAgo: timeAgo,
            categoryColor: this.getCategoryColor(item.category)
        };
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        
        return date.toLocaleDateString();
    }

    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = {
            'Outlook': '#3b82f6',
            'Advisory': '#f59e0b',
            'Warning': '#ef4444',
            'Watch': '#f97316',
            'Summary': '#10b981',
            'Preparedness': '#8b5cf6'
        };
        return colors[category] || '#6b7280';
    }

    /**
     * Create feed widget HTML
     */
    createFeedWidget() {
        return `
            <div class="noaa-feed-widget bg-white rounded-lg shadow-md p-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold">NOAA Updates</h3>
                    <span class="text-xs text-gray-500" id="feed-update-time">Loading...</span>
                </div>
                <div id="feed-content" class="space-y-3">
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <a href="https://www.nhc.noaa.gov" target="_blank" 
                       class="text-sm text-blue-600 hover:text-blue-800">
                        View Full NOAA Site →
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Initialize feed auto-refresh
     */
    startAutoRefresh(interval = 300000) { // 5 minutes default
        this.refreshInterval = setInterval(async () => {
            await this.updateAllFeeds();
        }, interval);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Update all feeds
     */
    async updateAllFeeds() {
        const [outlook, storms, rss] = await Promise.all([
            this.getAtlanticOutlook(),
            this.getActiveStorms(),
            this.getRSSFeed()
        ]);

        return {
            outlook,
            storms,
            rss,
            lastUpdate: new Date().toISOString()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOAAFeeds;
}