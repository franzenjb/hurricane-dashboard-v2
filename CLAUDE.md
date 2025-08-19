# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: ALWAYS COMMIT AND PUSH CHANGES TO GITHUB 🚨
**AFTER EVERY FILE CHANGE, YOU MUST:**
1. `git add .`
2. `git commit -m "description"`  
3. `git push`

**The user monitors progress through GitHub. Not pushing changes means the user cannot see your work. This is NOT optional.**

## Git Best Practices - IMPORTANT

### Understanding Git Push Behavior
When you interrupt a Git push that's in progress:
- **If interrupted before completion**: The changes aren't on the remote repository yet
- **Your local commits are safe**: Git handles interrupted operations gracefully
- **Only committed changes get pushed**: Uncommitted changes stay local until committed

### Safe Git Workflow - ALWAYS FOLLOW THIS
```bash
# 1. Check what's staged/unstaged
git status

# 2. Check what commits will be pushed
git log origin/main..HEAD

# 3. Stage and commit your changes
git add .
git commit -m "Descriptive message of changes"

# 4. Push to remote
git push

# If push is interrupted, simply run git push again
```

### Key Points
- **Commits are local first**: Changes must be committed locally before they can be pushed
- **Interrupted pushes are safe**: Your local repository retains all commits
- **Always commit before pushing**: Uncommitted changes won't be included in push
- **Check status first**: Use `git status` to understand what will be included

## Architecture Overview

This is a **multi-tab hurricane analytics dashboard** with three distinct implementations:

### 🏗️ **Core Structure**
- **`index.html`**: Main dashboard container with Alpine.js tabs
- **Tab 1 - Timeline**: `enhanced-timeline.html` (iframe-embedded)  
- **Tab 2 - Multi-State**: `enhanced-multi-state.html` (iframe-embedded)
- **Tab 3 - Database**: Built into `index.html` (native Alpine.js)

### 📊 **Data Architecture**
- **Primary Dataset**: `atlantic-storms-enhanced.js` (1,991 storms from HURDAT2 1851-2024)
- **Track Visualization**: `hurdat2_data/points_[decade]s.geojson` files for rainbow track rendering
- **Fallback Tracks**: `hurdat2_data/tracks_[decade]s.geojson` for simple line tracks

## Development Commands

### Local Development
```bash
# Start local server (required - CORS restrictions prevent file:// usage)
./run-local.sh
# Access at: http://localhost:8000
```

### Deployment - CRITICAL REQUIREMENT
**⚠️ IMPORTANT: YOU MUST COMMIT AND PUSH ALL CHANGES TO GITHUB IMMEDIATELY AFTER MAKING THEM**

```bash
# REQUIRED AFTER EVERY CHANGE - DO NOT SKIP THIS STEP
git add .
git commit -m "description of changes"
git push

# Live at: https://franzenjb.github.io/hurricane-dashboard-v2/
```

**REMINDER TO CLAUDE: The user monitors progress via GitHub commits. You MUST push changes immediately after making them. Do not wait to be asked. This is not optional.**

## Critical Development Rules

### ⚠️ **File Editing Priority**
**ALWAYS edit the embedded iframe files, not backup versions in `index.html`:**
- ✅ Edit `enhanced-timeline.html` for Timeline tab changes
- ✅ Edit `enhanced-multi-state.html` for Multi-State tab changes  
- ✅ Edit `index.html` directly only for Database tab changes
- ❌ Never edit the backup/original implementations in `index.html`

### 🎯 **Tab-Specific Implementations**
1. **Timeline Tab** (`enhanced-timeline.html`):
   - Uses `updateStormInfoPanel()` + `showStormOnMap()` functions
   - Has vertical year slider component
   - Category-based filtering with checkboxes

2. **Multi-State Tab** (`enhanced-multi-state.html`):
   - Uses same `updateStormInfoPanel()` + `showStormOnMap()` functions as Timeline
   - Multi-state selector dropdown
   - Plotly timeline scatter plot

3. **Database Tab** (in `index.html`):
   - Uses `StormSidebar` component from `storm-sidebar-component.js`
   - Clickable table rows trigger `viewStormOnMapDatabase()`
   - Search functionality with Alpine.js

## Storm Data Integration

### 🌪️ **Track Visualization System**
- **Rainbow Tracks**: Load `points_[decade]s.geojson` → `drawRainbowTrack()` with category-based coloring
- **Simple Tracks**: Load `tracks_[decade]s.geojson` → `drawSimpleTrack()` with single color
- **Track Loading**: `loadStormTrack(storm)` tries points first, falls back to tracks

### 📍 **Storm Object Structure**
```javascript
{
  storm_id: "AL092022",      // Primary key for track data
  name: "IAN",
  year: 2022, month: 9, day: 22,
  category: 5, wind_mph: 140,
  landfall_states: ["FL", "NC", "SC"],
  narrative: "Full storm description..."
}
```

## Consistency Requirements

### 🎨 **Visual Consistency**
- Timeline and Multi-State tabs must look identical (same sidebar, styling, functions)
- Both use timeline-style `updateStormInfoPanel()` not `StormSidebar` component
- Database tab uses different `StormSidebar` component with two-column layout

### 🔧 **Function Naming Patterns**
- **Timeline/Multi-State**: `updateStormInfoPanel()`, `showStormOnMap()`, `getCategoryColor()`, `getMonthName()`
- **Database**: `StormSidebar.updateStorm()`, `viewStormOnMapDatabase()`

## Future Improvements

### Unified Side Panel Component (Priority)
Currently, the storm info side panels in Timeline and Regional tabs use duplicated HTML/CSS code. This should be refactored into a single shared JavaScript component that:
- Provides one source of truth for the panel layout and styling
- Automatically propagates changes to all tabs that use it
- Reduces code duplication and maintenance overhead
- Ensures true consistency across the dashboard

**Proposed Implementation:**
- Create a `StormPanelComponent.js` that can be imported by all tabs
- Use consistent data binding from the master `ATLANTIC_STORMS_ENHANCED` database
- Single update point for any panel modifications

## Testing Requirements

### 🧪 **Manual Testing Process**
1. Run `./run-local.sh` and verify http://localhost:8000 loads
2. Test storm clicks in each tab - should populate sidebar with:
   - Correct category icon and color
   - Storm stats (date, wind, landfall states)
   - Narrative text
   - Rainbow track visualization on map
3. Console should show "Found X track points - RAINBOW TRACK" for successful track loads

### 🚨 **Common Issues**
- **Gray tracks with "barbells"**: Usually means StormSidebar component vs timeline functions mismatch
- **CORS errors**: Must use web server, not file:// URLs
- **Missing tracks**: Check storm_id matching between `ATLANTIC_STORMS_ENHANCED` and GeoJSON files

## Data Sources Reference

- **HURDAT2**: Official NHC Atlantic hurricane database (1851-2024)
- **Enhanced Narratives**: AI-generated storm impact descriptions
- **Landfall Detection**: Multi-state landfall analysis for regional tracking
- **Research Contact**: jeff.franzen2@redcross.org