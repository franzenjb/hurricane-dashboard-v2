# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: ALWAYS COMMIT AND PUSH CHANGES TO GITHUB 🚨
**AFTER EVERY FILE CHANGE, YOU MUST:**
1. `git add .`
2. `git commit -m "description"`  
3. `git push`

**The user monitors progress through GitHub. Not pushing changes means the user cannot see your work. This is NOT optional.**

## Development Commands

### Local Development (RECOMMENDED WORKFLOW)
```bash
# Start local server for rapid iteration
python3 -m http.server 8000
# Opens at: http://localhost:8000

# IMPORTANT: To avoid cache issues with Chrome:
# 1. Open DevTools (Right-click → Inspect)
# 2. Go to Network tab
# 3. Check "Disable cache" checkbox
# 4. Keep DevTools open while developing
# This ensures you see changes instantly when you save files

# Alternative: Use ./run-local.sh script
./run-local.sh
```

### Deployment
```bash
# REQUIRED AFTER EVERY CHANGE
git add .
git commit -m "description of changes"
git push

# Live at: https://franzenjb.github.io/hurricane-dashboard-v2/
```

### Running Tests & Validation
```bash
# Test AI Assistant endpoint
./test-ai-assistant.sh

# Test specific AI queries
./test-cat5-query.sh

# Database quality check
node database-qa-tool.js

# Search storm data
node search-nc-storms.js
```

## Architecture Overview

### Multi-Tab Dashboard System
The platform uses an iframe-based architecture with Alpine.js for state management:

```
index.html (Main Container)
├── enhanced-timeline.html (Timeline Tab - iframe)
├── enhanced-multi-state.html (Regional Tab - iframe)  
├── enhanced-database.html (Database Tab - iframe)
├── intelligence-tab.html (Intelligence Tab - iframe)
└── response-tab.html (Response Tab - iframe)
```

### Core Data Flow
```
atlantic-storms-enhanced.js (1,992 storms)
    ↓
Browser loads full dataset
    ↓
Each tab filters/displays differently
    ↓
Cross-frame messaging via postMessage()
```

### Storm Track System
- **Points files**: `hurdat2_data/points_[decade]s.geojson` - Individual storm points with wind/status data
- **Tracks files**: `hurdat2_data/tracks_[decade]s.geojson` - Simple polyline tracks
- **Loading pattern**: Try points first (for rainbow tracks), fallback to tracks

### NOAA Live Updates System (NEW)
- **Worker URL**: `https://noaa-hurricane-proxy.jbf-395.workers.dev`
- **Client**: `noaa-live-updates-v2.js` fetches every 15 minutes
- **Integration**: Parent sends live storms to Timeline via postMessage
- **Display**: Home tab shows active storms, Timeline shows with red star markers

## Critical Development Rules

### 1. Tab-Specific File Editing
- **Timeline changes**: Edit `enhanced-timeline.html` 
- **Regional changes**: Edit `enhanced-multi-state.html`
- **Database changes**: Edit `enhanced-database.html`
- **Intelligence changes**: Edit `intelligence-tab.html`
- **Response changes**: Edit `response-tab.html`
- **Never edit backup implementations in index.html**

### 2. Cross-Frame Communication
All tabs communicate via postMessage:
```javascript
// Send to parent
window.parent.postMessage({
    action: 'viewStorm',
    storm: stormData
}, '*');

// Listen in parent
window.addEventListener('message', (event) => {
    if (event.data.action === 'viewStorm') {
        // Handle storm viewing
    }
});

// Send live storms to Timeline (NEW)
window.sendLiveStormsToTimeline = function() {
    if (window.noaaUpdates) {
        window.noaaUpdates.fetchActiveStorms().then(data => {
            if (data && data.activeStorms && data.activeStorms.length > 0) {
                const timelineFrame = document.querySelector('iframe[src="enhanced-timeline.html"]');
                if (timelineFrame && timelineFrame.contentWindow) {
                    timelineFrame.contentWindow.postMessage({
                        action: 'updateLiveStorms',
                        storms: data.activeStorms
                    }, '*');
                }
            }
        });
    }
};
```

### 3. Function Naming Conventions
**Timeline/Regional tabs**:
- `updateStormInfoPanel()` - Updates sidebar
- `showStormOnMap()` - Displays track
- `getCategoryColor()` - Returns hex color
- `drawRainbowTrack()` - Multi-color track

**Database tab**:
- `viewStorm()` - Opens animation modal
- `trackStorm()` - Starts tracking animation
- `showComparison()` - Storm comparison modal
- `exportSelected()` - CSV export

### 4. Cesium 3D Visualization
- Must disable Ion access token: `Cesium.Ion.defaultAccessToken = undefined`
- Use offline imagery providers (Esri, OSM, CartoDB)
- Camera follows behind storm in movement direction
- Track displayed at low altitude with colored segments

### 5. Animation System
- 2D uses Leaflet with dynamic markers
- 3D uses Cesium with chase cam view
- Frame-by-frame control with play/pause
- Fullscreen mode includes controls

## Data Structure

### Storm Object
```javascript
{
    storm_id: "AL092022",           // HURDAT2 ID
    name: "IAN",                    
    year: 2022,
    month: 9,
    day: 22,
    category: 5,                    // -1=TD, 0=TS, 1-5=Hurricane
    wind_mph: 160,
    landfall_states: ["FL", "SC"],
    deaths: 156,
    damage_millions: 112900,
    rc_impact_score: 95,            // 0-100 Red Cross impact
    rc_impact_level: "CATASTROPHIC", // MINOR|MODERATE|MAJOR|SEVERE|CATASTROPHIC
    narrative: "Description...",
    resources: {
        tcr_pdf: "https://...",     // Tropical Cyclone Report
        nhc_archive: "https://..."
    }
}
```

