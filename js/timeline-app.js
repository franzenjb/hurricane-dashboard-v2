function hurricaneApp() {
    return {
        activeTab: 'timeline',
        selectedStorm: null,
        hurricaneMap: null,
        mapMarkers: [],
        filteredStorms: [],
        majorHurricanes: 0,
        
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
             lat: 27.5, lon: -97.0, state: 'TX', landfall: 'Texas Coast', 
             impact: 'Minimal damage, heavy rainfall in coastal areas',
             track: [[23.5, -95.0], [24.5, -95.5], [25.5, -96.0], [26.5, -96.5], [27.5, -97.0]]},
            
            {id: 2, name: 'Beryl', category: 4, year: 2024, month: 7, day: 8, windSpeed: 145, pressure: 938,
             lat: 28.0, lon: -95.0, state: 'TX', landfall: 'Texas Coast',
             impact: 'Major damage to coastal infrastructure, widespread power outages',
             track: [[16.0, -83.0], [18.0, -85.0], [20.0, -87.0], [22.0, -89.0], [24.0, -91.0], [26.0, -93.0], [28.0, -95.0]]},
            
            // 2023 Storms
            {id: 3, name: 'Idalia', category: 3, year: 2023, month: 8, day: 30, windSpeed: 125, pressure: 949,
             lat: 29.8, lon: -83.4, state: 'FL', landfall: 'Big Bend, FL',
             impact: 'Significant storm surge, flooding in Big Bend region',
             track: [[20.0, -84.0], [22.0, -84.5], [24.0, -84.0], [26.0, -83.5], [28.0, -83.5], [29.8, -83.4]]},
            
            // 2022 Storms
            {id: 4, name: 'Ian', category: 4, year: 2022, month: 9, day: 28, windSpeed: 150, pressure: 937,
             lat: 26.7, lon: -82.2, state: 'FL', landfall: 'Fort Myers, FL',
             impact: 'Catastrophic damage in Southwest Florida, $112 billion in damages',
             track: [[14.0, -66.0], [16.0, -70.0], [18.0, -74.0], [20.0, -78.0], [22.0, -81.0], [24.0, -82.5], [26.7, -82.2]]},
            
            {id: 5, name: 'Nicole', category: 1, year: 2022, month: 11, day: 10, windSpeed: 75, pressure: 980,
             lat: 27.5, lon: -80.2, state: 'FL', landfall: 'Vero Beach, FL',
             impact: 'Beach erosion, flooding along east coast',
             track: [[25.0, -77.0], [26.0, -78.0], [27.0, -79.0], [27.5, -80.2]]},
            
            // 2021 Storms
            {id: 6, name: 'Ida', category: 4, year: 2021, month: 8, day: 29, windSpeed: 150, pressure: 929,
             lat: 29.2, lon: -90.1, state: 'LA', landfall: 'Port Fourchon, LA',
             impact: 'Devastating damage to Louisiana, prolonged power outages',
             track: [[19.0, -80.0], [21.0, -82.0], [23.0, -84.0], [25.0, -86.0], [27.0, -88.0], [29.2, -90.1]]},
            
            // 2020 Storms
            {id: 7, name: 'Laura', category: 4, year: 2020, month: 8, day: 27, windSpeed: 150, pressure: 939,
             lat: 30.0, lon: -93.3, state: 'LA', landfall: 'Cameron, LA',
             impact: 'Extreme wind damage in Southwest Louisiana',
             track: [[20.0, -86.0], [22.0, -88.0], [24.0, -90.0], [26.0, -91.5], [28.0, -92.5], [30.0, -93.3]]},
            
            {id: 8, name: 'Sally', category: 2, year: 2020, month: 9, day: 16, windSpeed: 105, pressure: 965,
             lat: 30.3, lon: -87.6, state: 'AL', landfall: 'Gulf Shores, AL',
             impact: 'Historic flooding from slow movement',
             track: [[25.0, -85.0], [26.0, -86.0], [27.0, -86.5], [28.5, -87.0], [30.3, -87.6]]},
            
            // 2019 Storms
            {id: 9, name: 'Dorian', category: 5, year: 2019, month: 9, day: 1, windSpeed: 185, pressure: 910,
             lat: 30.0, lon: -80.5, state: '', landfall: 'Bahamas (grazed FL coast)',
             impact: 'Catastrophic damage in Bahamas, Florida coast impacts',
             track: [[24.0, -74.0], [25.0, -76.0], [26.6, -78.0], [27.5, -79.0], [28.5, -80.0], [30.0, -80.5]]},
            
            // 2018 Storms
            {id: 10, name: 'Michael', category: 5, year: 2018, month: 10, day: 10, windSpeed: 160, pressure: 919,
             lat: 30.0, lon: -85.4, state: 'FL', landfall: 'Mexico Beach, FL',
             impact: 'First Cat 5 to hit Florida Panhandle, catastrophic damage',
             track: [[18.0, -84.0], [20.0, -85.0], [22.0, -86.0], [24.0, -86.5], [26.0, -86.0], [28.0, -85.5], [30.0, -85.4]]},
            
            // Historical storms
            {id: 11, name: 'Labor Day', category: 5, year: 1935, month: 9, day: 2, windSpeed: 185, pressure: 892,
             lat: 24.8, lon: -80.8, state: 'FL', landfall: 'Florida Keys',
             impact: 'Most intense hurricane to make US landfall, 400+ deaths',
             track: [[23.0, -75.0], [23.5, -77.0], [24.0, -79.0], [24.8, -80.8]]},
            
            {id: 12, name: 'Camille', category: 5, year: 1969, month: 8, day: 17, windSpeed: 175, pressure: 900,
             lat: 30.3, lon: -89.0, state: 'MS', landfall: 'Pass Christian, MS',
             impact: 'Catastrophic damage along Mississippi coast, 259 deaths',
             track: [[18.0, -75.0], [20.0, -78.0], [22.0, -81.0], [24.0, -84.0], [26.0, -86.0], [28.0, -87.5], [30.3, -89.0]]},
            
            {id: 13, name: 'Andrew', category: 5, year: 1992, month: 8, day: 24, windSpeed: 165, pressure: 922,
             lat: 25.5, lon: -80.3, state: 'FL', landfall: 'Homestead, FL',
             impact: 'Devastating damage in South Florida, $27 billion in damages',
             track: [[12.0, -48.0], [14.0, -54.0], [16.0, -60.0], [18.0, -66.0], [20.0, -70.0], [22.0, -74.0], [23.5, -77.0], [25.5, -80.3]]},
            
            {id: 14, name: 'Katrina', category: 3, year: 2005, month: 8, day: 29, windSpeed: 125, pressure: 920,
             lat: 29.3, lon: -89.6, state: 'LA', landfall: 'Louisiana/Mississippi',
             impact: 'Catastrophic flooding in New Orleans, 1,800+ deaths',
             track: [[23.0, -75.0], [24.0, -77.0], [25.0, -79.0], [25.5, -80.3], [24.5, -82.0], [25.0, -84.0], [26.0, -86.0], [27.0, -88.0], [29.3, -89.6]]}
        ],

        init() {
            this.initMap();
            this.updateVisualization();
            
            // Watch for filter changes
            this.$watch('filters.categories', () => this.updateVisualization());
        },

        initMap() {
            // Initialize the map
            this.hurricaneMap = L.map('hurricane-map').setView([25, -80], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.hurricaneMap);
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
                // Draw track if available
                if (storm.track && storm.track.length > 0) {
                    const polyline = L.polyline(storm.track, {
                        color: this.getCategoryColor(storm.category),
                        weight: 3,
                        opacity: 0.7
                    }).addTo(this.hurricaneMap);
                }

                // Add landfall marker
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${this.getCategoryColor(storm.category)}; 
                           width: 10px; height: 10px; border-radius: 50%; 
                           border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4)"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5]
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

        formatDate(date) {
            if (!date) return '';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[date.month - 1]} ${date.day}, ${date.year}`;
        }
    }
}