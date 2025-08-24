# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: ALWAYS COMMIT AND PUSH CHANGES TO GITHUB 🚨
**AFTER EVERY FILE CHANGE, YOU MUST:**
1. `git add .`
2. `git commit -m "description"`  
3. `git push`

**The user monitors progress through GitHub. Not pushing changes means the user cannot see your work. This is NOT optional.**

## 🔗 CRITICAL: URL FORMATTING RULES 🔗
**FAILURE TO FOLLOW THESE RULES IS UNACCEPTABLE:**
- URLs MUST be on their own line with NO other text
- NEVER break URLs across lines
- NEVER add text after URLs on the same line
- ALWAYS test that URLs are clickable before sending

**CORRECT FORMAT:**
```
Test URL:

https://franzenjb.github.io/hurricane-dashboard-v2/

(deploys in 2-3 minutes)
```

**WRONG FORMAT (NEVER DO THIS):**
```
Test URL: https://franzenjb.github.io/hurricane-dashboard-v2/ (will be live in 2-3 minutes)
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

## Developer Workflow & Git Best Practices

### Essential Git Workflow for This Project

#### Working with Branches (RECOMMENDED for major changes)
```bash
# Create branch for risky changes
git checkout -b fix/3d-animation
# Make changes and test
git add enhanced-database.html
git commit -m "fix: 3D animation controls not responding"
# Test thoroughly before merging
git checkout main
git merge fix/3d-animation
git push
```

#### Quick Fixes (only for minor, safe changes)
```bash
git add .
git commit -m "fix: typo in storm narrative"
git push
```

#### Emergency Rollback
```bash
# If you break something critical
git revert HEAD --no-edit  # Revert last commit
git push                    # Push immediately
# Or revert multiple commits
git revert HEAD~2..HEAD --no-edit
```

### Development Tools & Debugging

#### Advanced Git Commands for This Codebase
```bash
# Find which commit broke something
git bisect start
git bisect bad                    # Current version is broken
git bisect good 2f6f376          # This commit was working
# Git will help you find the breaking commit

# See who last modified a line (useful for understanding code)
git blame enhanced-timeline.html -L 1500,1550

# Search entire codebase
git grep "draw3DStormTrack"      # Find function usage
git grep -n "bold3DColors"       # With line numbers

# View file at specific commit
git show HEAD~3:enhanced-database.html

# Stash work-in-progress
git stash save "WIP: fixing 3D colors"
git stash list
git stash pop
```

#### GitHub CLI Productivity
```bash
# Create PR from command line
gh pr create --title "Fix 3D animation controls" \
  --body "Fixes animation play/pause in 3D mode"

# Check PR status
gh pr status
gh pr checks  # See CI status

# Review PRs locally
gh pr checkout 123
gh pr diff

# Work with issues
gh issue list --label "bug"
gh issue create --title "Database not loading" --label "critical"
```

### Code Quality Standards

#### Pre-Push Checklist
1. **Test all tabs**: Timeline, Regional, Database, Intelligence, Response
2. **Check console**: No errors in browser console (F12)
3. **Verify animations**: Both 2D and 3D modes work
4. **Test storm switching**: Can change storms without closing modal
5. **Check data integrity**: 1,991 Atlantic storms still load
6. **Verify deployment**: Changes appear on GitHub Pages after push

#### Common Pitfalls to Avoid
- **Never commit API keys** or tokens
- **Test 3D changes carefully** - they often break other features
- **Always check cesiumViewer exists** before using it
- **Preserve animation state** when switching 2D/3D
- **Don't modify storm database** without extensive testing
- **Keep GeoJSON files organized** by decade

### Performance & Optimization

#### Git Repository Optimization
```bash
# Check repository size
git count-objects -vH

# Clean up unnecessary files
git clean -xfd  # Remove all untracked files (careful!)
git gc --aggressive --prune=now  # Garbage collection

# Find large files in history
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -10
```

#### Development Environment Setup
```bash
# Set up helpful Git aliases
git config --global alias.lg "log --oneline --graph --decorate"
git config --global alias.st "status -s"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.unstage "reset HEAD --"

# Configure VS Code for this project
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension github.vscode-pull-request-github
```

### Troubleshooting Common Issues

#### When Database Won't Load
1. Check browser console for errors
2. Verify atlantic-storms-enhanced.js is loaded
3. Check CORS settings (must use http server, not file://)
4. Clear browser cache completely

#### When 3D View Breaks
1. Check if cesiumViewer is initialized
2. Verify storm data is loaded before switching to 3D
3. Check animation state management
4. Look for undefined coordinates in storm points

#### When GitHub Pages Doesn't Update
1. Wait full 2-3 minutes for deployment
2. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
3. Check GitHub Actions tab for deployment status
4. Verify you pushed to main branch

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