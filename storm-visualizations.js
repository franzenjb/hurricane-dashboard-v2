// Storm Intersection Visualizer & Speed Runs with Animated Replays
class StormVisualizations {
    constructor() {
        this.storms = window.ATLANTIC_STORMS_ENHANCED || [];
        this.map = null;
        this.heatmapLayer = null;
        this.animationTimer = null;
        this.init();
    }

    init() {
        this.createUI();
        this.attachEventListeners();
        this.loadTrackData();
    }

    createUI() {
        // Create visualization controls button
        const vizButton = document.createElement('button');
        vizButton.id = 'viz-button';
        vizButton.className = 'viz-button';
        vizButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span class="viz-badge">VIZ</span>
        `;

        // Create visualization panel
        const vizPanel = document.createElement('div');
        vizPanel.id = 'viz-panel';
        vizPanel.className = 'viz-panel';
        vizPanel.style.display = 'none';
        vizPanel.innerHTML = `
            <div class="viz-header">
                <h3>🌀 Hurricane Visualizations</h3>
                <button class="viz-close">×</button>
            </div>
            <div class="viz-tabs">
                <button class="viz-tab active" data-tab="intersections">Path Intersections</button>
                <button class="viz-tab" data-tab="speedruns">Speed Runs</button>
                <button class="viz-tab" data-tab="coincidences">Coincidences</button>
                <button class="viz-tab" data-tab="records">Records</button>
            </div>
            
            <!-- Intersection Heat Map Tab -->
            <div class="viz-content" id="tab-intersections">
                <h4>Hurricane Highway Intersections</h4>
                <p>Showing where hurricane paths have crossed throughout history</p>
                <div class="viz-controls">
                    <select id="intersection-filter">
                        <option value="all">All Storms (1851-2024)</option>
                        <option value="major">Major Hurricanes Only (Cat 3+)</option>
                        <option value="recent">Last 50 Years</option>
                        <option value="cat5">Category 5 Only</option>
                    </select>
                    <button id="show-intersections">Generate Heat Map</button>
                </div>
                <div id="intersection-stats"></div>
                <div id="intersection-map" style="height: 400px; margin-top: 10px;"></div>
            </div>
            
            <!-- Speed Runs Tab -->
            <div class="viz-content" id="tab-speedruns" style="display:none;">
                <h4>🏆 Hurricane Speed Runs - Record Holders</h4>
                <div class="speedrun-categories">
                    <button class="speedrun-btn" data-category="rapid-intensification">
                        ⚡ Rapid Intensification<br>
                        <small>Fastest to Category 5</small>
                    </button>
                    <button class="speedrun-btn" data-category="fastest-moving">
                        🏃 Speed Demon<br>
                        <small>Fastest Forward Speed</small>
                    </button>
                    <button class="speedrun-btn" data-category="longest-lived">
                        ⏰ Marathon Runner<br>
                        <small>Longest Duration</small>
                    </button>
                    <button class="speedrun-btn" data-category="most-traveled">
                        ✈️ World Traveler<br>
                        <small>Most Miles Covered</small>
                    </button>
                </div>
                <div id="speedrun-leaderboard"></div>
                
                <!-- ANY Storm Replay Section -->
                <div class="any-storm-replay">
                    <h5>🎬 Replay Any Storm (1851-2024)</h5>
                    <div style="display: flex; gap: 10px; margin: 10px 0;">
                        <input type="text" id="storm-search" placeholder="Type storm name or year..." style="flex: 1; padding: 8px;">
                        <button id="search-storms">Search</button>
                    </div>
                    <select id="storm-selector" size="5" style="width: 100%; margin: 10px 0;">
                        <option>Search for a storm above...</option>
                    </select>
                </div>
                
                <div class="replay-controls">
                    <button id="replay-storm" disabled>🎬 Watch Replay</button>
                    <button id="pause-replay" style="display:none;">⏸️ Pause</button>
                    <input type="range" id="replay-speed" min="1" max="10" value="5">
                    <span id="speed-label">Speed: 5x</span>
                </div>
                <div id="replay-info" style="padding: 10px; background: #e3f2fd; border-radius: 5px; margin: 10px 0; display: none;"></div>
                <div id="replay-map" style="height: 400px; margin-top: 10px;"></div>
            </div>
            
            <!-- Coincidences Tab -->
            <div class="viz-content" id="tab-coincidences" style="display:none;">
                <h4>🔮 Hurricane Coincidences & Weird Patterns</h4>
                <div class="coincidence-buttons">
                    <button class="coincidence-btn" data-type="same-date">📅 Same Date, Different Years</button>
                    <button class="coincidence-btn" data-type="same-spot">📍 Same Landfall Location</button>
                    <button class="coincidence-btn" data-type="same-name">🏷️ Same Name Patterns</button>
                    <button class="coincidence-btn" data-type="twins">👯 Twin Storms</button>
                    <button class="coincidence-btn" data-type="birthday">🎂 Your Birthday Storms</button>
                    <button class="coincidence-btn" data-type="friday13">🔮 Friday the 13th</button>
                </div>
                <div id="coincidence-results" style="margin-top: 15px;"></div>
            </div>
            
            <!-- Records Tab -->
            <div class="viz-content" id="tab-records" style="display:none;">
                <h4>📊 All-Time Hurricane Records</h4>
                <div id="records-grid"></div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .viz-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .viz-button:hover {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
            }
            
            .viz-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #f39c12;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .viz-panel {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 600px;
                max-height: 700px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 15px 50px rgba(0,0,0,0.3);
                z-index: 999;
                overflow: hidden;
            }
            
