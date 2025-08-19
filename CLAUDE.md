# CLAUDE.md - Hurricane Dashboard V2

This file provides guidance to Claude Code (claude.ai/code) when working with the V2 Dashboard repository.

## ⚠️ CRITICAL: V2 DASHBOARD FILE MAPPING ⚠️

**V2 Dashboard is the DOCUMENT OF RECORD at:** `/Users/jefffranzen/hurricane-dashboard-v2/index.html`

**Embedded Files (Sub-documents of V2):**
- **Timeline & Map Tab**: `enhanced-timeline.html` (Line 189: `<iframe src="enhanced-timeline.html">`)
- **Multi-State Tab**: `enhanced-multi-state.html` (Line 395: `<iframe src="enhanced-multi-state.html">`)
- **Database Tab**: Built-in content (no iframe)

**ALWAYS EDIT THE EMBEDDED FILES, NOT MASTER VERSIONS!**
- ❌ DON'T edit `/Users/jefffranzen/Florida-Historical-Landfall/index.html`
- ✅ DO edit `/Users/jefffranzen/hurricane-dashboard-v2/enhanced-timeline.html`
- ❌ DON'T edit `/Users/jefffranzen/Florida-Historical-Landfall/multi-state-tracker.html`
- ✅ DO edit `/Users/jefffranzen/hurricane-dashboard-v2/enhanced-multi-state.html`

**When user says "dashboard" they mean the V2 dashboard tabs, so always work on the embedded files.**

## V2 Dashboard Structure

```
hurricane-dashboard-v2/
├── index.html                 (Main V2 Dashboard)
├── enhanced-timeline.html     (Timeline Tab Content)
├── enhanced-multi-state.html  (State Tab Content)
├── atlantic-storms-enhanced.js (Shared data file)
└── hurdat2_data/             (Shared data directory)
```

## Deploy Process
1. Edit the embedded files (`enhanced-*.html`)
2. `git add . && git commit -m "description"`
3. `git push`
4. Wait 2-3 minutes for GitHub Pages deployment
5. User tests at: https://franzenjb.github.io/hurricane-dashboard-v2/

## Current Issues to Address
- Storm info banner design needs to be improved with two-line layout
- Same banner needs to be added to Multi-State tab
- Map sizing and narrative space optimization