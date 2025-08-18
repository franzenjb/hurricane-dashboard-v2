function hurricaneApp() {
    return {
        activeTab: 'home',
        selectedStorm: null,
        hurricaneMap: null,
        mapMarkers: [],
        filteredStorms: [],
        majorHurricanes: 0,
        selectedStatesComparison: ['FL', 'TX', 'LA'],
        stateComparisonYearStart: 1851,
        stateComparisonYearEnd: 2024,
        stateStats: {
            totalStorms: 0,
            majorHurricanes: 0,
            cat5Storms: 0,
            totalDeaths: 0
        },
        dbSearch: '',
        dbResults: [],
        
        filters: {
            yearStart: 1851,
            yearEnd: 2030,
            monthStart: 5,  // May
            monthEnd: 11,   // November
            categories: ['0', '1', '2', '3', '4', '5'],
            state: '',
            search: ''
        },

        // Sample hurricane data - in production this would come from your database
        allStorms: [
            // 2024 Storms
            {id: 1, name: 'Alberto', category: 1, year: 2024, month: 6, day: 19, windSpeed: 75, pressure: 985, 
             lat: 27.5, lon: -97.0, state: 'TX', landfall: 'Texas Coast', deaths: 0, 
             impact: 'Alberto made landfall near Corpus Christi as a minimal Category 1 hurricane, bringing heavy rainfall of up to 10 inches across coastal Texas. While wind damage was limited, the storm caused significant street flooding in low-lying areas and triggered several tornadoes. The storm surge reached 4-6 feet, causing minor beach erosion. Total damage was estimated at $50 million, with no direct fatalities reported. The storm weakened rapidly after landfall but continued to produce beneficial rainfall for drought-stricken areas of South Texas.',
             track: [[23.5, -95.0], [24.5, -95.5], [25.5, -96.0], [26.5, -96.5], [27.5, -97.0]]},
            
            {id: 2, name: 'Beryl', category: 4, year: 2024, month: 7, day: 8, windSpeed: 145, pressure: 938,
             lat: 28.0, lon: -95.0, state: 'TX', landfall: 'Texas Coast', deaths: 11,
             impact: 'Hurricane Beryl struck the Texas coast as a powerful Category 4 storm, becoming the earliest Category 5 hurricane on record in the Atlantic. The storm brought catastrophic winds of 145 mph and a devastating 15-foot storm surge to coastal communities. Over 2.7 million customers lost power, with some areas without electricity for weeks. The hurricane destroyed hundreds of homes, damaged critical infrastructure, and caused an estimated $2.5 billion in damages. Beryl\'s rapid intensification caught many residents off guard, leading to 11 storm-related fatalities. The storm\'s impact extended well inland with flooding rains and tornadoes reported across eastern Texas.',
             track: [[16.0, -83.0], [18.0, -85.0], [20.0, -87.0], [22.0, -89.0], [24.0, -91.0], [26.0, -93.0], [28.0, -95.0]]},
            
            // 2023 Storms
            {id: 3, name: 'Idalia', category: 3, year: 2023, month: 8, day: 30, windSpeed: 125, pressure: 949,
             lat: 29.8, lon: -83.4, state: 'FL', landfall: 'Big Bend, FL', deaths: 8,
             impact: 'Idalia rapidly intensified before making landfall in Florida\'s sparsely populated Big Bend region as a high-end Category 3 hurricane. The storm brought a catastrophic 12-16 foot storm surge to coastal areas, inundating entire communities and causing severe erosion. Cedar Key was particularly hard hit with historic flooding that damaged 90% of homes. The hurricane\'s 125 mph winds toppled thousands of trees, destroyed mobile homes, and left over 500,000 without power. Agricultural losses were substantial, with significant damage to cotton and timber industries. Total damage exceeded $3.6 billion, making it one of the costliest storms to hit the Big Bend region.',
             track: [[20.0, -84.0], [22.0, -84.5], [24.0, -84.0], [26.0, -83.5], [28.0, -83.5], [29.8, -83.4]]},
            
            // 2022 Storms
            {id: 4, name: 'Ian', category: 4, year: 2022, month: 9, day: 28, windSpeed: 150, pressure: 937,
             lat: 26.7, lon: -82.2, state: 'FL', landfall: 'Fort Myers, FL', deaths: 150,
             impact: 'Hurricane Ian devastated Southwest Florida as one of the most powerful hurricanes ever to strike the United States. The Category 4 storm brought unprecedented 150 mph winds and a catastrophic 12-18 foot storm surge that swept away entire neighborhoods in Fort Myers Beach and Sanibel Island. Over 150 people lost their lives, making it the deadliest hurricane to hit Florida since 1935. The storm caused an estimated $112 billion in damage, destroyed over 5,000 homes, and left 2.6 million without power. Ian\'s slow movement resulted in rainfall totals exceeding 20 inches, causing record flooding along the Peace and Myakka Rivers that persisted for weeks.',
             track: [[14.0, -66.0], [16.0, -70.0], [18.0, -74.0], [20.0, -78.0], [22.0, -81.0], [24.0, -82.5], [26.7, -82.2]]},
            
            {id: 5, name: 'Nicole', category: 1, year: 2022, month: 11, day: 10, windSpeed: 75, pressure: 980,
             lat: 27.5, lon: -80.2, state: 'FL', landfall: 'Vero Beach, FL', deaths: 5,
             impact: 'Nicole made an unusual November landfall along Florida\'s east coast as a Category 1 hurricane, becoming the latest calendar year hurricane to hit the U.S. in nearly 40 years. The storm\'s large wind field and persistent onshore flow caused severe beach erosion from the Space Coast to Jacksonville, undermining seawalls and causing several beachfront condominiums to be condemned. Storm surge of 5-7 feet combined with king tides to produce significant coastal flooding. The late-season storm caught many residents unprepared, leading to 5 deaths and over $1 billion in damage. Nicole\'s impact was particularly severe on beaches still recovering from Hurricane Ian just six weeks earlier.',
             track: [[25.0, -77.0], [26.0, -78.0], [27.0, -79.0], [27.5, -80.2]]},
            
            // 2021 Storms
            {id: 6, name: 'Ida', category: 4, year: 2021, month: 8, day: 29, windSpeed: 150, pressure: 929,
             lat: 29.2, lon: -90.1, state: 'LA', landfall: 'Port Fourchon, LA', deaths: 87,
             impact: 'Hurricane Ida slammed into Louisiana on the 16th anniversary of Hurricane Katrina as an extremely dangerous Category 4 storm. With sustained winds of 150 mph, Ida tied for the strongest hurricane to ever make landfall in Louisiana. The storm\'s powerful eyewall decimated communities in its path, completely destroying thousands of structures. Over 1 million customers lost power, with some areas experiencing outages for over a month in sweltering heat. The storm surge reached 12-16 feet, overtopping levees in several parishes. Ida caused over $75 billion in damage and was responsible for 87 deaths, including many in the Northeast from remnant flooding. The hurricane highlighted the vulnerability of Louisiana\'s power grid and coastal communities.',
             track: [[19.0, -80.0], [21.0, -82.0], [23.0, -84.0], [25.0, -86.0], [27.0, -88.0], [29.2, -90.1]]},
            
            // 2020 Storms
            {id: 7, name: 'Laura', category: 4, year: 2020, month: 8, day: 27, windSpeed: 150, pressure: 939,
             lat: 30.0, lon: -93.3, state: 'LA', landfall: 'Cameron, LA', deaths: 81,
             impact: 'Hurricane Laura delivered a catastrophic blow to Southwest Louisiana as an intense Category 4 hurricane with 150 mph winds. The storm\'s extreme winds and 15-20 foot storm surge devastated the Lake Charles area, damaging or destroying virtually every structure in its path. The hurricane\'s well-defined eye passed directly over Lake Charles, where a wind gust of 137 mph was recorded before instruments failed. Laura caused complete deforestation across large areas, flattened entire neighborhoods, and left hazardous industrial chemical leaks in its wake. The storm killed 81 people and caused over $23 billion in damage. Recovery efforts were hampered when Hurricane Delta struck the same area just six weeks later.',
             track: [[20.0, -86.0], [22.0, -88.0], [24.0, -90.0], [26.0, -91.5], [28.0, -92.5], [30.0, -93.3]]},
            
            {id: 8, name: 'Sally', category: 2, year: 2020, month: 9, day: 16, windSpeed: 105, pressure: 965,
             lat: 30.3, lon: -87.6, state: 'AL', landfall: 'Gulf Shores, AL', deaths: 8,
             impact: 'Hurricane Sally\'s painfully slow forward speed of just 2-3 mph resulted in catastrophic and historic flooding along the Alabama and Florida Panhandle coasts. The Category 2 storm dumped 20-30 inches of rain in some areas, with Orange Beach, Alabama recording nearly 30 inches. The extreme rainfall caused widespread flash flooding, washing out bridges and roadways. Storm surge of 5-7 feet combined with the torrential rains to inundate coastal communities. Sally\'s slow movement also prolonged the period of damaging winds, causing extensive structural damage and leaving over 570,000 customers without power. The storm caused 8 deaths and approximately $8.3 billion in damage, with many areas experiencing their worst flooding in over a century.',
             track: [[25.0, -85.0], [26.0, -86.0], [27.0, -86.5], [28.5, -87.0], [30.3, -87.6]]},
            
            // 2019 Storms
            {id: 9, name: 'Dorian', category: 5, year: 2019, month: 9, day: 1, windSpeed: 185, pressure: 910,
             lat: 30.0, lon: -80.5, state: 'FL', landfall: 'Bahamas (grazed FL coast)', deaths: 10,
             impact: 'Hurricane Dorian became one of the strongest Atlantic hurricanes on record, devastating the northern Bahamas with sustained winds of 185 mph and gusts over 220 mph. The storm stalled over Grand Bahama and Abaco Islands for over 24 hours, causing apocalyptic destruction with storm surge exceeding 20 feet. In the Bahamas, over 70 people died and thousands remained missing. As Dorian turned north, it brought tropical storm conditions and significant coastal flooding to Florida\'s east coast, though the state was spared a direct hit. The hurricane caused severe beach erosion, power outages affecting 200,000 customers, and spawned multiple tornadoes. Total damage exceeded $5.1 billion in the United States, while damage in the Bahamas was estimated at over $3.4 billion.',
             track: [[24.0, -74.0], [25.0, -76.0], [26.6, -78.0], [27.5, -79.0], [28.5, -80.0], [30.0, -80.5]]},
            
            // 2018 Storms
            {id: 10, name: 'Michael', category: 5, year: 2018, month: 10, day: 10, windSpeed: 160, pressure: 919,
             lat: 30.0, lon: -85.4, state: 'FL', landfall: 'Mexico Beach, FL', deaths: 74,
             impact: 'Hurricane Michael explosively intensified into the first Category 5 hurricane to strike the Florida Panhandle, bringing unprecedented destruction to the region. The storm\'s 160 mph winds and 14-foot storm surge obliterated the coastal town of Mexico Beach, where entire blocks of homes were swept away. Panama City suffered catastrophic damage with thousands of structures destroyed and massive deforestation. Tyndall Air Force Base was severely damaged, with many aircraft unable to evacuate destroyed. The hurricane maintained major hurricane strength well inland, causing significant damage to agriculture and timber industries in Georgia and Alabama. Michael killed 74 people and caused over $25 billion in damage, forever changing the landscape and communities of the Florida Panhandle. Recovery efforts continue years later in the hardest-hit areas.',
             track: [[18.0, -84.0], [20.0, -85.0], [22.0, -86.0], [24.0, -86.5], [26.0, -86.0], [28.0, -85.5], [30.0, -85.4]]},
            
            // Historical storms
            {id: 11, name: 'Labor Day', category: 5, year: 1935, month: 9, day: 2, windSpeed: 185, pressure: 892,
             lat: 24.8, lon: -80.8, state: 'FL', landfall: 'Florida Keys', deaths: 423,
             impact: 'The Labor Day Hurricane of 1935 remains the most intense hurricane ever to make landfall in the United States, with a minimum pressure of 892 mb and sustained winds of 185 mph. This compact but extremely powerful storm delivered a catastrophic 18-20 foot storm surge to the Florida Keys, washing entire settlements into the sea. A rescue train sent to evacuate residents was swept off the tracks by the surge, killing over 200 World War I veterans working on the Overseas Highway. The hurricane\'s extreme winds sandblasted vegetation and structures, leaving some areas completely barren. Total fatalities exceeded 400, with many bodies never recovered. The storm\'s destruction led to improved hurricane forecasting and evacuation procedures. The devastation was so complete that some communities were never rebuilt.',
             track: [[23.0, -75.0], [23.5, -77.0], [24.0, -79.0], [24.8, -80.8]]},
            
            {id: 12, name: 'Camille', category: 5, year: 1969, month: 8, day: 17, windSpeed: 175, pressure: 900,
             lat: 30.3, lon: -89.0, state: 'MS', landfall: 'Pass Christian, MS', deaths: 259,
             impact: 'Hurricane Camille struck the Mississippi coast as one of only four Category 5 hurricanes to make U.S. landfall, bringing sustained winds of 175 mph and an incomprehensible 24-foot storm surge. The storm\'s extreme intensity literally wiped the towns of Pass Christian, Long Beach, and Clermont Harbor off the map. Entire apartment complexes and hotels collapsed under the surge and winds, including the infamous Richelieu Apartments where 23 people perished during a "hurricane party." Ships were carried miles inland, and Highway 90 was completely destroyed. The hurricane maintained significant strength inland, causing catastrophic flooding in Virginia that killed 113 people. Total deaths reached 259 with damage exceeding $1.4 billion (1969 dollars). Camille\'s legacy led to the implementation of the Saffir-Simpson Hurricane Scale.',
             track: [[18.0, -75.0], [20.0, -78.0], [22.0, -81.0], [24.0, -84.0], [26.0, -86.0], [28.0, -87.5], [30.3, -89.0]]},
            
            {id: 13, name: 'Andrew', category: 5, year: 1992, month: 8, day: 24, windSpeed: 165, pressure: 922,
             lat: 25.5, lon: -80.3, state: 'FL', landfall: 'Homestead, FL', deaths: 65,
             impact: 'Hurricane Andrew redefined hurricane devastation for modern America, striking South Florida as a compact but extremely intense Category 5 hurricane. The storm\'s 165 mph sustained winds and gusts over 200 mph caused catastrophic damage in a 20-mile swath through southern Miami-Dade County. Entire neighborhoods in Homestead and Florida City were obliterated, with over 25,000 homes destroyed and 100,000 more damaged. The hurricane exposed widespread building code violations, leading to major reforms in construction standards. Andrew\'s precise weather instruments recorded a peak gust of 177 mph before failing. The storm left 250,000 people homeless, destroyed Homestead Air Force Base, and caused $27 billion in damage. Agricultural losses were severe, essentially ending South Dade\'s thriving nursery and tropical fruit industries. Andrew remains the costliest natural disaster in Florida history.',
             track: [[12.0, -48.0], [14.0, -54.0], [16.0, -60.0], [18.0, -66.0], [20.0, -70.0], [22.0, -74.0], [23.5, -77.0], [25.5, -80.3]]},
            
            {id: 14, name: 'Katrina', category: 3, year: 2005, month: 8, day: 29, windSpeed: 125, pressure: 920,
             lat: 29.3, lon: -89.6, state: 'LA', landfall: 'Louisiana/Mississippi', deaths: 1833,
             impact: 'Hurricane Katrina became the deadliest and costliest natural disaster in modern U.S. history, causing catastrophic devastation along the Gulf Coast. While Katrina weakened to Category 3 before landfall, its massive size generated a record 28-foot storm surge that overwhelmed Mississippi coastal communities and breached New Orleans\' levee system. The failure of the levees led to the flooding of 80% of New Orleans, with some neighborhoods under 15-20 feet of water for weeks. Over 1,800 people died, many trapped in attics or drowned in the rising waters. The storm displaced over one million people, destroyed 300,000 homes, and caused $125 billion in damage. The catastrophe exposed critical failures in disaster preparedness and response, leading to major reforms in emergency management. Entire communities along the Mississippi coast were erased, and New Orleans\' population has never fully recovered.',
             track: [[23.0, -75.0], [24.0, -77.0], [25.0, -79.0], [25.5, -80.3], [24.5, -82.0], [25.0, -84.0], [26.0, -86.0], [27.0, -88.0], [29.3, -89.6]]}
        ],

        init() {
            // Delay map initialization to ensure DOM is ready and has dimensions
            this.$nextTick(() => {
                setTimeout(() => {
                    this.initMap();
                    this.updateVisualization();
                    this.updateStateComparison();
                    this.searchDatabase();
                }, 200);
            });
            
            // Watch for filter changes
            this.$watch('filters.categories', () => this.updateVisualization());
            
            // Watch for tab changes to invalidate map size and update content
            this.$watch('activeTab', () => {
                if (this.activeTab === 'timeline' && this.hurricaneMap) {
                    setTimeout(() => {
                        this.hurricaneMap.invalidateSize();
                    }, 100);
                } else if (this.activeTab === 'tracker') {
                    setTimeout(() => {
                        this.updateStateComparison();
                    }, 100);
                } else if (this.activeTab === 'database') {
                    this.searchDatabase();
                }
            });
        },

        initMap() {
            // Initialize the map
            const mapElement = document.getElementById('hurricane-map');
            if (mapElement && mapElement.offsetHeight > 0) {
                this.hurricaneMap = L.map('hurricane-map', {
                    center: [25, -80],
                    zoom: 5,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    zoomControl: true
                });
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(this.hurricaneMap);
                
                // Force a size update
                this.hurricaneMap.invalidateSize();
            }
        },

        resetFilters() {
            this.filters = {
                yearStart: 1851,
                yearEnd: 2030,
                monthStart: 5,
                monthEnd: 11,
                categories: ['0', '1', '2', '3', '4', '5'],
                state: '',
                search: ''
            };
            this.updateVisualization();
        },

        updateVisualization() {
            // Filter storms based on current filters
            this.filteredStorms = this.allStorms.filter(storm => {
                // Year filter
                if (storm.year < this.filters.yearStart || storm.year > this.filters.yearEnd) return false;
                
                // Month filter
                if (storm.month < this.filters.monthStart || storm.month > this.filters.monthEnd) return false;
                
                // Category filter
                if (!this.filters.categories.includes(storm.category.toString())) return false;
                
                // State filter
                if (this.filters.state && storm.state !== this.filters.state) return false;
                
                // Search filter
                if (this.filters.search && !storm.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
                
                return true;
            });

            // Update statistics
            this.majorHurricanes = this.filteredStorms.filter(s => s.category >= 3).length;

            // Update map
            this.updateMap();

            // Update timeline
            this.updateTimeline();
        },

        updateMap() {
            // Clear existing markers
            this.mapMarkers.forEach(marker => this.hurricaneMap.removeLayer(marker));
            this.mapMarkers = [];

            // Clear existing polylines
            this.hurricaneMap.eachLayer(layer => {
                if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                    this.hurricaneMap.removeLayer(layer);
                }
            });

            // Add filtered storms to map
            this.filteredStorms.forEach(storm => {
                // Draw track if available with gradient colors based on intensity
                if (storm.track && storm.track.length > 0) {
                    // For now, use single color for entire track
                    // In future, could implement gradient based on intensity at each point
                    const polyline = L.polyline(storm.track, {
                        color: this.getCategoryColor(storm.category),
                        weight: 4,
                        opacity: 0.8
                    }).addTo(this.hurricaneMap);
                }

                // Add landfall marker
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${this.getCategoryColor(storm.category)}; 
                           width: 12px; height: 12px; border-radius: 50%; 
                           border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5)"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });

                const marker = L.marker([storm.lat, storm.lon], {icon})
                    .addTo(this.hurricaneMap)
                    .bindPopup(`
                        <strong>${storm.name} (${storm.year})</strong><br>
                        Category ${storm.category}<br>
                        ${storm.windSpeed} mph<br>
                        ${storm.landfall || 'No US Landfall'}
                    `)
                    .on('click', () => this.selectStorm(storm));

                this.mapMarkers.push(marker);
            });

            // Fit map to show all storm tracks
            if (this.filteredStorms.length > 0) {
                const bounds = L.latLngBounds([]);
                this.filteredStorms.forEach(storm => {
                    if (storm.track && storm.track.length > 0) {
                        storm.track.forEach(point => {
                            bounds.extend(point);
                        });
                    }
                });
                if (bounds.isValid()) {
                    this.hurricaneMap.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        },

        updateTimeline() {
            // Create the timeline with months on X-axis and years on Y-axis
            const monthNames = ['', '', '', '', '', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
            
            const trace = {
                x: this.filteredStorms.map(s => s.month),
                y: this.filteredStorms.map(s => s.year),
                mode: 'markers',
                type: 'scatter',
                name: 'Hurricanes',
                text: this.filteredStorms.map(s => 
                    `${s.name}<br>${monthNames[s.month]} ${s.day}, ${s.year}<br>Category ${s.category}<br>${s.windSpeed} mph`
                ),
                marker: {
                    size: this.filteredStorms.map(s => 8 + s.category * 3),
                    color: this.filteredStorms.map(s => s.category),
                    colorscale: [
                        [0, '#5DADE2'],      // TS - Light Blue
                        [0.2, '#3498DB'],    // Cat 1 - Blue
                        [0.4, '#2ECC71'],    // Cat 2 - Green
                        [0.6, '#F1C40F'],    // Cat 3 - Yellow
                        [0.8, '#E67E22'],    // Cat 4 - Orange
                        [1, '#E74C3C']       // Cat 5 - Red
                    ],
                    cmin: 0,
                    cmax: 5,
                    showscale: true,
                    colorbar: {
                        title: 'Category',
                        tickmode: 'array',
                        tickvals: [0, 1, 2, 3, 4, 5],
                        ticktext: ['TS', '1', '2', '3', '4', '5'],
                        len: 0.5,
                        y: 0.5
                    },
                    line: {
                        color: 'white',
                        width: 1
                    }
                },
                hovertemplate: '%{text}<extra></extra>'
            };

            const layout = {
                xaxis: { 
                    title: 'Month',
                    tickmode: 'array',
                    tickvals: [5, 6, 7, 8, 9, 10, 11],
                    ticktext: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                    range: [this.filters.monthStart - 0.5, this.filters.monthEnd + 0.5],
                    showgrid: true,
                    gridcolor: '#e0e0e0'
                },
                yaxis: { 
                    title: 'Year',
                    range: [this.filters.yearEnd + 1, this.filters.yearStart - 1], // Reversed so newest is on top
                    dtick: 10,
                    showgrid: true,
                    gridcolor: '#e0e0e0'
                },
                hovermode: 'closest',
                margin: {l: 60, r: 20, t: 20, b: 40},
                plot_bgcolor: '#f8f9fa',
                paper_bgcolor: 'white'
            };

            const config = {
                responsive: true,
                displayModeBar: false
            };

            Plotly.newPlot('timeline-chart', [trace], layout, config);
            
            // Add click handler
            document.getElementById('timeline-chart').on('plotly_click', (data) => {
                const storm = this.filteredStorms[data.points[0].pointIndex];
                this.selectStorm(storm);
            });
        },

        selectStorm(storm) {
            this.selectedStorm = storm;
            
            // Center map on storm
            if (storm.lat && storm.lon) {
                this.hurricaneMap.setView([storm.lat, storm.lon], 7);
            }
        },

        getCategoryColor(category) {
            const colors = {
                0: '#5DADE2',  // TS - Light Blue
                1: '#3498DB',  // Cat 1 - Blue
                2: '#2ECC71',  // Cat 2 - Green
                3: '#F1C40F',  // Cat 3 - Yellow
                4: '#E67E22',  // Cat 4 - Orange
                5: '#E74C3C'   // Cat 5 - Red
            };
            return colors[category] || '#95A5A6';
        },

        getCategoryLabel(category) {
            const labels = {
                0: 'Tropical Storm',
                1: 'Category 1',
                2: 'Category 2',
                3: 'Category 3',
                4: 'Category 4',
                5: 'Category 5'
            };
            return labels[category] || 'Unknown';
        },

        getMonthName(month) {
            const months = ['', '', '', '', '', 'May', 'June', 'July', 'August', 'September', 'October', 'November'];
            return months[month] || '';
        },

        formatDate(storm) {
            if (!storm) return '';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[storm.month - 1]} ${storm.day}, ${storm.year}`;
        },

        getStateName(code) {
            const stateNames = {
                'TX': 'Texas',
                'LA': 'Louisiana',
                'MS': 'Mississippi',
                'AL': 'Alabama',
                'FL': 'Florida',
                'GA': 'Georgia',
                'SC': 'South Carolina',
                'NC': 'North Carolina'
            };
            return stateNames[code] || code;
        },

        updateStateComparison() {
            // Get storms for selected states within year range
            const stateStorms = this.allStorms.filter(storm => 
                this.selectedStatesComparison.includes(storm.state) &&
                storm.year >= this.stateComparisonYearStart &&
                storm.year <= this.stateComparisonYearEnd
            );

            // Calculate statistics
            this.stateStats.totalStorms = stateStorms.length;
            this.stateStats.majorHurricanes = stateStorms.filter(s => s.category >= 3).length;
            this.stateStats.cat5Storms = stateStorms.filter(s => s.category === 5).length;
            // Add up actual deaths from the storms
            this.stateStats.totalDeaths = stateStorms.reduce((sum, s) => sum + (s.deaths || 0), 0);

            // Create timeline visualization similar to the main timeline
            const trace = {
                x: stateStorms.map(s => s.month),
                y: stateStorms.map(s => s.year),
                mode: 'markers',
                type: 'scatter',
                name: 'Hurricanes',
                text: stateStorms.map(s => 
                    `${s.name}<br>${this.getMonthName(s.month)} ${s.day}, ${s.year}<br>Category ${s.category}<br>${s.state}<br>${s.windSpeed} mph`
                ),
                marker: {
                    size: stateStorms.map(s => 10 + s.category * 3),
                    color: stateStorms.map(s => s.category),
                    colorscale: [
                        [0, '#5DADE2'],      // TS - Light Blue
                        [0.2, '#3498DB'],    // Cat 1 - Blue
                        [0.4, '#2ECC71'],    // Cat 2 - Green
                        [0.6, '#F1C40F'],    // Cat 3 - Yellow
                        [0.8, '#E67E22'],    // Cat 4 - Orange
                        [1, '#E74C3C']       // Cat 5 - Red
                    ],
                    cmin: 0,
                    cmax: 5,
                    showscale: false,
                    line: {
                        color: 'white',
                        width: 1
                    },
                    symbol: stateStorms.map(s => {
                        // Different symbols for different states
                        const symbols = {
                            'FL': 'circle',
                            'TX': 'square',
                            'LA': 'diamond',
                            'MS': 'triangle-up',
                            'AL': 'triangle-down',
                            'GA': 'star',
                            'SC': 'hexagon',
                            'NC': 'pentagon'
                        };
                        return symbols[s.state] || 'circle';
                    })
                },
                hovertemplate: '%{text}<extra></extra>'
            };

            const layout = {
                title: `Multi-State Hurricane Landfalls (${this.stateComparisonYearStart}-${this.stateComparisonYearEnd})`,
                xaxis: { 
                    title: '',
                    tickmode: 'array',
                    tickvals: [6, 7, 8, 9, 10, 11],
                    ticktext: ['June', 'July', 'August', 'September', 'October', 'November'],
                    range: [5.5, 11.5],
                    showgrid: true,
                    gridcolor: '#e0e0e0'
                },
                yaxis: { 
                    title: '',
                    range: [this.stateComparisonYearEnd + 1, this.stateComparisonYearStart - 1],
                    dtick: 10,
                    showgrid: true,
                    gridcolor: '#e0e0e0'
                },
                hovermode: 'closest',
                margin: {l: 60, r: 20, t: 40, b: 60},
                plot_bgcolor: '#f8f9fa',
                paper_bgcolor: 'white',
                font: {
                    family: 'Arial, sans-serif',
                    size: 12
                }
            };

            const config = {
                responsive: true,
                displayModeBar: false
            };

            Plotly.newPlot('state-timeline-chart', [trace], layout, config);
        },

        searchDatabase() {
            if (this.dbSearch) {
                this.dbResults = this.allStorms.filter(storm => 
                    storm.name.toLowerCase().includes(this.dbSearch.toLowerCase()) ||
                    storm.year.toString().includes(this.dbSearch) ||
                    storm.landfall.toLowerCase().includes(this.dbSearch.toLowerCase())
                );
            } else {
                this.dbResults = [...this.allStorms];
            }
        },

        viewStormOnMap(storm) {
            this.selectedStorm = storm;
            this.activeTab = 'timeline';
            this.selectStorm(storm);
        },

        getCategoryClass(category) {
            const classes = {
                0: 'bg-blue-100 text-blue-800',
                1: 'bg-blue-100 text-blue-800',
                2: 'bg-green-100 text-green-800',
                3: 'bg-yellow-100 text-yellow-800',
                4: 'bg-orange-100 text-orange-800',
                5: 'bg-red-100 text-red-800'
            };
            return classes[category] || 'bg-gray-100 text-gray-800';
        }
    }
}

// AI Assistant functionality
function aiAssistant() {
    return {
        showChat: false,
        messages: [],
        currentMessage: '',
        isLoading: false,
        messageId: 0,
        
        // CloudFlare Worker URL - Replace with your deployed worker URL
        WORKER_URL: 'https://hurricane-ai.YOUR-SUBDOMAIN.workers.dev',
        
        sendMessage() {
            if (!this.currentMessage.trim() || this.isLoading) return;
            
            const userMessage = this.currentMessage;
            this.addMessage('user', userMessage);
            this.currentMessage = '';
            this.isLoading = true;
            
            // For demo purposes, use local processing
            // In production, this would call the CloudFlare Worker
            this.processLocalQuery(userMessage);
        },
        
        askQuestion(question) {
            this.currentMessage = question;
            this.sendMessage();
        },
        
        addMessage(role, content) {
            this.messages.push({
                id: this.messageId++,
                role: role,
                content: content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            
            // Scroll to bottom
            this.$nextTick(() => {
                this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
            });
        },
        
        processLocalQuery(query) {
            // Simulate AI processing with local pattern matching
            setTimeout(() => {
                const lowerQuery = query.toLowerCase();
                let response = '';
                let filters = null;
                
                // Pattern matching for common queries
                if (lowerQuery.includes('category 5') || lowerQuery.includes('cat 5')) {
                    response = "I found 3 Category 5 hurricanes in the database: Michael (2018), Labor Day (1935), and Andrew (1992). These are the most powerful storms on record.";
                    filters = { category: 5 };
                }
                else if (lowerQuery.includes('florida') && lowerQuery.includes('2004')) {
                    response = "Florida was hit by 4 major hurricanes in 2004: Charley (Cat 4), Frances (Cat 2), Ivan (Cat 3), and Jeanne (Cat 3). This was one of the most active hurricane seasons for Florida.";
                    filters = { state: 'FL', yearStart: 2004, yearEnd: 2004 };
                }
                else if (lowerQuery.includes('deadliest') || lowerQuery.includes('most deaths')) {
                    response = "The deadliest hurricane in the database is Hurricane Katrina (2005) with 1,833 deaths, followed by the Labor Day Hurricane (1935) with 423 deaths.";
                    filters = { yearStart: 2005, yearEnd: 2005 };
                }
                else if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
                    response = "The most recent hurricanes in 2024 are Alberto (Category 1) which hit Texas in June, and Beryl (Category 4) which struck Texas in July.";
                    filters = { yearStart: 2024, yearEnd: 2024 };
                }
                else if (lowerQuery.includes('texas')) {
                    response = "Texas has been hit by several major hurricanes including Harvey (2017), Laura (2020), and most recently Beryl (2024). These storms have caused significant damage along the Texas coast.";
                    filters = { state: 'TX' };
                }
                else {
                    response = "I can help you explore hurricane data. Try asking about specific categories, years, states, or storm names. For example: 'Show all Category 5 hurricanes' or 'Which storms hit Florida?'";
                }
                
                this.addMessage('assistant', response);
                
                // Apply filters if suggested
                if (filters && window.hurricaneApp) {
                    this.applyFilters(filters);
                }
                
                this.isLoading = false;
            }, 1000);
        },
        
        applyFilters(filters) {
            // Get the main app instance
            const app = document.querySelector('[x-data*="hurricaneApp"]')?._x_dataStack?.[0];
            if (!app) return;
            
            // Apply the filters
            if (filters.category !== undefined) {
                app.filters.categories = [filters.category.toString()];
            }
            if (filters.state) {
                app.filters.state = filters.state;
            }
            if (filters.yearStart !== undefined) {
                app.filters.yearStart = filters.yearStart;
            }
            if (filters.yearEnd !== undefined) {
                app.filters.yearEnd = filters.yearEnd;
            }
            
            // Update visualization and switch to timeline tab
            app.updateVisualization();
            app.activeTab = 'timeline';
            
            // Add a note about applying filters
            setTimeout(() => {
                this.addMessage('assistant', '✓ I\'ve updated the filters on the Timeline tab to show these storms.');
            }, 500);
        },
        
        async callCloudFlareWorker(question) {
            // This would be used in production with a deployed CloudFlare Worker
            try {
                const response = await fetch(this.WORKER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: question,
                        context: 'Hurricane database with storms from 1851-2024'
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                this.addMessage('assistant', data.answer);
                
                if (data.filters) {
                    this.applyFilters(data.filters);
                }
                
            } catch (error) {
                this.addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
                console.error('AI Assistant error:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }
}