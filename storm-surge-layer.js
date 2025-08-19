// Storm Surge Visualization Layer for Leaflet Maps
// Displays storm surge predictions and historical surge data

class StormSurgeLayer {
    constructor(map) {
        this.map = map;
        this.surgeLayer = null;
        this.legend = null;
    }

    // Storm surge categories and colors (NOAA/NHC standard)
    getSurgeColor(height) {
        if (height >= 9) return '#4A0404';      // >9 ft - Catastrophic (Dark Red)
        if (height >= 6) return '#8B0000';      // 6-9 ft - Life-threatening (Red)
        if (height >= 3) return '#FF4500';      // 3-6 ft - Dangerous (Orange-Red)
        if (height >= 1) return '#FFA500';      // 1-3 ft - Moderate (Orange)
        return '#FFD700';                       // <1 ft - Minor (Yellow)
    }

    // Calculate estimated storm surge based on hurricane category and distance from eye
    calculateSurge(category, distanceFromEye, isRightQuadrant = true) {
        // Base surge heights by category (feet)
        const baseSurge = {
            '-1': 0,  // TD
            '0': 2,   // TS
            '1': 4,   // Cat 1
            '2': 7,   // Cat 2
            '3': 10,  // Cat 3
            '4': 15,  // Cat 4
            '5': 20   // Cat 5
        };

        let surge = baseSurge[category] || 0;

        // Adjust for distance from eye (surge decreases with distance)
        const distanceFactor = Math.max(0, 1 - (distanceFromEye / 100));
        surge *= distanceFactor;

        // Right front quadrant typically has 20-40% higher surge
        if (isRightQuadrant) {
            surge *= 1.3;
        }

        return Math.round(surge * 10) / 10; // Round to 1 decimal
    }

    // Display surge zones for a specific storm
    displayStormSurge(storm) {
        this.clearSurge();

        if (!storm.lat || !storm.lon || storm.category < 0) {
            return; // No surge for tropical depressions or missing data
        }

        // Create surge zones as concentric circles
        const surgeZones = [];
        const center = [storm.lat, storm.lon];

        // Define surge zones based on category
        const zoneConfigs = this.getSurgeZoneConfig(storm.category);

        zoneConfigs.forEach(config => {
            const circle = L.circle(center, {
                radius: config.radius * 1000, // Convert km to meters
                fillColor: this.getSurgeColor(config.surge),
                fillOpacity: 0.3,
                color: this.getSurgeColor(config.surge),
                weight: 1,
                opacity: 0.7
            });

            circle.bindPopup(`
                <strong>Storm Surge Zone</strong><br>
                Expected Surge: ${config.surge} ft<br>
                Distance from Eye: ${config.radius} km<br>
                <span style="color: ${this.getSurgeColor(config.surge)}">
                    ${this.getSurgeCategory(config.surge)}
                </span>
            `);

            surgeZones.push(circle);
        });

        // Add all zones to a layer group
        this.surgeLayer = L.layerGroup(surgeZones).addTo(this.map);

        // Add legend
        this.addSurgeLegend();

        // Add coastal vulnerability overlay if near coast
        if (this.isNearCoast(storm.lat, storm.lon)) {
            this.addCoastalVulnerability(center, storm.category);
        }
    }

    // Get surge zone configuration based on storm category
    getSurgeZoneConfig(category) {
        const configs = {
            0: [ // Tropical Storm
                { radius: 30, surge: 2 },
                { radius: 60, surge: 1 }
            ],
            1: [ // Category 1
                { radius: 30, surge: 5 },
                { radius: 60, surge: 3 },
                { radius: 90, surge: 1 }
            ],
            2: [ // Category 2
                { radius: 40, surge: 8 },
                { radius: 80, surge: 5 },
                { radius: 120, surge: 2 }
            ],
            3: [ // Category 3
                { radius: 50, surge: 12 },
                { radius: 100, surge: 7 },
                { radius: 150, surge: 3 }
            ],
            4: [ // Category 4
                { radius: 60, surge: 16 },
                { radius: 120, surge: 10 },
                { radius: 180, surge: 4 }
            ],
            5: [ // Category 5
                { radius: 70, surge: 20 },
                { radius: 140, surge: 12 },
                { radius: 210, surge: 5 }
            ]
        };

        return configs[category] || configs[0];
    }

    // Get surge danger category
    getSurgeCategory(height) {
        if (height >= 9) return 'Catastrophic';
        if (height >= 6) return 'Life-threatening';
        if (height >= 3) return 'Dangerous';
        if (height >= 1) return 'Moderate';
        return 'Minor';
    }

