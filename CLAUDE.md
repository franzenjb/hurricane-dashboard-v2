# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: ALWAYS COMMIT AND PUSH CHANGES TO GITHUB 🚨
**AFTER EVERY FILE CHANGE, YOU MUST:**
1. `git add .`
2. `git commit -m "description"`  
3. `git push`

**The user monitors progress through GitHub. Not pushing changes means the user cannot see your work. This is NOT optional.**

## 🔗 CRITICAL: URL FORMATTING RULES 🔗
**ALWAYS provide URLs in a clickable format:**
- Put URLs on their own line with no other text
- Never break URLs across lines
- Never add explanatory text after URLs on the same line

**CORRECT FORMAT:**
```
Changes are live at:

https://franzenjb.github.io/hurricane-dashboard-v2/

(deploys in 2-3 minutes)
```

## Development Commands

### Local Development
```bash
# Start local server (REQUIRED - avoids CORS issues)
python3 -m http.server 8000
# Opens at: http://localhost:8000

# Alternative with script
./run-local.sh

# IMPORTANT: Chrome cache workaround
# 1. Open DevTools (F12)
# 2. Network tab → Check "Disable cache"
# 3. Keep DevTools open while developing
```

### Testing & Validation
```bash
# Test AI Assistant endpoint
./test-ai-assistant.sh

# Test specific AI queries
./test-cat5-query.sh

# Database quality check
node database-qa-tool.js

# Search storm data
node search-nc-storms.js

# Fetch 2024 TCR reports
./fetch-2024-tcr.sh

# Fix narrative ellipsis issues
node fix-narrative-ellipsis.js

# Fix TCR links case sensitivity
node fix-tcr-links.js
```

## Architecture Overview

### Multi-Tab Dashboard System
The platform uses an iframe-based architecture with Alpine.js for state management:

```
index.html (Main Container with Alpine.js)
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
- **Decade calculation**: `Math.floor(storm.year / 10) * 10`

### NOAA Live Updates
- **Worker URL**: `https://noaa-hurricane-proxy.jbf-395.workers.dev`
- **Client**: `noaa-live-updates-v2.js` fetches every 15 minutes
- **Integration**: Parent sends live storms to Timeline via postMessage
- **Display**: Home tab shows active storms, Timeline shows with red star markers

### AI Assistant System
- **Backend**: `ai-backend.js` - Express server with Claude API integration
- **Worker**: `ai-powered-worker.js` - Cloudflare Worker for API proxy
- **Component**: `ai-assistant-component.js` - UI component for chat interface
- **Fallback**: Hardcoded responses if API unavailable

## Critical Development Rules

### 1. Tab-Specific File Editing
- **Timeline**: Edit `enhanced-timeline.html` 
- **Regional**: Edit `enhanced-multi-state.html`
- **Database**: Edit `enhanced-database.html`
- **Intelligence**: Edit `intelligence-tab.html`
- **Response**: Edit `response-tab.html`
- **Never edit backup files or inline implementations in index.html**