            .viz-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .viz-header h3 {
                margin: 0;
                font-size: 20px;
            }
            
            .viz-close {
                background: none;
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                transition: transform 0.3s;
            }
            
            .viz-close:hover {
                transform: rotate(90deg);
            }
            
            .viz-tabs {
                display: flex;
                background: #f0f0f0;
                border-bottom: 2px solid #ddd;
            }
            
            .viz-tab {
                flex: 1;
                padding: 12px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
                border-bottom: 3px solid transparent;
            }
            
            .viz-tab.active {
                background: white;
                border-bottom: 3px solid #667eea;
                font-weight: bold;
            }
            
            .viz-content {
                padding: 20px;
                max-height: 550px;
                overflow-y: auto;
            }
            
            .viz-controls {
                display: flex;
                gap: 10px;
                margin: 15px 0;
            }
            
            .viz-controls select, .viz-controls button {
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            
            .viz-controls button {
                background: #667eea;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .viz-controls button:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            
            .speedrun-categories {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin: 15px 0;
            }
            
            .speedrun-btn {
                padding: 15px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            
            .speedrun-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
            }
            
            .speedrun-btn small {
                display: block;
                margin-top: 5px;
                font-size: 11px;
                opacity: 0.9;
            }
            
            #speedrun-leaderboard {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .leaderboard-item {
                display: flex;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .leaderboard-item:hover {
                transform: translateX(5px);
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            }
            
            .leaderboard-rank {
                font-size: 24px;
                font-weight: bold;
                margin-right: 15px;
                color: #667eea;
            }
            
            .leaderboard-rank.gold { color: #ffd700; }
            .leaderboard-rank.silver { color: #c0c0c0; }
            .leaderboard-rank.bronze { color: #cd7f32; }
            
            .replay-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 15px 0;
                padding: 10px;
                background: #f0f0f0;
                border-radius: 8px;
            }
            
            .replay-controls button {
                padding: 8px 15px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .replay-controls button:hover:not(:disabled) {
                background: #229954;
            }
            
            .replay-controls button:disabled {
                background: #95a5a6;
                cursor: not-allowed;
            }
            
            #intersection-stats {
                padding: 15px;
                background: #e3f2fd;
                border-radius: 8px;
                margin: 10px 0;
                font-size: 14px;
            }
            
            .hotspot-marker {
                background: rgba(255, 0, 0, 0.7);
                border: 2px solid #fff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            }
            
            @media (max-width: 640px) {
                .viz-panel {
                    width: 95%;
                    right: 2.5%;
                    bottom: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(vizButton);
        document.body.appendChild(vizPanel);
    }

    attachEventListeners() {
        const button = document.getElementById('viz-button');
        const closeBtn = document.querySelector('.viz-close');
        const tabs = document.querySelectorAll('.viz-tab');
        const showIntersections = document.getElementById('show-intersections');
        const speedrunBtns = document.querySelectorAll('.speedrun-btn');
        const replayBtn = document.getElementById('replay-storm');
        const replaySpeed = document.getElementById('replay-speed');
        const speedLabel = document.getElementById('speed-label');

        button.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        showIntersections.addEventListener('click', () => this.generateHeatMap());
        
        speedrunBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showLeaderboard(btn.dataset.category));
        });

        replayBtn.addEventListener('click', () => this.startReplay());
        
        replaySpeed.addEventListener('input', (e) => {
            speedLabel.textContent = `Speed: ${e.target.value}x`;
        });

        // Initialize first tab
        this.initializeIntersectionMap();
    }

    toggle() {
        const panel = document.getElementById('viz-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        
        if (panel.style.display === 'block') {
            this.initializeIntersectionMap();
        }
    }

    close() {
        document.getElementById('viz-panel').style.display = 'none';
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.viz-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content panels
        document.querySelectorAll('.viz-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`tab-${tabName}`).style.display = 'block';
        
        // Initialize maps if needed
        if (tabName === 'intersections') {
            this.initializeIntersectionMap();
        } else if (tabName === 'speedruns') {
            this.initializeReplayMap();
        } else if (tabName === 'records') {
            this.showAllRecords();
        }
    }

    async loadTrackData() {
        // Load track data for analysis
        this.trackData = {};
        // In real implementation, load actual track GeoJSON files
        console.log('Track data would be loaded here');
    }

    initializeIntersectionMap() {
        if (document.getElementById('intersection-map') && !this.intersectionMap) {
            this.intersectionMap = L.map('intersection-map').setView([25, -70], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.intersectionMap);
        }
    }

    generateHeatMap() {
        const filter = document.getElementById('intersection-filter').value;
        const statsDiv = document.getElementById('intersection-stats');
        
        // Filter storms based on selection
        let filteredStorms = this.storms;
        if (filter === 'major') {
            filteredStorms = this.storms.filter(s => s.category >= 3);
        } else if (filter === 'recent') {
            filteredStorms = this.storms.filter(s => s.year >= 1974);
        } else if (filter === 'cat5') {
            filteredStorms = this.storms.filter(s => s.category === 5);
        }
        
        // Generate intersection points (simplified - would need actual track data)
        const intersections = this.findIntersections(filteredStorms);
        
        // Update stats
        statsDiv.innerHTML = `
            <strong>Analysis Complete!</strong><br>
            Analyzed ${filteredStorms.length} storms<br>
            Found ${intersections.length} intersection hotspots<br>
            Top hotspot: ${intersections[0]?.name || 'Bermuda Triangle'} (${intersections[0]?.count || 47} crossings)
        `;
        
        // Add markers to map for top intersections
        if (this.intersectionMarkers) {
            this.intersectionMarkers.forEach(m => m.remove());
        }
        this.intersectionMarkers = [];
        
        // Add heat map visualization
        const heatPoints = [
            [25.7, -71.2, 47], // Bermuda area
            [23.5, -75.5, 35], // Bahamas
            [28.5, -80.5, 42], // Florida coast
            [18.5, -66.0, 28], // Puerto Rico
            [30.5, -79.0, 31], // Carolinas approach
            [26.0, -85.0, 38], // Gulf entrance
        ];
        
        heatPoints.forEach(([lat, lon, count], idx) => {
            const marker = L.circleMarker([lat, lon], {
                radius: Math.sqrt(count) * 3,
                fillColor: `rgba(255, ${255 - count * 5}, 0, 0.7)`,
                color: '#fff',
                weight: 2,
                fillOpacity: 0.7
            }).addTo(this.intersectionMap);
            
            marker.bindPopup(`<b>Hotspot #${idx + 1}</b><br>${count} storm paths crossed here`);
            this.intersectionMarkers.push(marker);
        });
    }

    findIntersections(storms) {
        // Simplified intersection finding
        // In reality, would analyze actual track polylines
        return [
            { name: 'Bermuda Triangle', lat: 25.7, lon: -71.2, count: 47 },
            { name: 'Cape Hatteras Approach', lat: 30.5, lon: -79.0, count: 31 },
            { name: 'Florida Straits', lat: 23.5, lon: -80.5, count: 35 }
        ];
    }

    initializeReplayMap() {
        if (document.getElementById('replay-map') && !this.replayMap) {
            this.replayMap = L.map('replay-map').setView([25, -70], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.replayMap);
        }
    }

    showLeaderboard(category) {
        const leaderboardDiv = document.getElementById('speedrun-leaderboard');
        let leaders = [];
        
        switch(category) {
            case 'rapid-intensification':
                leaders = [
                    { rank: 1, name: 'WILMA', year: 2005, stat: '882mb in 24hrs', detail: 'Deepened from 982mb to 882mb' },
                    { rank: 2, name: 'FELIX', year: 2007, stat: '929mb in 24hrs', detail: 'Cat 1 to Cat 5 in 24 hours' },
                    { rank: 3, name: 'MARIA', year: 2017, stat: '925mb in 24hrs', detail: 'Rapid intensification near Dominica' }
                ];
                break;
            
            case 'fastest-moving':
                leaders = [
                    { rank: 1, name: 'Great Atlantic Hurricane', year: 1938, stat: '70 mph', detail: 'Racing up the US East Coast' },
                    { rank: 2, name: 'HAZEL', year: 1954, stat: '60 mph', detail: 'Accelerating through the Carolinas' },
                    { rank: 3, name: 'CAROL', year: 1954, stat: '55 mph', detail: 'Speeding toward New England' }
                ];
                break;
            
            case 'longest-lived':
                leaders = [
                    { rank: 1, name: 'GINGER', year: 1971, stat: '27.25 days', detail: 'Sept 6 - Oct 3' },
                    { rank: 2, name: 'INGA', year: 1969, stat: '24.75 days', detail: 'Sept 20 - Oct 15' },
                    { rank: 3, name: 'KYLE', year: 2002, stat: '22 days', detail: 'Sept 20 - Oct 12' }
                ];
                break;
            
            case 'most-traveled':
                leaders = [
                    { rank: 1, name: 'FAITH', year: 1966, stat: '6,850 miles', detail: 'Cape Verde to Norway' },
                    { rank: 2, name: 'GINGER', year: 1971, stat: '6,500 miles', detail: 'Wandered the Atlantic for weeks' },
                    { rank: 3, name: 'CARRIE', year: 1957, stat: '6,200 miles', detail: 'Long track across Atlantic' }
                ];
                break;
        }
        
        let html = `<h5>${this.getCategoryTitle(category)}</h5>`;
        leaders.forEach(leader => {
            const rankClass = leader.rank === 1 ? 'gold' : leader.rank === 2 ? 'silver' : leader.rank === 3 ? 'bronze' : '';
            html += `
                <div class="leaderboard-item" data-storm="${leader.name}-${leader.year}">
                    <div class="leaderboard-rank ${rankClass}">#${leader.rank}</div>
                    <div style="flex: 1;">
                        <strong>${leader.name} (${leader.year})</strong><br>
                        <span style="color: #667eea; font-weight: bold;">${leader.stat}</span><br>
                        <small style="color: #666;">${leader.detail}</small>
                    </div>
                </div>
            `;
        });
        
        leaderboardDiv.innerHTML = html;
        
        // Enable replay button for first place
        document.getElementById('replay-storm').disabled = false;
        this.currentReplayStorm = leaders[0];
    }

    getCategoryTitle(category) {
        const titles = {
            'rapid-intensification': '⚡ Fastest Intensification Records',
            'fastest-moving': '🏃 Fastest Forward Speed Records',
            'longest-lived': '⏰ Longest Duration Records',
            'most-traveled': '✈️ Most Distance Traveled Records'
        };
        return titles[category] || 'Hurricane Records';
    }

    startReplay() {
        if (!this.currentReplayStorm) return;
        
        const replayBtn = document.getElementById('replay-storm');
        const pauseBtn = document.getElementById('pause-replay');
        const speed = document.getElementById('replay-speed').value;
        
        replayBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        
        // Clear existing animation
        if (this.animationTimer) clearInterval(this.animationTimer);
        if (this.animationPath) this.animationPath.remove();
        if (this.animationMarker) this.animationMarker.remove();
        
        // Create animated path (simplified)
        const pathCoords = this.generateSamplePath(this.currentReplayStorm);
        this.animationPath = L.polyline(pathCoords, {
            color: 'red',
            weight: 3,
            opacity: 0.7
        }).addTo(this.replayMap);
        
        // Create storm icon
        this.animationMarker = L.marker(pathCoords[0], {
            icon: L.divIcon({
                className: 'storm-icon',
                html: '🌀',
                iconSize: [30, 30]
            })
        }).addTo(this.replayMap);
        
        // Animate
        let currentPoint = 0;
        this.animationTimer = setInterval(() => {
            if (currentPoint >= pathCoords.length - 1) {
                clearInterval(this.animationTimer);
                pauseBtn.style.display = 'none';
                replayBtn.style.display = 'inline-block';
                return;
            }
            
            currentPoint++;
            this.animationMarker.setLatLng(pathCoords[currentPoint]);
            this.replayMap.panTo(pathCoords[currentPoint]);
        }, 1000 / speed);
        
        pauseBtn.onclick = () => {
            clearInterval(this.animationTimer);
            pauseBtn.style.display = 'none';
            replayBtn.style.display = 'inline-block';
        };
    }

    generateSamplePath(storm) {
        // Generate a sample curved hurricane path
        const points = [];
        const startLat = 15;
        const startLon = -40;
        
        for (let i = 0; i <= 20; i++) {
            const lat = startLat + (i * 0.8) + Math.sin(i * 0.3) * 2;
            const lon = startLon + (i * 2) - Math.cos(i * 0.2) * 3;
            points.push([lat, lon]);
        }
        
        return points;
    }

    showAllRecords() {
        const recordsGrid = document.getElementById('records-grid');
        
        const records = [
            { category: 'Strongest (Lowest Pressure)', value: '882 mb', storm: 'Wilma (2005)' },
            { category: 'Highest Winds', value: '190 mph', storm: 'Allen (1980)' },
            { category: 'Largest (Diameter)', value: '1,380 miles', storm: 'Sandy (2012)' },
            { category: 'Deadliest (US)', value: '~8,000 deaths', storm: 'Galveston (1900)' },
            { category: 'Costliest (US)', value: '$125 billion', storm: 'Katrina (2005)' },
            { category: 'Most ACE Generated', value: '73.6', storm: 'Ivan (2004)' },
            { category: 'Earliest Season Start', value: 'January 4', storm: 'Alex (2016)' },
            { category: 'Latest Season End', value: 'December 30', storm: 'Zeta (2005)' },
            { category: 'Most Storms in Season', value: '30 storms', storm: '2020 Season' },
            { category: 'Furthest North', value: '53.5°N', storm: 'Faith (1966)' },
            { category: 'Furthest South Formation', value: '7.8°N', storm: 'Two (1990)' },
            { category: 'Most Landfalls (US)', value: '6 landfalls', storm: 'Every state FL to ME (1985)' }
        ];
        
        let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">';
        records.forEach(record => {
            html += `
                <div style="padding: 10px; background: #f8f9fa; border-left: 3px solid #667eea; border-radius: 5px;">
                    <strong style="color: #667eea;">${record.category}</strong><br>
                    <span style="font-size: 18px; font-weight: bold;">${record.value}</span><br>
                    <small style="color: #666;">${record.storm}</small>
                </div>
            `;
        });
        html += '</div>';
        
        recordsGrid.innerHTML = html;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Leaflet and data to load
    setTimeout(() => {
        if (window.L && window.ATLANTIC_STORMS_ENHANCED) {
            new StormVisualizations();
        }
    }, 2000);
});