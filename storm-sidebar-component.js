// Storm Sidebar Component - Reusable across all dashboard tabs
// Usage: Include this file and call StormSidebar.init() and StormSidebar.updateStorm(storm)

const StormSidebar = {
    // Initialize the sidebar component
    init: function(config = {}) {
        this.config = {
            containerId: config.containerId || 'stormInfoPanel',
            narrativeId: config.narrativeId || 'narrativeContent',
            enableMap: config.enableMap !== false, // Default true
            mapId: config.mapId || 'map',
            // Element IDs with defaults
            categoryIconId: config.categoryIconId || 'categoryIcon',
            stormTitleId: config.stormTitleId || 'stormTitle',
            statDateId: config.statDateId || 'statDate',
            statWindId: config.statWindId || 'statWind',
            statLandfallId: config.statLandfallId || 'statLandfall',
            statDeathsId: config.statDeathsId || 'statDeaths',
            ...config
        };
        
        // Initialize map if enabled
        if (this.config.enableMap) {
            this.initMap();
        }
    },

    // Update storm information in sidebar
    updateStorm: function(storm) {
        if (!storm) {
            this.clearStorm();
            return;
        }

        console.log('=== STORM SIDEBAR UPDATE ===');
        console.log('Storm:', storm);

        // Update storm info panel
        this.updateStormInfoPanel(storm);
        
        // Update map if enabled
        if (this.config.enableMap) {
            this.showStormOnMap(storm);
        }
    },

    // Clear storm information
    clearStorm: function() {
        const icon = document.getElementById(this.config.categoryIconId);
        const title = document.getElementById(this.config.stormTitleId);
        
        if (icon) {
            icon.textContent = 'TS';
            icon.style.backgroundColor = '#8B9DC3';
        }
        
        if (title) {
            title.textContent = 'Select a Storm';
        }
        
        // Clear stats using configurable IDs
        const statFields = [
            this.config.statDateId,
            this.config.statWindId, 
            this.config.statLandfallId,
            this.config.statDeathsId
        ];
        statFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '-';
        });
        
        // Clear narrative
        const narrativeContent = document.getElementById(this.config.narrativeId);
        if (narrativeContent) {
            narrativeContent.textContent = 'Select a storm with landfall history for detailed narrative information.';
        }
    },

    // Update storm info panel with storm data
    updateStormInfoPanel: function(storm) {
        const icon = document.getElementById(this.config.categoryIconId);
        const title = document.getElementById(this.config.stormTitleId);
        
        if (title) title.textContent = storm.name;
        if (icon) {
            icon.textContent = storm.category === 0 ? 'TS' : storm.category;
            icon.style.backgroundColor = this.getCategoryColor(storm.category);
        }
        
        // Update stats using configurable IDs
        const statDate = document.getElementById(this.config.statDateId);
        const statWind = document.getElementById(this.config.statWindId);
        const statLandfall = document.getElementById(this.config.statLandfallId);
        const statDeaths = document.getElementById(this.config.statDeathsId);
        
        if (statDate) statDate.textContent = `${this.getMonthName(storm.month)} ${storm.day}, ${storm.year}`;
        if (statWind) statWind.textContent = `${storm.wind_mph} mph`;
        
        // Show landfall states (enhanced data)
        if (statLandfall) {
            if (storm.landfall_states && storm.landfall_states.length > 0) {
                statLandfall.textContent = storm.landfall_states.join(', ');
            } else {
                statLandfall.textContent = 'No US Landfall';
            }
        }
        
        if (statDeaths) statDeaths.textContent = storm.deaths || '0';
        
        // Update narrative panel
        this.updateNarrative(storm);
    },

    // Update narrative content
    updateNarrative: function(storm) {
        const narrativeContent = document.getElementById(this.config.narrativeId);
        if (!narrativeContent) return;

        // Try to get narrative from storm.narrative first (database)
        if (storm.narrative) {
            narrativeContent.textContent = storm.narrative;
            return;
        }

        // Fallback to STORM_NARRATIVES lookup by name
        if (typeof STORM_NARRATIVES !== 'undefined' && STORM_NARRATIVES[storm.name]) {
            narrativeContent.textContent = STORM_NARRATIVES[storm.name];
            return;
        }

        // Default narrative for storms without detailed history
        const categoryText = storm.category === 0 ? 'tropical storm' : `Category ${storm.category} hurricane`;
        const landfallText = storm.landfall_states && storm.landfall_states.length > 0 
            ? `making landfall in ${storm.landfall_states.join(', ')}` 
            : 'remaining over open ocean';
        
        narrativeContent.textContent = `${storm.name} was a ${categoryText} that occurred in ${storm.year}, ${landfallText}. This storm did not cause significant documented impacts to warrant a detailed historical narrative.`;
    },

    // Get category color
    getCategoryColor: function(category) {
        const colors = {
            0: "#8B9DC3",   // Tropical Storm - Steel Blue
            1: "#5CB85C",   // Cat 1 - Green
            2: "#F0AD4E",   // Cat 2 - Yellow-Orange
            3: "#FF7F00",   // Cat 3 - Orange
            4: "#D9534F",   // Cat 4 - Red
            5: "#8B008B"    // Cat 5 - Dark Magenta
        };
        return colors[category] || "#757575";
    },

    // Get month name
    getMonthName: function(month) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[month-1] || 'Unknown';
    },

    // Initialize map
    initMap: function() {
        if (!this.map && document.getElementById(this.config.mapId)) {
            this.map = L.map(this.config.mapId).setView([25.0, -80.0], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
        }
    },

    // Show storm on map
    showStormOnMap: async function(storm) {
        if (!this.map) return;
        
        // Clear existing layers
        this.map.eachLayer(function(layer) {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                this.map.removeLayer(layer);
            }
        }.bind(this));
        
        // Try to load detailed track data
        const trackData = await this.loadStormTrack(storm);
        
        if (trackData) {
            console.log('Track data loaded, drawing storm track');
            this.drawStormTrack(trackData, storm);
        } else {
            console.log('No track data found, showing single point');
            // Fallback to single point if no track data available
            if (storm.lat && storm.lon) {
                const color = this.getCategoryColor(storm.category);
                L.circleMarker([storm.lat, storm.lon], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    radius: 8
                }).addTo(this.map).bindPopup(`<b>${storm.name}</b><br>Category ${storm.category}<br>${storm.wind_mph} mph`);
                
                this.map.setView([storm.lat, storm.lon], 6);
            }
        }
    },

    // Load storm track data
    loadStormTrack: async function(storm) {
        try {
            const decade = Math.floor(storm.year / 10) * 10;
            const pointsFile = `./hurdat2_data/points_${decade}s.geojson`;
            
            console.log(`Loading track: ${pointsFile} for storm ${storm.storm_id}`);
            
            let pointsResponse = await fetch(pointsFile);
            if (pointsResponse.ok) {
                const pointsData = await pointsResponse.json();
                const pointFeatures = pointsData.features.filter(f => 
                    f.properties.storm_id === storm.storm_id
                );
                
                if (pointFeatures.length > 0) {
                    console.log(`Found ${pointFeatures.length} track points - RAINBOW TRACK`);
                    return { type: 'points', features: pointFeatures };
                }
            }
            
            // Fallback to track lines
            const tracksFile = `./hurdat2_data/tracks_${decade}s.geojson`;
            const tracksResponse = await fetch(tracksFile);
            if (tracksResponse.ok) {
                const tracksData = await tracksResponse.json();
                const feature = tracksData.features.find(f => 
                    f.properties.storm_id === storm.storm_id
                );
                
                if (feature && feature.geometry.type === 'LineString') {
                    console.log(`Found track line - SINGLE COLOR TRACK`);
                    return { type: 'line', geometry: feature.geometry };
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error loading storm track:', error);
            return null;
        }
    },

    // Draw storm track on map
    drawStormTrack: function(trackData, storm) {
        if (trackData.type === 'points' && trackData.features) {
            this.drawRainbowTrack(trackData.features, storm);
        } else if (trackData.type === 'line' && trackData.geometry) {
            this.drawSimpleTrack(trackData.geometry, storm);
        }
    },

    // Draw rainbow-colored track based on intensity
    drawRainbowTrack: function(pointFeatures, storm) {
        if (pointFeatures.length === 0) return;
        
        // Sort by datetime
        pointFeatures.sort((a, b) => {
            if (a.properties.datetime && b.properties.datetime) {
                return new Date(a.properties.datetime) - new Date(b.properties.datetime);
            }
            return 0;
        });
        
        const allLatLngs = [];
        
        // Draw colored segments between points
        for (let i = 0; i < pointFeatures.length - 1; i++) {
            const current = pointFeatures[i];
            const next = pointFeatures[i + 1];
            
            const currentCoords = [current.geometry.coordinates[1], current.geometry.coordinates[0]];
            const nextCoords = [next.geometry.coordinates[1], next.geometry.coordinates[0]];
            
            allLatLngs.push(currentCoords);
            
            // Use the higher category of the two points for segment color
            // Handle both old format (max_wind) and new format (usa_status)
            let category = 0;
            
            // First try usa_status (newer data format)
            if (current.properties.usa_status !== undefined || next.properties.usa_status !== undefined) {
                category = Math.max(
                    current.properties.usa_status || 0,
                    next.properties.usa_status || 0
                );
            } else {
                // Fall back to calculating from max_wind (older data format)
                const maxWind = Math.max(
                    current.properties.max_wind || 0,
                    next.properties.max_wind || 0
                );
                
                // Calculate category from wind speed in knots
                if (maxWind >= 137) category = 5;      // 157+ mph  
                else if (maxWind >= 113) category = 4; // 130-156 mph
                else if (maxWind >= 96) category = 3;  // 111-129 mph
                else if (maxWind >= 83) category = 2;  // 96-110 mph
                else if (maxWind >= 64) category = 1;  // 74-95 mph
                else category = 0;                     // <74 mph (TS/TD)
            }
            
            const segmentColor = this.getCategoryColor(category);
            
            L.polyline([currentCoords, nextCoords], {
                color: segmentColor,
                weight: 4,
                opacity: 0.9
            }).addTo(this.map);
        }
        
        // Add last point
        if (pointFeatures.length > 0) {
            const lastPoint = pointFeatures[pointFeatures.length - 1];
            allLatLngs.push([lastPoint.geometry.coordinates[1], lastPoint.geometry.coordinates[0]]);
        }
        
        // Add start and end markers
        if (allLatLngs.length >= 2) {
            // Start marker (green)
            L.circleMarker(allLatLngs[0], {
                color: '#00ff00',
                fillColor: '#00ff00',
                fillOpacity: 0.8,
                radius: 6,
                weight: 2
            }).addTo(this.map).bindPopup(`<b>${storm.name}</b><br>Track Start`);
            
            // End marker (category color)
            const endColor = this.getCategoryColor(storm.category);
            L.circleMarker(allLatLngs[allLatLngs.length - 1], {
                color: endColor,
                fillColor: endColor,
                fillOpacity: 0.9,
                radius: 8,
                weight: 3
            }).addTo(this.map).bindPopup(`<b>${storm.name}</b><br>Peak: Cat ${storm.category}, ${storm.wind_mph} mph`);
        }
        
        // Fit map to show track
        if (allLatLngs.length > 0) {
            this.map.fitBounds(allLatLngs, {padding: [20, 20]});
        }
    },

    // Draw simple single-color track
    drawSimpleTrack: function(geometry, storm) {
        const coords = geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const stormColor = this.getCategoryColor(storm.category);
        
        L.polyline(coords, {
            color: stormColor,
            weight: 4,
            opacity: 0.9
        }).addTo(this.map);
        
        // Add start and end markers
        if (coords.length >= 2) {
            // Start marker (green)
            L.circleMarker(coords[0], {
                color: '#00ff00',
                fillColor: '#00ff00',
                fillOpacity: 0.8,
                radius: 6,
                weight: 2
            }).addTo(this.map).bindPopup(`<b>${storm.name}</b><br>Track Start`);
            
            // End marker (category color)
            L.circleMarker(coords[coords.length - 1], {
                color: stormColor,
                fillColor: stormColor,
                fillOpacity: 0.9,
                radius: 8,
                weight: 3
            }).addTo(this.map).bindPopup(`<b>${storm.name}</b><br>Peak: Cat ${storm.category}, ${storm.wind_mph} mph`);
        }
        
        // Fit map to show track
        this.map.fitBounds(coords, {padding: [20, 20]});
    }
};

// Make it globally available
window.StormSidebar = StormSidebar;