### 2. Cross-Frame Communication
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
```

### 3. Key Functions by Tab

**Timeline/Regional tabs**:
- `updateStormInfoPanel()` - Updates sidebar with storm details
- `showStormOnMap()` - Displays track with animation capabilities
- `drawRainbowTrack()` - Multi-color track based on intensity
- `getCategoryColor()` - Returns consistent hex colors

**Database tab**:
- `showStormModal()` - Opens in-tab modal with storm details
- `initStormMap()` - Initializes Leaflet map in modal
- `loadStormTrackForModal()` - Loads GeoJSON track data
- `drawStormTrackOnModal()` - Renders animated rainbow track
- Animation controls: Play/pause/frame controls for 2D and 3D views
- 3D mode: Uses Cesium (must disable Ion token)

**Intelligence tab**:
- `selectStorm()` - Updates comparison charts
- `updateScatterChart()` - Wind-pressure relationship
- `updateTimeSeriesChart()` - Historical intensity trends
- Uses Plotly annotations with shapes for label backgrounds

**Response tab**:
- Filters to Category 3+ storms with US landfall only
- `loadStormTrack()` - Shows storm path when operation selected
- Resources chart legend positioned below with full names

### 4. Storm Visualization Standards

**Color Scheme** (consistent across all tabs):
```javascript
const colors = {
    5: '#8B008B',  // Purple for Cat 5
    4: '#DC143C',  // Red for Cat 4  
    3: '#FF8C00',  // Orange for Cat 3
    2: '#FFD700',  // Gold for Cat 2
    1: '#90EE90',  // Light green for Cat 1
    0: '#87CEEB',  // Sky blue for TS
    '-1': '#D3D3D3' // Light gray for TD
};
```

**Animation System**:
- 2D: Leaflet with segment-by-segment rainbow tracks
- 3D: Cesium with proper camera positioning and colored segments
- Controls: Play/pause, frame navigation, speed adjustment
- State management: `animationState` object tracks current frame, segments, and view mode

## Data Structures

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
    pressure: 937,                  // Min pressure in mb
    landfall_states: ["FL", "SC"],  // US state codes
    deaths: 156,
    damage_millions: 112900,
    rc_impact_score: 95,            // 0-100 Red Cross impact
    rc_impact_level: "CATASTROPHIC",
    narrative: "Description...",    // May end with "..." (needs fixing)
    resources: {
        tcr_pdf: "https://...",     // TCR link (1995+ only, case-sensitive)
        nhc_archive: "https://..."
    },
    rc_response: {
        responded: true,
        operation_type: "Level 3"   // Level 1-3
    }
}
```

### GeoJSON Track Point
```javascript
{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [-82.5, 27.5]  // [lon, lat]
    },
    properties: {
        storm_id: "AL092022",
        datetime: "2022-09-28T18:00:00",
        status: "HU",               // TD|TS|HU|EX|SS|SD|LO|DB
        max_wind: 155,              // knots (multiply by 1.15 for mph)
        min_pressure: 937           // mb
    }
}
```

## Common Issues & Solutions

### Browser Cache
- **Solution**: DevTools → Network → Disable cache
- **Alternative**: Hard refresh (Cmd+Shift+R / Ctrl+F5)

### Missing Storm Tracks
- **Check**: storm_id matches between database and GeoJSON
- **Verify**: Decade calculation is correct
- **Debug**: Check console for 404 errors on GeoJSON files

### 3D View Issues
- **Animation controls**: Ensure z-index is 99999 for visibility
- **Path not showing**: Check `animationState.stormPoints` is populated
- **Camera position**: Use `cesiumViewer.zoomTo()` for proper framing
- **Cesium initialization**: Disable Ion token with `Cesium.Ion.defaultAccessToken = undefined`

### Database Modal Animation
- **Controls disappearing**: Check z-index and position absolute
- **Animation speed**: Adjust with `animationSpeed` calculation
- **Frame tracking**: Use `animationState.currentFrame` for position

### TCR Links
- **Format**: Case-sensitive (e.g., "Ian.pdf" not "IAN.pdf")
- **Availability**: Only for 1995+ storms
- **URL Pattern**: `https://www.nhc.noaa.gov/data/tcr/AL[##][YYYY]_[Name].pdf`

## Testing Checklist

### Before Committing
1. **Run locally**: Test all tabs with `./run-local.sh`
2. **Console check**: No errors (F12)
3. **Database modal**: View button opens with animated track
4. **Animation controls**: Play/pause/forward/back work in 2D and 3D
5. **3D view**: Storm path displays with correct colors
6. **Storm labels**: Readable with white backgrounds in Intelligence tab
7. **Response tab**: Only shows Cat 3+ with US landfall
8. **TCR downloads**: Work for 1995+ storms

### After Pushing
- GitHub Pages deploys in 2-3 minutes
- Live at: https://franzenjb.github.io/hurricane-dashboard-v2/
- Clear browser cache if changes don't appear

## Critical Data Integrity

### HURDAT2 Standards
- Peak intensity values must be preserved
- Death counts are manually maintained
- Storm IDs must match exactly: `AL[##][YYYY]`
- Galveston (1900): 8,000 deaths, Category 4
- Andrew (1992): Must be present in database

### Known Data Limitations
- Pre-1900 death counts are estimates
- Some narratives contain AI-generated errors
- Landfall detection may miss complex paths
- Damage data incomplete for many storms
- Wind speeds in GeoJSON are in knots (multiply by 1.15 for mph)