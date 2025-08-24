# 🌀 Hurricane Intelligence Platform V2

**Advanced Hurricane Data Assistant & Analytics Tool**  
Interactive Atlantic Hurricane Timeline, Multi-State Tracker, and AI-Powered Intelligence System with complete HURDAT2 database (1851-2024).

## 🎯 Mission
Transform 173 years of hurricane data into actionable intelligence for disaster response, research, and public safety.

## ⚡ Quick Start

### Option 1: Local Development
```bash
# Run local web server (avoids CORS issues)
./run-local.sh

# Then open: http://localhost:8000
```

### Option 2: Live Deployment
Access the live dashboard at:
https://franzenjb.github.io/hurricane-dashboard-v2/

### Development Workflow (Recommended)
```bash
# Start local server for rapid development
python3 -m http.server 8000

# Open Chrome DevTools → Network tab → Check "Disable cache"
# This ensures instant updates when you save files

# When ready to deploy:
git add .
git commit -m "description"
git push
```

## 🌟 Core Features

### 📊 Database Tab (Hurricane Intelligence)
- **1,991 Atlantic storms** from HURDAT2 (1851-2024)
- **Advanced filtering**: Category, landfall states, year range, name search
- **Sortable columns** with storm ID for official ordering
- **Export capabilities**: Full CSV with 27 data fields
- **Interactive features**: Compare storms, view on map, detailed narratives
- **TCR Integration**: Links to NOAA Tropical Cyclone Reports (when available)

### 📈 Timeline & Map Tab
- **Interactive timeline** with storm positioning by month/year
- **Rainbow-colored storm tracks** showing intensity changes over path
- **Smart storm info sidebar**: Category icon + stats + map + narrative
- **Advanced filters**: Categories, Landfall Only, Name Search
- **Year slider** with drag functionality for temporal exploration
- **Storm surge visualization** with NOAA-standard color coding

### 🗺️ Regional Analysis Tab (Multi-State)
- **Timeline scatter plot** for comparing multi-state hurricane activity
- **State selection dropdown** with regional groupings (17 US coastal states)
- **Full storm track visualization** for all historical storms (1851-2024)
- **Unified interface** with Timeline tab for consistency
- **Plotly-powered** interactive visualizations

### 🤖 AI Hurricane Assistant
- **Powered by Claude API** for intelligent responses
- **Context-aware answers** about specific storms and patterns
- **Smart filter suggestions** based on natural language queries
- **Historical comparisons** and impact analysis
- **2024 season expertise** including Helene and Milton impacts
- **Fallback mode** with hardcoded responses if API unavailable

### 📊 Storm Intelligence Tab (NEW)
- **Comparative Analysis**: Compare up to 3 storms side-by-side
- **Interactive Spider Chart**: Multi-metric storm comparison visualization
- **Wind-Pressure Relationship**: Scatter plot showing storm intensification patterns
- **Historical Intensity Distribution**: Timeline view with Category 5 highlights
- **Searchable Storm Selectors**: Type-to-search with clear/reset buttons
- **Zoom-Responsive Labels**: Labels stay properly positioned at any zoom level

## 🏗️ Technical Architecture

### Data Sources
- **HURDAT2 Database**: 1,991 Atlantic storms (1851-2024)
- **GeoJSON Tracks**: Decade-based files for performance optimization
- **Enhanced Narratives**: AI-generated storm impact descriptions
- **NOAA TCR Integration**: Tropical Cyclone Reports for detailed analysis
- **Real-time potential**: RSS feeds for current season tracking

### Core Components
| Component | File | Purpose |
|-----------|------|---------|
| Main Dashboard | `index.html` | Container with Alpine.js tab system |
| Timeline Tab | `enhanced-timeline.html` | Interactive temporal exploration |
| Regional Tab | `enhanced-multi-state.html` | Multi-state impact analysis |
| Database Tab | Built into `index.html` | Full dataset with advanced filtering |
| Storm Database | `atlantic-storms-enhanced.js` | Complete HURDAT2 dataset |
| Track Data | `hurdat2_data/` | GeoJSON storm paths by decade |
| AI Worker | `ai-powered-worker.js` | Claude-powered assistant |
| Surge Layer | `storm-surge-layer.js` | Storm surge visualization |

