function hurricaneApp() {
    return {
        activeTab: 'home',
        selectedStorm: null,
        hurricaneMap: null,
        filteredStorms: [],
        majorHurricanes: 0,
        selectedStatesComparison: ['FL', 'TX', 'LA'],
        stateComparisonYearStart: 1980,
        stateComparisonYearEnd: 2024,
        stateStats: {
            totalStorms: 0,
            majorHurricanes: 0,
            totalDeaths: 0
        },
        dbSearch: '',
        dbResults: [],
        
        filters: {
            yearStart: 1980,
            yearEnd: 2024,
            monthStart: 5,
            monthEnd: 11,
            categories: ['0', '1', '2', '3', '4', '5'],
            state: '',
            search: ''
        },

        // Hurricane data embedded directly in the app
        allStorms: [
            // 2024 Recent Storms
            {id: 1, name: 'Helene', category: 4, year: 2024, month: 9, day: 26, windSpeed: 140, pressure: 938, 
             lat: 30.118244, lon: -83.582900, state: 'FL', landfall: 'Big Bend, FL', deaths: 230, 
             impact: 'Hurricane Helene rapidly intensified before making landfall in Florida\'s Big Bend region as a catastrophic Category 4 storm. The hurricane brought unprecedented 15-foot storm surge, devastating winds of 140 mph, and catastrophic flooding.',
             track: [[18.0, -84.0], [20.5, -84.8], [23.2, -84.5], [25.8, -84.2], [28.4, -83.9], [30.118244, -83.582900]]},

            {id: 2, name: 'Milton', category: 3, year: 2024, month: 10, day: 9, windSpeed: 120, pressure: 954,
             lat: 27.336435, lon: -82.530695, state: 'FL', landfall: 'Siesta Key, FL', deaths: 24,
             impact: 'Hurricane Milton made landfall at Siesta Key as a Category 3 hurricane, bringing devastating storm surge and winds to Florida\'s west coast.',
             track: [[20.5, -86.2], [22.8, -85.1], [24.9, -84.0], [26.2, -83.2], [27.336435, -82.530695]]},

            {id: 3, name: 'Debby', category: 0, year: 2024, month: 8, day: 5, windSpeed: 65, pressure: 995,
             lat: 29.818568, lon: -83.948318, state: 'FL', landfall: 'Big Bend, FL', deaths: 10,
             impact: 'Tropical Storm Debby brought catastrophic flooding to Florida\'s Big Bend and northeastern regions.',
             track: [[24.5, -83.8], [26.2, -83.9], [28.1, -84.0], [29.818568, -83.948318]]},

            // 2023 Storms
            {id: 4, name: 'Idalia', category: 3, year: 2023, month: 8, day: 30, windSpeed: 125, pressure: 949,
             lat: 29.8, lon: -83.4, state: 'FL', landfall: 'Big Bend, FL', deaths: 8,
             impact: 'Idalia rapidly intensified before making landfall in Florida\'s sparsely populated Big Bend region as a high-end Category 3 hurricane.',
             track: [[20.0, -84.0], [22.0, -84.5], [24.0, -84.0], [26.0, -83.5], [28.0, -83.5], [29.8, -83.4]]},

            // 2022 Storms
            {id: 5, name: 'Ian', category: 4, year: 2022, month: 9, day: 28, windSpeed: 150, pressure: 937,
             lat: 26.7, lon: -82.2, state: 'FL', landfall: 'Fort Myers, FL', deaths: 150,
             impact: 'Hurricane Ian devastated Southwest Florida as one of the most powerful hurricanes ever to strike the United States.',
             track: [[14.0, -66.0], [16.0, -70.0], [18.0, -74.0], [20.0, -78.0], [22.0, -81.0], [24.0, -82.5], [26.7, -82.2]]},

            {id: 6, name: 'Nicole', category: 1, year: 2022, month: 11, day: 10, windSpeed: 75, pressure: 980,
             lat: 27.5, lon: -80.2, state: 'FL', landfall: 'Vero Beach, FL', deaths: 5,
             impact: 'Nicole made an unusual November landfall along Florida\'s east coast as a Category 1 hurricane.',
             track: [[25.0, -77.0], [26.0, -78.0], [27.0, -79.0], [27.5, -80.2]]},

            // 2021 Storms
            {id: 7, name: 'Elsa', category: 0, year: 2021, month: 7, day: 7, windSpeed: 65, pressure: 993,
             lat: 27.766279, lon: -82.640275, state: 'FL', landfall: 'Tampa Bay, FL', deaths: 1,
             impact: 'Tropical Storm Elsa brought tropical storm conditions to much of the Florida Peninsula.',
             track: [[24.8, -81.2], [26.1, -81.8], [27.766279, -82.640275]]},

            // 2018 Storms
            {id: 8, name: 'Michael', category: 5, year: 2018, month: 10, day: 10, windSpeed: 160, pressure: 919,
             lat: 30.0, lon: -85.4, state: 'FL', landfall: 'Mexico Beach, FL', deaths: 74,
             impact: 'Hurricane Michael explosively intensified into the first Category 5 hurricane to strike the Florida Panhandle.',
             track: [[18.0, -84.0], [20.0, -85.0], [22.0, -86.0], [24.0, -86.5], [26.0, -86.0], [28.0, -85.5], [30.0, -85.4]]},

            // 2017 Storms
            {id: 9, name: 'Irma', category: 4, year: 2017, month: 9, day: 10, windSpeed: 130, pressure: 929,
             lat: 25.761681, lon: -80.191788, state: 'FL', landfall: 'Cudjoe Key, FL', deaths: 92,
             impact: 'Hurricane Irma made landfall in the Florida Keys as a Category 4 hurricane.',
             track: [[19.8, -70.0], [21.5, -73.2], [23.1, -76.1], [24.2, -78.8], [25.0, -80.5], [25.761681, -80.191788]]},

            // 2016 Storms
            {id: 10, name: 'Hermine', category: 1, year: 2016, month: 9, day: 2, windSpeed: 80, pressure: 981,
             lat: 29.8, lon: -84.2, state: 'FL', landfall: 'St. Marks, FL', deaths: 3,
             impact: 'Hurricane Hermine made landfall in the Big Bend region as a Category 1 hurricane.',
             track: [[26.2, -82.8], [27.8, -83.5], [29.8, -84.2]]},

            {id: 11, name: 'Matthew', category: 2, year: 2016, month: 10, day: 7, windSpeed: 110, pressure: 946,
             lat: 29.2, lon: -80.9, state: 'FL', landfall: 'Flagler Beach, FL', deaths: 12,
             impact: 'Hurricane Matthew paralleled the Florida east coast as a major hurricane.',
             track: [[25.5, -76.8], [26.8, -79.2], [27.9, -80.1], [29.2, -80.9]]},

            // 2012 Storms
            {id: 12, name: 'Debby', category: 0, year: 2012, month: 6, day: 26, windSpeed: 65, pressure: 990,
             lat: 29.64, lon: -84.1, state: 'FL', landfall: 'Steinhatchee, FL', deaths: 3,
             impact: 'Tropical Storm Debby was a slow-moving storm that brought catastrophic flooding to much of Florida.',
             track: [[27.1, -83.2], [28.4, -83.6], [29.64, -84.1]]},

            // 2008 Storms
            {id: 13, name: 'Fay', category: 0, year: 2008, month: 8, day: 19, windSpeed: 65, pressure: 986,
             lat: 26.7, lon: -80.1, state: 'FL', landfall: 'New Smyrna Beach, FL', deaths: 5,
             impact: 'Tropical Storm Fay made multiple landfalls across Florida, bringing extensive flooding.',
             track: [[24.8, -79.5], [25.5, -80.2], [26.7, -80.1], [28.1, -81.3], [29.2, -82.8]]},

            // 2005 Storms
            {id: 14, name: 'Wilma', category: 3, year: 2005, month: 10, day: 24, windSpeed: 120, pressure: 950,
             lat: 25.9, lon: -81.1, state: 'FL', landfall: 'SW Florida', deaths: 23,
             impact: 'Hurricane Wilma crossed South Florida as a Category 3 hurricane.',
             track: [[20.5, -86.7], [22.8, -85.1], [24.2, -83.2], [25.9, -81.1]]},

            {id: 15, name: 'Katrina', category: 1, year: 2005, month: 8, day: 25, windSpeed: 80, pressure: 984,
             lat: 25.9, lon: -80.3, state: 'FL', landfall: 'Aventura, FL', deaths: 14,
             impact: 'Hurricane Katrina first made landfall in Florida as a Category 1 hurricane.',
             track: [[23.1, -75.6], [24.2, -77.8], [25.9, -80.3]]},

            {id: 16, name: 'Dennis', category: 3, year: 2005, month: 7, day: 10, windSpeed: 120, pressure: 946,
             lat: 30.35, lon: -87.05, state: 'FL', landfall: 'Santa Rosa Island, FL', deaths: 15,
             impact: 'Hurricane Dennis made landfall on Santa Rosa Island as a Category 3 hurricane.',
             track: [[20.1, -74.8], [22.8, -78.2], [25.4, -81.1], [27.8, -84.2], [30.35, -87.05]]},

            // 2004 Storms
            {id: 17, name: 'Jeanne', category: 3, year: 2004, month: 9, day: 26, windSpeed: 120, pressure: 950,
             lat: 27.2, lon: -80.1, state: 'FL', landfall: 'Hutchinson Island, FL', deaths: 7,
             impact: 'Hurricane Jeanne made landfall following nearly the same path as Frances.',
             track: [[23.8, -74.2], [25.1, -77.1], [26.2, -78.8], [27.2, -80.1]]},

            {id: 18, name: 'Frances', category: 2, year: 2004, month: 9, day: 5, windSpeed: 105, pressure: 960,
             lat: 27.2, lon: -80.2, state: 'FL', landfall: 'Sewall\'s Point, FL', deaths: 7,
             impact: 'Hurricane Frances made landfall on the Florida east coast as a Category 2 hurricane.',
             track: [[21.5, -72.1], [23.8, -75.8], [25.9, -78.1], [27.2, -80.2]]},

            {id: 19, name: 'Charley', category: 4, year: 2004, month: 8, day: 13, windSpeed: 150, pressure: 941,
             lat: 26.9, lon: -82.2, state: 'FL', landfall: 'Cayo Costa, FL', deaths: 10,
             impact: 'Hurricane Charley was a small but extremely intense Category 4 hurricane.',
             track: [[18.0, -76.0], [21.0, -79.0], [23.0, -81.0], [24.5, -82.0], [26.9, -82.2]]},

            // 1992 - Hurricane Andrew
            {id: 20, name: 'Andrew', category: 5, year: 1992, month: 8, day: 24, windSpeed: 165, pressure: 922,
             lat: 25.5, lon: -80.3, state: 'FL', landfall: 'Homestead, FL', deaths: 65,
             impact: 'Hurricane Andrew redefined hurricane devastation for modern America, striking South Florida as a Category 5.',
             track: [[12.0, -48.0], [14.0, -54.0], [16.0, -60.0], [18.0, -66.0], [20.0, -70.0], [22.0, -74.0], [23.5, -77.0], [25.5, -80.3]]},

            // 1935 - Labor Day Hurricane
            {id: 21, name: 'Labor Day', category: 5, year: 1935, month: 9, day: 2, windSpeed: 185, pressure: 892,
             lat: 24.8, lon: -80.8, state: 'FL', landfall: 'Islamorada, FL', deaths: 423,
             impact: 'The Labor Day Hurricane of 1935 remains the most intense hurricane ever to make landfall in the United States.',
             track: [[23.0, -75.0], [23.5, -77.0], [24.0, -79.0], [24.8, -80.8]]},

            // Additional storms to expand dataset
            {id: 22, name: 'Alberto', category: 1, year: 2024, month: 6, day: 19, windSpeed: 75, pressure: 985,
             lat: 27.5, lon: -97.0, state: 'TX', landfall: 'Texas Coast', deaths: 0,
             impact: 'Alberto made landfall near Corpus Christi as a minimal Category 1 hurricane.',
             track: [[23.5, -95.0], [24.5, -95.5], [25.5, -96.0], [26.5, -96.5], [27.5, -97.0]]},

            {id: 23, name: 'Beryl', category: 4, year: 2024, month: 7, day: 8, windSpeed: 145, pressure: 938,
             lat: 28.0, lon: -95.0, state: 'TX', landfall: 'Texas Coast', deaths: 11,
             impact: 'Hurricane Beryl struck the Texas coast as a powerful Category 4 storm.',
             track: [[16.0, -83.0], [18.0, -85.0], [20.0, -87.0], [22.0, -89.0], [24.0, -91.0], [26.0, -93.0], [28.0, -95.0]]},

            {id: 24, name: 'Ida', category: 4, year: 2021, month: 8, day: 29, windSpeed: 150, pressure: 929,
             lat: 29.2, lon: -90.1, state: 'LA', landfall: 'Port Fourchon, LA', deaths: 87,
             impact: 'Hurricane Ida slammed into Louisiana as an extremely dangerous Category 4 storm.',
             track: [[19.0, -80.0], [21.0, -82.0], [23.0, -84.0], [25.0, -86.0], [27.0, -88.0], [29.2, -90.1]]},

            {id: 25, name: 'Laura', category: 4, year: 2020, month: 8, day: 27, windSpeed: 150, pressure: 939,
             lat: 30.0, lon: -93.3, state: 'LA', landfall: 'Cameron, LA', deaths: 81,
             impact: 'Hurricane Laura delivered a catastrophic blow to Southwest Louisiana.',
             track: [[20.0, -86.0], [22.0, -88.0], [24.0, -90.0], [26.0, -91.5], [28.0, -92.5], [30.0, -93.3]]},

            {id: 26, name: 'Camille', category: 5, year: 1969, month: 8, day: 17, windSpeed: 175, pressure: 900,
             lat: 30.3, lon: -89.0, state: 'MS', landfall: 'Pass Christian, MS', deaths: 259,
             impact: 'Hurricane Camille struck the Mississippi coast as one of only four Category 5 hurricanes.',
             track: [[18.0, -75.0], [20.0, -78.0], [22.0, -81.0], [24.0, -84.0], [26.0, -86.0], [28.0, -87.5], [30.3, -89.0]]}
        ],

        init() {
            // Initialize the app immediately
            this.$nextTick(() => {
                this.initMap();
                this.updateVisualization();
                this.updateStateComparison();
                this.searchDatabase();
            });
        },

        initMap() {
            const mapElement = document.getElementById('hurricane-map');
            if (mapElement) {
                this.hurricaneMap = L.map('hurricane-map', {
                    center: [27.7663, -82.6404],
                    zoom: 6,
                    scrollWheelZoom: true
                });
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(this.hurricaneMap);
            }
        },

        updateVisualization() {
            this.applyFilters();
            this.updateTimeline();
            this.updateStatistics();
            this.updateMap();
        },

        applyFilters() {
            this.filteredStorms = this.allStorms.filter(storm => {
                if (storm.year < this.filters.yearStart || storm.year > this.filters.yearEnd) return false;
                if (!this.filters.categories.includes(String(storm.category))) return false;
                if (storm.month < this.filters.monthStart || storm.month > this.filters.monthEnd) return false;
                if (this.filters.state && storm.state !== this.filters.state) return false;
                if (this.filters.search) {
                    const search = this.filters.search.toLowerCase();
                    const searchable = `${storm.name} ${storm.impact} ${storm.landfall}`.toLowerCase();
                    if (!searchable.includes(search)) return false;
                }
                return true;
            });
        },

        updateTimeline() {
            const timelineDiv = document.getElementById('timeline-chart');
            if (!timelineDiv) return;
            
            if (this.filteredStorms.length === 0) {
                timelineDiv.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No storms match current filters</div>';
                return;
            }

            // Sort storms by year for better display
            const sortedStorms = [...this.filteredStorms].sort((a, b) => a.year - b.year);

            const trace = {
                x: sortedStorms.map(s => this.getMonthPosition(s.month, s.day)),
                y: sortedStorms.map(s => s.year),
                mode: 'markers+text',
                type: 'scatter',
                name: 'Hurricane Landfalls',
                text: sortedStorms.map(s => s.name),
                textposition: 'middle right',
                textfont: {
                    size: 10,
                    color: '#1F2937'
                },
                hovertext: sortedStorms.map(s => 
                    `<b>${s.name} (${s.year})</b><br>` +
                    `Category ${s.category}<br>` +
                    `${s.windSpeed} mph<br>` +
                    `${s.landfall}<br>` +
                    `${this.formatDate(s)}<br>` +
                    `Click for details`
                ),
                hovertemplate: '%{hovertext}<extra></extra>',
                marker: {
                    size: sortedStorms.map(s => Math.max(12, 12 + s.category * 3)),
                    color: sortedStorms.map(s => s.category),
                    colorscale: [
                        [0, '#3B82F6'],    // Blue - Tropical Storm
                        [0.2, '#10B981'],  // Green - Cat 1
                        [0.4, '#F59E0B'],  // Yellow - Cat 2
                        [0.6, '#EF4444'],  // Orange - Cat 3
                        [0.8, '#DC2626'],  // Red - Cat 4
                        [1, '#7F1D1D']     // Dark Red - Cat 5
                    ],
                    showscale: true,
                    colorbar: {
                        title: { text: 'Category', side: 'right' },
                        tickmode: 'array',
                        tickvals: [0, 1, 2, 3, 4, 5],
                        ticktext: ['TS', '1', '2', '3', '4', '5'],
                        len: 0.8,
                        x: 1.02
                    },
                    line: { color: '#ffffff', width: 2 }
                }
            };

            const layout = {
                title: {
                    text: `Hurricane Timeline (${sortedStorms.length} storms)`,
                    font: { size: 16, color: '#1F2937' },
                    x: 0.5,
                    y: 0.98
                },
                xaxis: {
                    title: { text: 'Month', font: { size: 12 } },
                    tickmode: 'array',
                    tickvals: [5, 6, 7, 8, 9, 10, 11],
                    ticktext: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                    range: [4.5, 11.5],
                    gridcolor: '#E5E7EB',
                    tickfont: { size: 11 },
                    side: 'bottom'
                },
                yaxis: {
                    title: { text: 'Year', font: { size: 12 } },
                    range: [this.filters.yearStart - 1, this.filters.yearEnd + 1],
                    dtick: 5,
                    gridcolor: '#E5E7EB',
                    tickfont: { size: 11 },
                    autorange: 'reversed'  // Years increase going down
                },
                hovermode: 'closest',
                plot_bgcolor: '#F9FAFB',
                paper_bgcolor: '#FFFFFF',
                margin: { l: 50, r: 120, t: 40, b: 50 },
                showlegend: false,
                font: { family: 'system-ui, sans-serif' },
                height: window.innerHeight - 100  // Full height minus navigation
            };

            const config = {
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['select2d', 'lasso2d']
            };

            Plotly.newPlot('timeline-chart', [trace], layout, config);
            
            // Add click handler
            timelineDiv.on('plotly_click', (data) => {
                const point = data.points[0];
                const storm = sortedStorms[point.pointIndex];
                this.selectStorm(storm);
            });
        },

        getMonthPosition(month, day) {
            // Convert day of month to decimal position within month
            const daysInMonth = { 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30 };
            return month + ((day - 1) / (daysInMonth[month] || 30));
        },

        updateMap() {
            if (!this.hurricaneMap) return;
            
            // Clear existing layers
            this.hurricaneMap.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    this.hurricaneMap.removeLayer(layer);
                }
            });

            this.filteredStorms.forEach(storm => {
                // Draw storm track
                if (storm.track && storm.track.length > 0) {
                    L.polyline(storm.track, {
                        color: this.getCategoryColor(storm.category),
                        weight: 3,
                        opacity: 0.8
                    }).addTo(this.hurricaneMap);
                }

                // Add landfall marker
                const marker = L.marker([storm.lat, storm.lon], {
                    icon: this.createStormIcon(storm.category)
                }).addTo(this.hurricaneMap)
                .bindPopup(`
                    <div class="p-2">
                        <h3 class="font-bold text-lg">${storm.name} (${storm.year})</h3>
                        <p><strong>Category:</strong> ${storm.category}</p>
                        <p><strong>Wind:</strong> ${storm.windSpeed} mph</p>
                        <p><strong>Landfall:</strong> ${storm.landfall}</p>
                    </div>
                `)
                .on('click', () => this.selectStorm(storm));
            });

            // Fit bounds to show all storms
            if (this.filteredStorms.length > 0) {
                const bounds = L.latLngBounds(this.filteredStorms.map(s => [s.lat, s.lon]));
                this.hurricaneMap.fitBounds(bounds, { padding: [20, 20] });
            }
        },

        selectStorm(storm) {
            this.selectedStorm = storm;
            
            // Initialize or update the map in the details panel
            this.$nextTick(() => {
                const mapElement = document.getElementById('hurricane-map');
                if (mapElement && storm.lat && storm.lon) {
                    // Remove existing map if any
                    if (this.hurricaneMap) {
                        this.hurricaneMap.remove();
                    }
                    
                    // Create new map
                    this.hurricaneMap = L.map('hurricane-map', {
                        center: [storm.lat, storm.lon],
                        zoom: 7,
                        scrollWheelZoom: true
                    });
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(this.hurricaneMap);
                    
                    // Add storm track if available
                    if (storm.track && storm.track.length > 0) {
                        L.polyline(storm.track, {
                            color: this.getCategoryColor(storm.category),
                            weight: 4,
                            opacity: 0.8
                        }).addTo(this.hurricaneMap);
                    }
                    
                    // Add landfall marker
                    const marker = L.marker([storm.lat, storm.lon], {
                        icon: this.createStormIcon(storm.category)
                    }).addTo(this.hurricaneMap)
                    .bindPopup(`
                        <div class="p-3">
                            <h3 class="font-bold text-lg mb-2">${storm.name} (${storm.year})</h3>
                            <p><strong>Category:</strong> ${storm.category}</p>
                            <p><strong>Wind Speed:</strong> ${storm.windSpeed} mph</p>
                            <p><strong>Pressure:</strong> ${storm.pressure} mb</p>
                            <p><strong>Landfall:</strong> ${storm.landfall}</p>
                            <p><strong>Date:</strong> ${this.formatDate(storm)}</p>
                        </div>
                    `).openPopup();
                    
                    // Force map to resize after a short delay
                    setTimeout(() => {
                        if (this.hurricaneMap) {
                            this.hurricaneMap.invalidateSize();
                        }
                    }, 200);
                }
            });
        },

        updateStatistics() {
            this.majorHurricanes = this.filteredStorms.filter(s => s.category >= 3).length;
        },

        resetFilters() {
            this.filters = {
                yearStart: 1980,
                yearEnd: 2024,
                monthStart: 5,
                monthEnd: 11,
                categories: ['0', '1', '2', '3', '4', '5'],
                state: '',
                search: ''
            };
            this.selectedStorm = null;
            this.updateVisualization();
        },

        getCategoryColor(category) {
            const colors = {
                0: '#3B82F6', 1: '#10B981', 2: '#F59E0B',
                3: '#EF4444', 4: '#DC2626', 5: '#7F1D1D'
            };
            return colors[category] || '#6B7280';
        },

        createStormIcon(category) {
            const color = this.getCategoryColor(category);
            const size = Math.max(12, 12 + category * 2);
            
            return L.divIcon({
                className: 'custom-storm-marker',
                html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });
        },

        formatDate(storm) {
            if (!storm) return '';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[storm.month - 1]} ${storm.day}, ${storm.year}`;
        },

        getStateName(code) {
            const states = {
                'FL': 'Florida', 'TX': 'Texas', 'LA': 'Louisiana',
                'MS': 'Mississippi', 'AL': 'Alabama', 'GA': 'Georgia',
                'SC': 'South Carolina', 'NC': 'North Carolina',
                'VA': 'Virginia', 'MD': 'Maryland', 'NJ': 'New Jersey',
                'NY': 'New York', 'MA': 'Massachusetts', 'ME': 'Maine'
            };
            return states[code] || code;
        },

        searchDatabase() {
            if (this.dbSearch.trim() === '') {
                this.dbResults = this.allStorms.slice(0, 50);
            } else {
                const search = this.dbSearch.toLowerCase();
                this.dbResults = this.allStorms.filter(storm => 
                    storm.name.toLowerCase().includes(search) ||
                    storm.year.toString().includes(search) ||
                    storm.impact.toLowerCase().includes(search) ||
                    storm.landfall.toLowerCase().includes(search)
                ).slice(0, 50);
            }
        },

        viewStormOnMap(storm) {
            this.activeTab = 'timeline';
            this.selectStorm(storm);
        },

        getCategoryClass(category) {
            const classes = {
                0: 'bg-blue-100 text-blue-800',
                1: 'bg-green-100 text-green-800',
                2: 'bg-yellow-100 text-yellow-800',
                3: 'bg-orange-100 text-orange-800',
                4: 'bg-red-100 text-red-800',
                5: 'bg-red-200 text-red-900'
            };
            return classes[category] || 'bg-gray-100 text-gray-800';
        },

        updateStateComparison() {
            if (this.selectedStatesComparison.length === 0) return;
            
            const stateStorms = this.allStorms.filter(storm => 
                this.selectedStatesComparison.includes(storm.state) &&
                storm.year >= this.stateComparisonYearStart &&
                storm.year <= this.stateComparisonYearEnd
            );

            this.stateStats = {
                totalStorms: stateStorms.length,
                majorHurricanes: stateStorms.filter(s => s.category >= 3).length,
                totalDeaths: stateStorms.reduce((sum, s) => sum + (s.deaths || 0), 0)
            };

            const trace = {
                x: stateStorms.map(s => s.year),
                y: stateStorms.map(s => s.windSpeed),
                mode: 'markers',
                type: 'scatter',
                name: 'Hurricanes',
                text: stateStorms.map(s => 
                    `${s.name}<br>${this.formatDate(s)}<br>Category ${s.category}<br>${s.state}<br>${s.windSpeed} mph`
                ),
                marker: {
                    size: stateStorms.map(s => 10 + s.category * 3),
                    color: stateStorms.map(s => s.category),
                    colorscale: [
                        [0, '#3B82F6'], [0.2, '#10B981'], [0.4, '#F59E0B'],
                        [0.6, '#EF4444'], [0.8, '#DC2626'], [1, '#7F1D1D']
                    ],
                    showscale: false,
                    line: { color: 'white', width: 1 }
                },
                hovertemplate: '%{text}<extra></extra>'
            };

            const layout = {
                title: `Multi-State Hurricane Landfalls (${this.stateComparisonYearStart}-${this.stateComparisonYearEnd})`,
                xaxis: { title: 'Year' },
                yaxis: { title: 'Wind Speed (mph)' },
                hovermode: 'closest',
                plot_bgcolor: '#f8f9fa',
                paper_bgcolor: 'white'
            };

            Plotly.newPlot('state-timeline-chart', [trace], layout, { responsive: true, displayModeBar: false });
        }
    };
}

// AI Assistant functionality
function aiAssistant() {
    return {
        showChat: false,
        messages: [],
        currentMessage: '',
        isLoading: false,
        
        sendMessage() {
            if (!this.currentMessage.trim() || this.isLoading) return;
            
            this.messages.push({
                id: Date.now(),
                role: 'user',
                content: this.currentMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            
            const userMessage = this.currentMessage;
            this.currentMessage = '';
            this.isLoading = true;
            
            setTimeout(() => {
                const response = this.generateResponse(userMessage);
                this.messages.push({
                    id: Date.now(),
                    role: 'assistant',
                    content: response,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                this.isLoading = false;
                
                this.$nextTick(() => {
                    const container = this.$refs.chatContainer;
                    container.scrollTop = container.scrollHeight;
                });
            }, 1500);
        },
        
        askQuestion(question) {
            this.currentMessage = question;
            this.sendMessage();
        },
        
        generateResponse(message) {
            const msg = message.toLowerCase();
            
            if (msg.includes('category 5')) {
                return 'I found several Category 5 hurricanes: Labor Day (1935) - strongest ever at 185 mph, Andrew (1992) - devastated Homestead, Michael (2018) - hit Florida Panhandle, and Camille (1969) - struck Mississippi. Use the timeline filters to show only Category 5 storms.';
            } else if (msg.includes('2004')) {
                return 'The 2004 season was devastating for Florida with 4 hurricanes: Charley (Cat 4), Frances (Cat 2), Ivan (Cat 3), and Jeanne (Cat 3). Set the year filter to 2004 to see them all.';
            } else if (msg.includes('most recent')) {
                return 'The most recent major hurricanes are Helene and Milton in 2024. Both hit Florida - Helene as Cat 4 in the Big Bend, Milton as Cat 3 at Siesta Key.';
            } else {
                return `I can help explore ${this.allStorms ? this.allStorms.length : '25+'} hurricanes in the database! Try asking about specific storms, years, or categories.`;
            }
        }
    };
}