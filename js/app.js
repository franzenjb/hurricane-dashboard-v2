function hurricaneApp() {
    return {
        activeTab: 'timeline',
        selectedStorm: null,
        selectedStates: ['Florida', 'Texas', 'Louisiana'],
        availableStates: ['Florida', 'Texas', 'Louisiana', 'Mississippi', 'Alabama', 'Georgia', 'South Carolina', 'North Carolina'],
        dbSearch: '',
        dbResults: [],
        
        filters: {
            yearStart: 1980,
            yearEnd: 2024,
            category: '',
            month: '',
            search: ''
        },
        
        statistics: {
            total: 0,
            major: 0,
            average: 0
        },

        // Sample data for demonstration
        sampleStorms: [
            { id: 1, year: 2024, name: 'Alberto', category: 1, windSpeed: 75, date: '2024-06-19', landfall: 'Texas', lat: 26.0, lon: -97.2 },
            { id: 2, year: 2024, name: 'Beryl', category: 4, windSpeed: 145, date: '2024-07-08', landfall: 'Jamaica/Texas', lat: 28.5, lon: -96.0 },
            { id: 3, year: 2023, name: 'Idalia', category: 3, windSpeed: 125, date: '2023-08-30', landfall: 'Florida', lat: 29.8, lon: -83.4 },
            { id: 4, year: 2022, name: 'Ian', category: 4, windSpeed: 150, date: '2022-09-28', landfall: 'Florida', lat: 26.7, lon: -82.2 },
            { id: 5, year: 2022, name: 'Nicole', category: 1, windSpeed: 75, date: '2022-11-10', landfall: 'Florida', lat: 27.5, lon: -80.2 },
            { id: 6, year: 2021, name: 'Ida', category: 4, windSpeed: 150, date: '2021-08-29', landfall: 'Louisiana', lat: 29.2, lon: -90.1 },
            { id: 7, year: 2020, name: 'Laura', category: 4, windSpeed: 150, date: '2020-08-27', landfall: 'Louisiana', lat: 30.0, lon: -93.3 },
            { id: 8, year: 2020, name: 'Sally', category: 2, windSpeed: 105, date: '2020-09-16', landfall: 'Alabama', lat: 30.3, lon: -87.6 },
            { id: 9, year: 2019, name: 'Dorian', category: 5, windSpeed: 185, date: '2019-09-01', landfall: 'Bahamas', lat: 26.6, lon: -78.0 },
            { id: 10, year: 2018, name: 'Michael', category: 5, windSpeed: 160, date: '2018-10-10', landfall: 'Florida', lat: 30.0, lon: -85.4 }
        ],

        init() {
            this.updateTimeline();
            this.updateComparison();
            this.searchDatabase();
            
            // Watch for filter changes
            this.$watch('filters', () => this.updateTimeline());
            this.$watch('selectedStates', () => this.updateComparison());
        },

        updateTimeline() {
            const filteredStorms = this.filterStorms();
            
            const trace = {
                x: filteredStorms.map(s => s.date),
                y: filteredStorms.map(s => s.windSpeed),
                mode: 'markers',
                type: 'scatter',
                name: 'Hurricanes',
                text: filteredStorms.map(s => `${s.name} (${s.year})<br>Category ${s.category}<br>${s.windSpeed} mph`),
                marker: {
                    size: filteredStorms.map(s => 10 + s.category * 3),
                    color: filteredStorms.map(s => s.category),
                    colorscale: [
                        [0, '#3B82F6'],
                        [0.25, '#10B981'],
                        [0.5, '#F59E0B'],
                        [0.75, '#EF4444'],
                        [1, '#991B1B']
                    ],
                    showscale: true,
                    colorbar: {
                        title: 'Category',
                        tickmode: 'array',
                        tickvals: [1, 2, 3, 4, 5],
                        ticktext: ['1', '2', '3', '4', '5']
                    }
                }
            };

            const layout = {
                title: 'Hurricane Timeline',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Wind Speed (mph)' },
                hovermode: 'closest',
                plot_bgcolor: '#F9FAFB',
                paper_bgcolor: '#F9FAFB'
            };

            Plotly.newPlot('timeline-chart', [trace], layout, {responsive: true});
            
            // Add click handler
            document.getElementById('timeline-chart').on('plotly_click', (data) => {
                const point = data.points[0];
                const storm = filteredStorms[point.pointIndex];
                this.selectStorm(storm);
            });
        },

        filterStorms() {
            return this.sampleStorms.filter(storm => {
                if (storm.year < this.filters.yearStart || storm.year > this.filters.yearEnd) return false;
                if (this.filters.category && storm.category != this.filters.category) return false;
                if (this.filters.month) {
                    const stormMonth = new Date(storm.date).getMonth() + 1;
                    if (stormMonth != this.filters.month) return false;
                }
                if (this.filters.search && !storm.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
                return true;
            });
        },

        selectStorm(storm) {
            this.selectedStorm = storm;
            
            // Initialize map if not already done
            if (!this.stormMap) {
                this.stormMap = L.map('storm-map').setView([25, -80], 5);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.stormMap);
            }
            
            // Clear existing markers
            this.stormMap.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.stormMap.removeLayer(layer);
                }
            });
            
            // Add storm marker
            L.marker([storm.lat, storm.lon])
                .addTo(this.stormMap)
                .bindPopup(`<b>${storm.name}</b><br>Category ${storm.category}<br>${storm.windSpeed} mph`)
                .openPopup();
            
            this.stormMap.setView([storm.lat, storm.lon], 7);
        },

        updateComparison() {
            const stateData = {};
            this.selectedStates.forEach(state => {
                stateData[state] = this.sampleStorms.filter(s => s.landfall.includes(state));
            });

            const traces = this.selectedStates.map(state => ({
                x: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
                y: [1, 2, 3, 4, 5].map(cat => 
                    stateData[state].filter(s => s.category === cat).length
                ),
                name: state,
                type: 'bar'
            }));

            const layout = {
                title: 'Hurricane Comparison by State',
                xaxis: { title: 'Category' },
                yaxis: { title: 'Number of Hurricanes' },
                barmode: 'group',
                plot_bgcolor: '#F9FAFB',
                paper_bgcolor: '#F9FAFB'
            };

            Plotly.newPlot('comparison-chart', traces, layout, {responsive: true});

            // Update statistics
            const allStorms = Object.values(stateData).flat();
            this.statistics.total = allStorms.length;
            this.statistics.major = allStorms.filter(s => s.category >= 3).length;
            this.statistics.average = (allStorms.length / this.selectedStates.length).toFixed(1);
        },

        searchDatabase() {
            // Filter storms based on search
            if (this.dbSearch) {
                this.dbResults = this.sampleStorms.filter(storm => 
                    storm.name.toLowerCase().includes(this.dbSearch.toLowerCase()) ||
                    storm.year.toString().includes(this.dbSearch) ||
                    storm.landfall.toLowerCase().includes(this.dbSearch.toLowerCase())
                );
            } else {
                this.dbResults = this.sampleStorms;
            }
        },

        viewStormDetails(storm) {
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
        }
    }
}