### System Requirements
- **CORS Compliance**: Web server required (not file://)
- **Modern Browser**: Chrome, Firefox, Safari (2020+)
- **JavaScript**: ES6+ support required
- **Network**: Internet connection for map tiles and AI features

## 📋 Development Best Practices

### Git Workflow & Commit Standards

#### Essential Git Commands
```bash
# Check current status
git status                    # See what's staged/unstaged
git diff                      # Review changes before committing
git log origin/main..HEAD     # See commits that will be pushed

# Stage and commit with semantic messages
git add .                     # Stage all changes (or specify files)
git commit -m "feat: add 3D storm visualization"  # Use semantic commits

# Push to remote repository
git push origin main

# Work with branches for complex features
git checkout -b feature-name  # Create feature branch
git merge main                # Keep branch updated
git push -u origin feature-name  # Push branch
```

#### Semantic Commit Messages
Use conventional commits for clear history:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style/formatting
- `refactor:` Code restructuring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

#### Branch Strategy
- **Main branch**: Always deployable
- **Feature branches**: For new features (`feature/storm-3d-view`)
- **Fix branches**: For bug fixes (`fix/animation-controls`)
- **Test before merging**: Ensure all tests pass

### Code Quality & Testing

#### Pre-commit Checklist
- [ ] Run local server and test all tabs
- [ ] Check browser console for errors (F12)
- [ ] Test on multiple browsers if possible
- [ ] Verify mobile responsiveness
- [ ] Ensure no sensitive data in commits

#### Debugging Tools
```bash
# Test locally before pushing
python3 -m http.server 8000  # Local server
./test-ai-assistant.sh        # Test AI endpoint
node database-qa-tool.js      # Database quality check

# Use Git tools for debugging
git bisect start              # Find breaking commit
git blame enhanced-timeline.html  # Track code changes
git log --oneline --graph     # Visualize branch history
```

### GitHub Features & Integrations

#### Repository Management
- **Issues**: Track bugs and features with labels
- **Pull Requests**: Code review before merging
- **GitHub Actions**: Automated deployment to GitHub Pages
- **Branch Protection**: Prevent direct pushes to main
- **GitHub CLI**: `gh pr create`, `gh issue list`

#### Useful GitHub Commands
```bash
# GitHub CLI examples
gh pr create --title "Add 3D visualization"
gh pr list --state open
gh issue create --title "Animation bug in 3D mode"
gh repo view --web  # Open repo in browser
```

### Performance Optimization

#### Repository Health
- **Use .gitignore**: Keep repo clean (node_modules, .DS_Store)
- **Optimize images**: Compress before committing
- **Monitor size**: Keep GeoJSON files organized by decade
- **Cache strategy**: Use browser cache for static assets

#### Best Practices Summary
1. **Commit often**: Small, focused commits
2. **Write clear messages**: Future you will thank you
3. **Test locally first**: Always verify before pushing
4. **Use branches**: Isolate complex changes
5. **Document changes**: Update README/CLAUDE.md as needed
6. **Review before merge**: Use PR reviews for major changes
7. **Keep main stable**: Only merge tested code
8. **Tag releases**: Use semantic versioning (v1.2.3)
9. **Monitor GitHub Actions**: Ensure deployments succeed
10. **Clean up branches**: Delete merged feature branches

## 🚀 AI Assistant Deployment

### Current Status: ⚠️ Basic Pattern Matching
The AI Assistant currently uses simple pattern matching and returns generic responses. To enable true AI intelligence:

### Option 1: Deploy Claude-Powered Worker (Recommended)
**Time Required: 10 minutes**

1. **Get Anthropic API Key** (5 min)
   - Visit:
   
   https://console.anthropic.com/
   
   - Create account and generate API key
   - Copy key (starts with `sk-ant-`)

2. **Update Cloudflare Worker** (3 min)
   - Go to:
   
   https://workers.cloudflare.com/
   
   - Open your `hurricane-ai-simple` worker
   - Replace code with `ai-powered-worker.js`
   - Save and Deploy

3. **Add API Key** (2 min)
   - Settings → Variables
   - Add `ANTHROPIC_API_KEY` environment variable
   - Save and Deploy

4. **Test Enhanced AI**
   ```bash
   curl -X POST "https://hurricane-ai-simple.jbf-395.workers.dev/" \
     -H "Content-Type: application/json" \
     -d '{"query": "When do hurricanes hit west Florida?"}'
   ```

### Option 2: Use Free Cloudflare AI
No API key needed - uses Cloudflare's built-in models. See `WORKER_DEPLOYMENT_GUIDE.md` for details.

### Expected Improvements After Deployment
| Feature | Before (Current) | After (AI-Powered) |
|---------|-----------------|-------------------|
| Storm Info | "Looking at Hurricane Ida" | Detailed analysis of actual storms |
| Temporal Analysis | Generic response | "West Florida peaks Sept-Oct, vulnerable to Gulf storms" |
| 2024 Knowledge | None | Full details on Helene, Milton impacts |
| Filter Suggestions | Basic pattern match | Smart, context-aware recommendations |
| Historical Context | None | Comparisons to Andrew, Charley, Irma |

## 🎯 Implementation Roadmap

### Phase 1: Core Fixes ✅
- [x] Unified database across all tabs
- [x] Fixed Database tab buttons
- [x] Added sortable columns
- [x] Landfall state filtering
- [x] Fixed map plotting bugs

### Phase 2: AI Enhancement 🔄
- [ ] Deploy Claude-powered worker
- [ ] Add TCR integration
- [ ] Storm comparison tool
- [ ] Impact predictor

### Phase 3: Advanced Features 📋
- [ ] Real-time NOAA feeds
- [ ] 3D storm surge visualization
- [ ] Evacuation zone mapper
- [ ] Red Cross response data

See `IMPLEMENTATION_ROADMAP.md` for complete details.

## Troubleshooting

**Storm tracks showing as single points?**
- Ensure you're using http://localhost:8000 or the GitHub Pages URL
- Local file:// URLs are blocked by CORS policy

**Layout issues?**
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors

## 💬 Sample AI Assistant Queries (After Deployment)

### Questions It Can Answer:
- **Temporal Patterns**: "When do hurricanes typically hit west Florida?"
- **Historical Analysis**: "What were the worst hurricanes to hit Tampa Bay?"
- **2024 Season**: "Tell me about Hurricane Milton's impact"
- **Comparisons**: "How does 2024 compare to 2004 for Florida?"
- **Geographic Vulnerability**: "Why is Tampa Bay vulnerable to storm surge?"
- **Category Analysis**: "Show me all Category 5 hurricanes since 2000"
- **State-Specific**: "Which hurricanes hit both Florida and Louisiana?"
- **Impact Assessment**: "What was the deadliest hurricane in US history?"

### Current Limitations (Before Deployment):
- Returns generic responses like "Looking at Hurricane Ida"
- No real hurricane knowledge or analysis
- Cannot answer specific questions about timing, impacts, or patterns
- Filters don't match the actual query intent

## 📚 Documentation

- **`README.md`** - This file, main documentation
- **`IMPLEMENTATION_ROADMAP.md`** - Detailed feature roadmap and enhancements
- **`WORKER_DEPLOYMENT_GUIDE.md`** - Step-by-step AI deployment
- **`AI_ASSISTANT_SETUP.md`** - Technical AI integration details
- **`CLAUDE.md`** - Claude Code development guidelines
- **`DATABASE_UPDATE_GUIDE.md`** - How to update storm data

## 👥 Contact
Research & Development: jeff.franzen2@redcross.org

## 🙏 Acknowledgments
- **NOAA/NHC** for HURDAT2 database and TCR reports
- **American Red Cross** for disaster response insights
- **Anthropic** for Claude AI capabilities
- **Cloudflare** for worker infrastructure