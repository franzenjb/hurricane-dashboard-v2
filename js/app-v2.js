function hurricaneApp() {
    return {
        activeTab: 'timeline',
        selectedStorm: null,
        selectedStates: ['FL', 'TX', 'LA'],
        availableStates: [
            {code: 'FL', name: 'Florida'},
            {code: 'TX', name: 'Texas'},
            {code: 'LA', name: 'Louisiana'},
            {code: 'MS', name: 'Mississippi'},
            {code: 'AL', name: 'Alabama'},
            {code: 'GA', name: 'Georgia'},
            {code: 'SC', name: 'South Carolina'},
            {code: 'NC', name: 'North Carolina'}
        ],
        dbSearch: '',
        dbResults: [],
        hurricaneMap: null,
        stateMap: null,
        
        filters: {
            yearStart: 2018,
            yearEnd: 2024,
            category: '',
            state: '',
            search: ''
        },
        
        statistics: {
            total: 0,
            major: 0,
            mostActive: 'Florida'
        },

        // Enhanced hurricane data with tracks
        hurricaneData: [
            {
                id: 1,
                year: 2024,
                name: 'Alberto',
                category: 1,
                windSpeed: 75,
                pressure: 985,
                date: '2024-06-19',
                landfall: 'Texas Coast',
                state: 'TX',
                impact: 'Minimal damage, heavy rainfall in coastal areas',
                track: [
                    {lat: 23.5, lon: -95.0},
                    {lat: 24.5, lon: -95.5},
                    {lat: 25.5, lon: -96.0},
                    {lat: 26.5, lon: -96.5},
                    {lat: 27.5, lon: -97.0}
                ],
                landfallPoint: {lat: 27.5, lon: -97.0}
            },
            {
                id: 2,
                year: 2024,
                name: 'Beryl',
                category: 4,
                windSpeed: 145,
                pressure: 938,
                date: '2024-07-08',
                landfall: 'Texas Coast',
                state: 'TX',
                impact: 'Major damage to coastal infrastructure, widespread power outages',
                track: [
                    {lat: 16.0, lon: -83.0},
                    {lat: 18.0, lon: -85.0},
                    {lat: 20.0, lon: -87.0},
                    {lat: 22.0, lon: -89.0},
                    {lat: 24.0, lon: -91.0},
                    {lat: 26.0, lon: -93.0},
                    {lat: 28.0, lon: -95.0}
                ],
                landfallPoint: {lat: 28.0, lon: -95.0}
            },
            {
                id: 3,
                year: 2023,
                name: 'Idalia',
                category: 3,
                windSpeed: 125,
                pressure: 949,
                date: '2023-08-30',
                landfall: 'Big Bend, FL',
                state: 'FL',
                impact: 'Significant storm surge, flooding in Big Bend region',
                track: [
                    {lat: 20.0, lon: -84.0},
                    {lat: 22.0, lon: -84.5},
                    {lat: 24.0, lon: -84.0},
                    {lat: 26.0, lon: -83.5},
                    {lat: 28.0, lon: -83.5},
                    {lat: 29.8, lon: -83.4}
                ],
                landfallPoint: {lat: 29.8, lon: -83.4}
            },
            {
                id: 4,
                year: 2022,
                name: 'Ian',
                category: 4,
                windSpeed: 150,
                pressure: 937,
                date: '2022-09-28',
                landfall: 'Fort Myers, FL',
                state: 'FL',
                impact: 'Catastrophic damage in Southwest Florida, $112 billion in damages',
                track: [
                    {lat: 14.0, lon: -66.0},
                    {lat: 16.0, lon: -70.0},
                    {lat: 18.0, lon: -74.0},
                    {lat: 20.0, lon: -78.0},
                    {lat: 22.0, lon: -81.0},
                    {lat: 24.0, lon: -82.5},
                    {lat: 26.7, lon: -82.2}
                ],
                landfallPoint: {lat: 26.7, lon: -82.2}
            },
            {
                id: 5,
                year: 2022,
                name: 'Nicole',
                category: 1,
                windSpeed: 75,
                pressure: 980,
                date: '2022-11-10',
                landfall: 'Vero Beach, FL',
                state: 'FL',
                impact: 'Beach erosion, flooding along east coast',
                track: [
                    {lat: 25.0, lon: -77.0},
                    {lat: 26.0, lon: -78.0},
                    {lat: 27.0, lon: -79.0},
                    {lat: 27.5, lon: -80.2}
                ],
                landfallPoint: {lat: 27.5, lon: -80.2}
            },
            {
                id: 6,
                year: 2021,
                name: 'Ida',
                category: 4,
                windSpeed: 150,
                pressure: 929,
                date: '2021-08-29',
                landfall: 'Port Fourchon, LA',
                state: 'LA',
                impact: 'Devastating damage to Louisiana, prolonged power outages',
                track: [
                    {lat: 19.0, lon: -80.0},
                    {lat: 21.0, lon: -82.0},
                    {lat: 23.0, lon: -84.0},
                    {lat: 25.0, lon: -86.0},
                    {lat: 27.0, lon: -88.0},
                    {lat: 29.2, lon: -90.1}
                ],
                landfallPoint: {lat: 29.2, lon: -90.1}
            },
            {
                id: 7,
                year: 2020,
                name: 'Laura',
                category: 4,
                windSpeed: 150,
                pressure: 939,
                date: '2020-08-27',
                landfall: 'Cameron, LA',
                state: 'LA',
                impact: 'Extreme wind damage in Southwest Louisiana',
                track: [
                    {lat: 20.0, lon: -86.0},
                    {lat: 22.0, lon: -88.0},
                    {lat: 24.0, lon: -90.0},
                    {lat: 26.0, lon: -91.5},
                    {lat: 28.0, lon: -92.5},
                    {lat: 30.0, lon: -93.3}
                ],
                landfallPoint: {lat: 30.0, lon: -93.3}
            },
            {
                id: 8,
                year: 2020,
                name: 'Sally',
                category: 2,
                windSpeed: 105,
                pressure: 965,
                date: '2020-09-16',
                landfall: 'Gulf Shores, AL',
                state: 'AL',
                impact: 'Historic flooding from slow movement',
                track: [
                    {lat: 25.0, lon: -85.0},
                    {lat: 26.0, lon: -86.0},
                    {lat: 27.0, lon: -86.5},
                    {lat: 28.5, lon: -87.0},
                    {lat: 30.3, lon: -87.6}
                ],
                landfallPoint: {lat: 30.3, lon: -87.6}
            },
            {
                id: 9,
                year: 2019,
                name: 'Dorian',
                category: 5,
                windSpeed: 185,
                pressure: 910,
                date: '2019-09-01',
                landfall: 'Abaco Islands, Bahamas',
                state: 'FL',
                impact: 'Catastrophic damage in Bahamas, Florida coast impacts',
                track: [
                    {lat: 24.0, lon: -74.0},
                    {lat: 25.0, lon: -76.0},
                    {lat: 26.6, lon: -78.0},
                    {lat: 27.5, lon: -79.0},
                    {lat: 28.5, lon: -80.0},
                    {lat: 30.0, lon: -80.5}
                ],
                landfallPoint: {lat: 26.6, lon: -78.0}
            },
            {
                id: 10,
                year: 2018,
                name: 'Michael',
                category: 5,
                windSpeed: 160,
                pressure: 919,
                date: '2018-10-10',
                landfall: 'Mexico Beach, FL',
                state: 'FL',
                impact: 'First Cat 5 to hit Florida Panhandle, catastrophic damage',
                track: [
                    {lat: 18.0, lon: -84.0},
                    {lat: 20.0, lon: -85.0},
                    {lat: 22.0, lon: -86.0},
                    {lat: 24.0, lon: -86.5},
                    {lat: 26.0, lon: -86.0},
                    {lat: 28.0, lon: -85.5},
                    {lat: 30.0, lon: -85.4}
                ],
                landfallPoint: {lat: 30.0, lon: -85.4}
            }
        ],

        init() {
            this.initMaps();
            this.updateTimeline();
            this.updateComparison();
            this.searchDatabase();
            
            // Watch for filter changes
            this.$watch('filters', () => {
                this.updateTimeline();
                this.updateMapMarkers();
            });
            this.$watch('selectedStates', () => this.updateComparison());
        },

        initMaps() {
            // Initialize hurricane tracking map
            this.hurricaneMap = L.map('hurricane-map').setView([28, -88], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.hurricaneMap);

            // Initialize state comparison map
            setTimeout(() => {
                if (document.getElementById('state-map')) {
                    this.stateMap = L.map('state-map').setView([32, -90], 5);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(this.stateMap);
                }
            }, 100);

            this.updateMapMarkers();
        },

        updateMapMarkers() {
            if (!this.hurricaneMap) return;

            // Clear existing layers
            this.hurricaneMap.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
                    this.hurricaneMap.removeLayer(layer);
                }
            });

            const filteredStorms = this.getFilteredStorms();

            filteredStorms.forEach(storm => {
                // Draw storm track
                if (storm.track) {
                    const trackCoords = storm.track.map(point => [point.lat, point.lon]);
                    L.polyline(trackCoords, {
                        color: this.getCategoryColor(storm.category),
                        weight: 3,
                        opacity: 0.7
                    }).addTo(this.hurricaneMap).bindPopup(`${storm.name} (${storm.year})`);
                }

                // Add landfall marker
                if (storm.landfallPoint) {
                    const icon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: ${this.getCategoryColor(storm.category)}; 
                               width: 12px; height: 12px; border-radius: 50%; 
                               border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4)"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    });

                    L.marker([storm.landfallPoint.lat, storm.landfallPoint.lon], {icon})
                        .addTo(this.hurricaneMap)
                        .bindPopup(`
                            <strong>${storm.name} (${storm.year})</strong><br>
                            Category ${storm.category}<br>
                            ${storm.windSpeed} mph<br>
                            ${storm.landfall}
                        `)
                        .on('click', () => this.selectStorm(storm));
                }
            });
        },

        updateTimeline() {
            const filteredStorms = this.getFilteredStorms();
            
            const trace = {
                x: filteredStorms.map(s => s.date),
                y: filteredStorms.map(s => s.category),
                mode: 'markers+text',
                type: 'scatter',
                name: 'Hurricanes',
                text: filteredStorms.map(s => s.name),
                textposition: 'top center',
                marker: {
                    size: filteredStorms.map(s => 10 + s.windSpeed/10),
                    color: filteredStorms.map(s => s.windSpeed),
                    colorscale: 'Viridis',
                    showscale: true,
                    colorbar: {
                        title: 'Wind Speed<br>(mph)',
                        thickness: 15
                    }
                },
                hovertemplate: '<b>%{text}</b><br>' +
                               'Date: %{x}<br>' +
                               'Category: %{y}<br>' +
                               '<extra></extra>'
            };

            const layout = {
                title: '',
                xaxis: { 
                    title: 'Date',
                    type: 'date'
                },
                yaxis: { 
                    title: 'Category',
                    range: [0, 6],
                    tickmode: 'linear',
                    tick0: 0,
                    dtick: 1
                },
                hovermode: 'closest',
                margin: {l: 50, r: 20, t: 20, b: 50}
            };

            Plotly.newPlot('timeline-chart', [trace], layout, {responsive: true});
            
            document.getElementById('timeline-chart').on('plotly_click', (data) => {
                const storm = filteredStorms[data.points[0].pointIndex];
                this.selectStorm(storm);
            });
        },

        getFilteredStorms() {
            return this.hurricaneData.filter(storm => {
                if (storm.year < this.filters.yearStart || storm.year > this.filters.yearEnd) return false;
                if (this.filters.category && storm.category != this.filters.category) return false;
                if (this.filters.state && storm.state !== this.filters.state) return false;
                if (this.filters.search && !storm.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
                return true;
            });
        },

        selectStorm(storm) {
            this.selectedStorm = storm;
            
            // Pan map to storm
            if (storm.landfallPoint && this.hurricaneMap) {
                this.hurricaneMap.setView([storm.landfallPoint.lat, storm.landfallPoint.lon], 7);
            }
        },

        updateComparison() {
            const stateData = {};
            this.selectedStates.forEach(stateCode => {
                const stateName = this.availableStates.find(s => s.code === stateCode)?.name;
                stateData[stateName] = this.hurricaneData.filter(s => s.state === stateCode);
            });

            const traces = Object.keys(stateData).map(state => ({
                x: [1, 2, 3, 4, 5],
                y: [1, 2, 3, 4, 5].map(cat => 
                    stateData[state].filter(s => s.category === cat).length
                ),
                name: state,
                type: 'bar'
            }));

            const layout = {
                xaxis: { 
                    title: 'Category',
                    tickmode: 'array',
                    tickvals: [1, 2, 3, 4, 5],
                    ticktext: ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4', 'Cat 5']
                },
                yaxis: { title: 'Number of Hurricanes' },
                barmode: 'group',
                margin: {l: 50, r: 20, t: 20, b: 50}
            };

            Plotly.newPlot('comparison-chart', traces, layout, {responsive: true});

            // Update statistics
            const allStorms = Object.values(stateData).flat();
            this.statistics.total = allStorms.length;
            this.statistics.major = allStorms.filter(s => s.category >= 3).length;
            
            // Find most active state
            let maxCount = 0;
            let mostActive = '';
            Object.entries(stateData).forEach(([state, storms]) => {
                if (storms.length > maxCount) {
                    maxCount = storms.length;
                    mostActive = state;
                }
            });
            this.statistics.mostActive = mostActive;
        },

        searchDatabase() {
            if (this.dbSearch) {
                this.dbResults = this.hurricaneData.filter(storm => 
                    storm.name.toLowerCase().includes(this.dbSearch.toLowerCase()) ||
                    storm.year.toString().includes(this.dbSearch) ||
                    storm.landfall.toLowerCase().includes(this.dbSearch.toLowerCase())
                );
            } else {
                this.dbResults = this.hurricaneData;
            }
        },

        viewStormOnMap(storm) {
            this.selectedStorm = storm;
            this.activeTab = 'timeline';
            this.selectStorm(storm);
        },

        getCategoryClass(category) {
            const classes = {
                1: 'bg-blue-100 text-blue-800',
                2: 'bg-green-100 text-green-800',
                3: 'bg-yellow-100 text-yellow-800',
                4: 'bg-orange-100 text-orange-800',
                5: 'bg-red-100 text-red-800'
            };
            return classes[category] || 'bg-gray-100 text-gray-800';
        },

        getCategoryColor(category) {
            const colors = {
                1: '#3B82F6',
                2: '#10B981',
                3: '#F59E0B',
                4: '#FB923C',
                5: '#DC2626'
            };
            return colors[category] || '#6B7280';
        }
    }
}