    // Check if location is near coast (simplified)
    isNearCoast(lat, lon) {
        // Florida coastal boundaries (simplified)
        const floridaBounds = {
            west: -87.6,
            east: -79.8,
            south: 24.5,
            north: 31.0
        };

        return lat >= floridaBounds.south && 
               lat <= floridaBounds.north && 
               lon >= floridaBounds.west && 
               lon <= floridaBounds.east;
    }

    // Add coastal vulnerability indicators
    addCoastalVulnerability(center, category) {
        // Add markers for vulnerable areas
        const vulnerableAreas = [
            { name: 'Low-lying Areas', icon: '⚠️', offset: [0.05, 0.05] },
            { name: 'Barrier Islands', icon: '🏝️', offset: [-0.05, 0.05] },
            { name: 'Inlets & Bays', icon: '🌊', offset: [0.05, -0.05] }
        ];

        vulnerableAreas.forEach(area => {
            const marker = L.marker([
                center[0] + area.offset[0],
                center[1] + area.offset[1]
            ], {
                icon: L.divIcon({
                    html: `<div style="font-size: 20px;">${area.icon}</div>`,
                    className: 'surge-vulnerability-icon',
                    iconSize: [30, 30]
                })
            });

            marker.bindPopup(`
                <strong>${area.name}</strong><br>
                High vulnerability to storm surge<br>
                Expected surge: ${this.calculateSurge(category, 20, true)} ft
            `);

            if (this.surgeLayer) {
                this.surgeLayer.addLayer(marker);
            }
        });
    }

    // Add surge legend to map
    addSurgeLegend() {
        if (this.legend) {
            this.map.removeControl(this.legend);
        }

        this.legend = L.control({ position: 'bottomright' });

        this.legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'surge-legend');
            div.style.background = 'white';
            div.style.padding = '10px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';

            div.innerHTML = `
                <h4 style="margin: 0 0 5px 0; font-size: 14px;">Storm Surge Height</h4>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div><span style="background: #4A0404; width: 20px; height: 10px; display: inline-block;"></span> >9 ft - Catastrophic</div>
                    <div><span style="background: #8B0000; width: 20px; height: 10px; display: inline-block;"></span> 6-9 ft - Life-threatening</div>
                    <div><span style="background: #FF4500; width: 20px; height: 10px; display: inline-block;"></span> 3-6 ft - Dangerous</div>
                    <div><span style="background: #FFA500; width: 20px; height: 10px; display: inline-block;"></span> 1-3 ft - Moderate</div>
                    <div><span style="background: #FFD700; width: 20px; height: 10px; display: inline-block;"></span> <1 ft - Minor</div>
                </div>
            `;

            return div;
        };

        this.legend.addTo(this.map);
    }

    // Display historical surge data for a storm
    displayHistoricalSurge(storm) {
        // Historic surge data for major storms
        const historicalSurges = {
            'KATRINA': { maxSurge: 28, location: 'Pass Christian, MS' },
            'CAMILLE': { maxSurge: 24, location: 'Pass Christian, MS' },
            'MICHAEL': { maxSurge: 14, location: 'Mexico Beach, FL' },
            'IAN': { maxSurge: 15, location: 'Fort Myers Beach, FL' },
            'SANDY': { maxSurge: 14, location: 'Staten Island, NY' },
            'IKE': { maxSurge: 22, location: 'Chambers County, TX' },
            'HARVEY': { maxSurge: 12, location: 'Port Aransas, TX' }
        };

        const data = historicalSurges[storm.name];
        if (data && storm.lat && storm.lon) {
            const marker = L.marker([storm.lat, storm.lon], {
                icon: L.divIcon({
                    html: `<div style="background: red; color: white; padding: 5px; border-radius: 3px; font-weight: bold;">
                        ${data.maxSurge} ft
                    </div>`,
                    className: 'surge-marker',
                    iconSize: [50, 25]
                })
            });

            marker.bindPopup(`
                <strong>Historical Maximum Storm Surge</strong><br>
                Storm: ${storm.name} (${storm.year})<br>
                Max Surge: ${data.maxSurge} feet<br>
                Location: ${data.location}
            `);

            if (this.surgeLayer) {
                this.surgeLayer.addLayer(marker);
            }
        }
    }

    // Clear surge visualization
    clearSurge() {
        if (this.surgeLayer) {
            this.map.removeLayer(this.surgeLayer);
            this.surgeLayer = null;
        }
        if (this.legend) {
            this.map.removeControl(this.legend);
            this.legend = null;
        }
    }

    // Toggle surge display
    toggle(storm) {
        if (this.surgeLayer) {
            this.clearSurge();
        } else {
            this.displayStormSurge(storm);
            this.displayHistoricalSurge(storm);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StormSurgeLayer;
}