### GeoJSON Track Point
```javascript
{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [-82.5, 27.5]
    },
    properties: {
        storm_id: "AL092022",
        datetime: "2022-09-28T18:00:00",
        status: "HU",               // TD|TS|HU|EX|SS|SD|LO|DB
        max_wind: 155,
        min_pressure: 937
    }
}
```

### NOAA Live Storm Format (NEW)
```javascript
{
    id: "AL052025",
    name: "ERIN",
    status: "Hurricane",
    category: 1,
    wind_mph: 85,
    pressure_mb: 985,
    position: { lat: 35.5, lon: -65.0 },
    movement: "NE at 18 mph",
    is_live: true
}
```

## Recent Improvements (Aug 2025)

### Storm Intelligence Tab
- Added searchable storm selectors with type-to-search functionality
- Implemented clear/reset buttons (✕) for storm selection
- Made chart labels zoom-responsive (2% offset from data points)
- Removed redundant Impact Metrics Comparison chart
- Fixed JavaScript syntax errors that broke dropdown population
- Purple highlighting for Category 5 storms in Historical Intensity chart

### Database Tab
- Reorganized filters into clear sections with visual separators
- States now display in responsive grid layout
- Enhanced styling with borders, padding, and hover effects
- Color-coded category filters when active
- Removed non-functional Compare Selected and View on Map buttons
- Kept only Export CSV with icon

### Development Workflow
- Emphasized localhost development for rapid iteration
- Added Chrome DevTools cache disable instructions
- Fixed nested git repository issues

## Common Issues & Solutions

### CORS Errors
- **Cause**: Opening HTML files directly (file://)
- **Solution**: Use `./run-local.sh` or access via GitHub Pages

### Browser Cache Issues (NEW)
- **Cause**: Chrome aggressively caches localhost
- **Solution**: Open DevTools → Network → Check "Disable cache"
- **Alternative**: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

### Missing Storm Tracks
- **Cause**: storm_id mismatch between database and GeoJSON files
- **Solution**: Check decade calculation and file naming

### 3D Globe Shows Stars
- **Cause**: Cesium Ion authentication failure
- **Solution**: Ensure Ion token is undefined, use offline providers

### Animation Controls Missing in Fullscreen
- **Cause**: Controls outside fullscreen container
- **Solution**: Duplicate controls inside fullscreenContainer div

### Database Showing Old Storms First
- **Cause**: Default filters include all categories from 1851
- **Solution**: Set default filters to Cat 1-5, 1900-present, sorted newest first

### Live Storms Not Showing in Timeline (NEW)
- **Cause**: Iframe timing and communication issues
- **Solution**: Call `sendLiveStormsToTimeline()` after tab switch with delay

## AI Assistant Integration

### Current Implementation
- Frontend: `ai-assistant-component.js` sends queries to worker
- Worker: Deployed at `https://hurricane-ai-simple.jbf-395.workers.dev/`
- Fallback: Pattern matching if API unavailable

### Worker Deployment
```bash
# Deploy to Cloudflare Workers
1. Update code in worker dashboard
2. Add ANTHROPIC_API_KEY environment variable
3. Test: curl -X POST [worker-url] -d '{"query":"test"}'
```

## Testing Checklist

### Before Committing
1. **Run locally**: `./run-local.sh` and test all tabs
2. **Check console**: No errors in browser console
3. **Test animations**: Both 2D and 3D views work
4. **Verify filters**: Database filters apply correctly
5. **Cross-tab communication**: Clicking storms updates other tabs
6. **Live storms**: Check NOAA updates display on home tab

### Storm Track Testing
1. Click any storm in Timeline/Regional/Database
2. Verify rainbow track appears (console: "Found X track points")
3. Test animation controls (play/pause/frame nav)
4. Toggle 3D view and verify globe shows Earth
5. Check fullscreen mode includes controls

## Performance Considerations

### Large Dataset Handling
- 1,992 storms loaded in browser memory
- GeoJSON files loaded on-demand by decade
- Use pagination in database (default 50 per page)
- Limit map displays to avoid browser freezing

### Optimization Tips
- Filter storms before rendering
- Use requestAnimationFrame for smooth animations
- Dispose of Cesium entities when switching views
- Clear Leaflet layers before adding new ones

## Critical Data Integrity

### HURDAT2 Data Accuracy
- Database must show PEAK INTENSITY values from HURDAT2
- Death counts are manually maintained and must be preserved during updates
- Storm IDs must match exactly between database and GeoJSON files
- Galveston Hurricane (AL011900) = 8,000 deaths, Category 4
- Hurricane Andrew (AL241992) must be present in database

### Known Data Issues
- Some AI-generated narratives contain factual errors
- Landfall state detection can be inaccurate for complex storm paths
- Pre-1900 death counts are often estimates

## NOAA Live Updates

### Current Implementation
- Uses `noaa-live-updates-v2.js` to fetch current Atlantic outlook
- Cloudflare Worker proxy: `https://noaa-hurricane-proxy.jbf-395.workers.dev`
- Updates every 15 minutes automatically
- Parent-iframe communication for Timeline integration

### NOAA Endpoints
- Active storms: `https://www.nhc.noaa.gov/CurrentStorms.json`
- RSS feed: `https://www.nhc.noaa.gov/rss_update.xml`

### Timeline Integration
- Live storms (2025+) appear with red star markers
- Special "LIVE TRACKING" narratives
- Must manually trigger update when switching tabs