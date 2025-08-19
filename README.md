# Hurricane Dashboard V2

Interactive Atlantic Hurricane Timeline and Multi-State Tracker with full HURDAT2 database (1851-2024).

## Quick Start

### Option 1: Local Development
```bash
# Run local web server (avoids CORS issues)
./run-local.sh

# Then open: http://localhost:8000
```

### Option 2: Live Deployment
Access the live dashboard at: https://franzenjb.github.io/hurricane-dashboard-v2/

## Features

### Timeline & Map Tab
- Interactive timeline with storm positioning by month/year
- Rainbow-colored storm tracks showing intensity changes
- Compact storm info sidebar (category icon + stats + map + narrative)
- Filters: Categories, Landfall Only, Name Search
- Year slider with drag functionality

### Multi-State Tab  
- Timeline scatter plot for comparing multi-state hurricane activity
- State selection dropdown with regional groupings
- Full storm track visualization for all historical storms (1851-2024)
- Same sidebar interface as Timeline tab

## Technical Details

### Data Sources
- **HURDAT2 Database**: 1991 Atlantic storms (1851-2024)
- **GeoJSON Tracks**: Decade-based files for performance
- **Enhanced Narratives**: AI-generated storm descriptions

### Key Files
- `index.html` - Main V2 Dashboard
- `enhanced-timeline.html` - Timeline & Map tab content
- `enhanced-multi-state.html` - Multi-State tab content  
- `atlantic-storms-enhanced.js` - Storm database
- `hurdat2_data/` - Track data files

### Development Notes
- **CORS Requirement**: Must use web server (not file://) for track data loading
- **Storm Path Loading**: Dynamic HURDAT2 GeoJSON system
- **Responsive Design**: Optimized for iframe embedding

## Troubleshooting

**Storm tracks showing as single points?**
- Ensure you're using http://localhost:8000 or the GitHub Pages URL
- Local file:// URLs are blocked by CORS policy

**Layout issues?**
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors

## Contact
Research: jeff.franzen2@redcross.org