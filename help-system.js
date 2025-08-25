// Help System for Hurricane Dashboard
// Provides context-sensitive help for each tab with animated tutorials

const helpContent = {
    home: {
        title: "Home Tab Help",
        sections: [
            {
                title: "🏠 Dashboard Overview",
                content: "Your starting point for hurricane intelligence:",
                bullets: [
                    "1,991 Atlantic storms since 1851",
                    "Quick stats showing total storms, Cat 5 count, and major hurricanes",
                    "Live updates during hurricane season",
                    "Navigation cards to access all dashboard features"
                ],
                tip: "💡 TIP: Click on any card to jump directly to that section"
            },
            {
                title: "📊 Quick Stats",
                content: "Key metrics displayed at the top:",
                bullets: [
                    "Total storms in database",
                    "Category 5 hurricane count",
                    "Major hurricanes (Category 3+)",
                    "Recent significant storms with details"
                ],
                tip: "💡 TIP: Stats update automatically during hurricane season"
            },
            {
                title: "🔄 Live Updates",
                content: "Real-time hurricane tracking:",
                bullets: [
                    "Current Atlantic basin activity",
                    "Active storm positions and intensities",
                    "Automatic refresh every 15 minutes",
                    "NOAA data integration"
                ],
                tip: "💡 TIP: Active storms appear with red markers during hurricane season"
            }
        ]
    },
    timeline: {
        title: "Timeline Tab Help",
        sections: [
            {
                title: "📅 Timeline Navigation",
                content: "Explore hurricanes through time:",
                bullets: [
                    "Drag the year slider to jump to any period (1851-2024)",
                    "Click on any storm bubble to see full details",
                    "Hover over bubbles for quick storm information",
                    "Use mouse wheel to zoom the timeline"
                ],
                tip: "💡 TIP: Bubble size indicates storm strength - larger = stronger"
            },
            {
                title: "🗺️ Interactive Map",
                content: "Storm tracks visualization:",
                bullets: [
                    "Rainbow colors show intensity changes along path",
                    "Click any track for complete storm details",
                    "Zoom with mouse wheel or +/- buttons",
                    "Pan by clicking and dragging the map"
                ],
                tip: "💡 TIP: Red/purple tracks indicate major hurricanes (Cat 3+)"
            },
            {
                title: "🎯 Filter Panel",
                content: "Focus on specific storms:",
                bullets: [
                    "Category checkboxes (TD through Cat 5)",
                    "Landfall Only toggle for US impacts",
                    "Name search box for specific storms",
                    "Year range selector"
                ],
                tip: "💡 TIP: Turn on 'Landfall Only' to see only storms that hit the US"
            },
            {
                title: "🎬 Animation Controls",
                content: "Play storm animations:",
                bullets: [
                    "Play/Pause button for automatic playback",
                    "Next/Previous buttons for frame control",
                    "Speed adjustment slider",
                    "3D View toggle for perspective mode"
                ],
                tip: "💡 TIP: Click '3D View' for an impressive perspective visualization"
            }
        ]
    },
    regional: {
        title: "Regional Tab Help",
        sections: [
            {
                title: "🌊 State Selection",
                content: "Compare hurricane impacts across states:",
                bullets: [
                    "Select up to 3 states from the dropdown menu",
                    "View comparative timeline scatter plot",
                    "See all historical tracks on the map",
                    "Tracks are color-coded by selected state"
                ],
                tip: "💡 TIP: Select FL, TX, and LA to compare the most impacted states"
            },
            {
                title: "📈 Timeline Analysis",
                content: "Understanding the scatter plot:",
                bullets: [
                    "Each dot represents one hurricane landfall",
                    "Y-axis shows storm intensity (category)",
                    "X-axis shows year of occurrence",
                    "Hover over dots for storm details"
                ],
                tip: "💡 TIP: Look for clustering patterns to identify active periods"
            },
            {
                title: "📊 Statistical Summary",
                content: "State comparison metrics:",
                bullets: [
                    "Total landfalls per state",
                    "Major hurricane counts",
                    "Average intensity by state",
                    "Temporal distribution patterns"
                ],
                tip: "💡 TIP: Use the year range slider to focus on specific decades"
            }
        ]
    },
    database: {
        title: "Database Tab Help",
        sections: [
            {
                title: "🔍 Using Filters",
                content: "Click the purple Filters button to reveal filtering options:",
                bullets: [
                    "Hurricane Category (TD through Cat 5)",
                    "Year Range (1851-2024)",
                    "Landfall States (US coastal states)",
                    "Storm Name search box"
                ],
                tip: "💡 TIP: Use multiple filters together for precise results"
            },
            {
                title: "📊 Viewing Storm Details",
                content: "Click the 'View' button on any storm row to see:",
                bullets: [
                    "Animated storm track on interactive map",
                    "Full storm narrative and impacts",
                    "Play/pause animation controls",
                    "3D view option with Mapbox"
                ],
                tip: "💡 TIP: Click '3D View' for perspective visualization"
            },
            {
                title: "📥 Exporting Data",
                content: "Use the Export button in the header to download:",
                bullets: [
                    "CSV file with all filtered storms",
                    "26 comprehensive data fields per storm",
                    "Includes dates, wind/pressure, ACE, coordinates, impacts",
                    "Full narratives and Red Cross response data"
                ],
                tip: "💡 TIP: Apply filters first to export specific data subsets"
            },
            {
                title: "🔢 Table Features",
                content: "Working with the data table:",
                bullets: [
                    "Click column headers to sort",
                    "Click again to reverse sort order",
                    "TCR links for storms after 1995",
                    "Pagination controls at bottom"
                ],
                tip: "💡 TIP: Sort by Wind Speed to find the strongest storms"
            }
        ]
    },
    intelligence: {
        title: "Intelligence Tab Help",
        sections: [
            {
                title: "🔬 Storm Comparison",
                content: "Compare up to 3 storms side-by-side:",
                bullets: [
                    "Type storm names in the search boxes",
                    "Auto-complete suggests matching storms",
                    "Clear button (✕) to remove selection",
                    "Comparison updates automatically"
                ],
                tip: "💡 TIP: Try comparing Katrina, Andrew, and Michael"
            },
            {
                title: "🕸️ Spider Chart",
                content: "Multi-metric comparison visualization:",
                bullets: [
                    "Wind Speed (mph)",
                    "Minimum Pressure (mb)",
                    "Storm Duration (days)",
                    "Affected States (count)",
                    "Deaths (if available)"
                ],
                tip: "💡 TIP: Larger area indicates more intense storm"
            },
            {
                title: "📊 Scatter Plot",
                content: "Wind-Pressure relationship:",
                bullets: [
                    "X-axis: Maximum wind speed",
                    "Y-axis: Minimum pressure",
                    "Lower pressure = stronger storm",
                    "Hover for storm details"
                ],
                tip: "💡 TIP: Most intense storms cluster in bottom-right"
            },
            {
                title: "📈 Historical Timeline",
                content: "Intensity trends over time:",
                bullets: [
                    "All Category 5 storms highlighted in purple",
                    "Selected storms shown with markers",
                    "Zoom and pan capabilities",
                    "Export chart as image"
                ],
                tip: "💡 TIP: Look for patterns in Cat 5 frequency"
            }
        ]
    },
    response: {
        title: "Response Tab Help",
        sections: [
            {
                title: "🚨 Red Cross Operations",
                content: "Disaster response data overview:",
                bullets: [
                    "Only shows Category 3+ storms with US landfall",
                    "Response levels: 1 (local) to 5 (national)",
                    "Click operations to see storm tracks",
                    "Sorted by impact severity"
                ],
                tip: "💡 TIP: Level 5 responses indicate catastrophic events"
            },
            {
                title: "📊 Resource Deployment",
                content: "Response metrics visualization:",
                bullets: [
                    "Shelters opened per operation",
                    "Meals served to affected populations",
                    "Relief items distributed",
                    "Volunteers deployed"
                ],
                tip: "💡 TIP: Hover over charts for detailed numbers"
            },
            {
                title: "📅 Operations Timeline",
                content: "Historical response patterns:",
                bullets: [
                    "Chronological list of major operations",
                    "Response duration indicators",
                    "Geographic coverage maps",
                    "Impact statistics per event"
                ],
                tip: "💡 TIP: Recent operations show more detailed data"
            },
            {
                title: "⚠️ Data Note",
                content: "About the response data:",
                bullets: [
                    "Historical data may be estimated",
                    "Pre-2000 operations have limited details",
                    "Metrics standardized for comparison",
                    "Yellow banner indicates fictional elements"
                ],
                tip: "💡 TIP: Focus on relative comparisons rather than absolute numbers"
            }
        ]
    },
    about: {
        title: "About Tab Help",
        sections: [
            {
                title: "📚 Data Sources",
                content: "Understanding our data:",
                bullets: [
                    "HURDAT2 - NOAA's official hurricane database",
                    "National Hurricane Center archives",
                    "Historical weather station records",
                    "Ship logs and maritime reports"
                ],
                tip: "💡 TIP: All data is cross-verified from multiple sources"
            },
            {
                title: "✅ Data Verification",
                content: "Quality assurance process:",
                bullets: [
                    "Multi-source verification for each storm",
                    "Era-specific reliability classifications",
                    "Satellite era (1980+) most accurate",
                    "Pre-1900 data includes historical estimates"
                ],
                tip: "💡 TIP: Recent storms have the most reliable data"
            },
            {
                title: "💻 Technical Information",
                content: "Platform details:",
                bullets: [
                    "Built with Mapbox GL, Leaflet, Alpine.js",
                    "Client-side data processing",
                    "GitHub Pages hosting",
                    "Open source repository"
                ],
                tip: "💡 TIP: Report issues on GitHub"
            },
            {
                title: "📞 Contact",
                content: "Get in touch:",
                bullets: [
                    "Developer: Jeff Franzen",
                    "Organization: American Red Cross",
                    "Email: jeff.franzen2@redcross.org",
                    "GitHub: franzenjb/hurricane-dashboard-v2"
                ],
                tip: "💡 TIP: Email for support or feature requests"
            }
        ]
    }
};

// Create help modal
function showHelp(tabName) {
    const content = helpContent[tabName] || helpContent.home;
    
    const modalHTML = `
        <div id="helpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4" onclick="if(event.target.id==='helpModal')closeHelp()">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideIn">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold flex items-center gap-2">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            ${content.title}
                        </h2>
                        <button onclick="closeHelp()" class="text-white hover:text-gray-200 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    ${content.sections.map(section => `
                        <div class="mb-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-3">${section.title}</h3>
                            <p class="text-gray-600 mb-2">${section.content}</p>
                            ${section.bullets ? `
                                <ul class="list-disc list-inside space-y-1 ml-4 text-gray-600">
                                    ${section.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${section.tip ? `
                                <div class="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
                                    ${section.tip}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="bg-gray-100 px-6 py-4 flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        Need more help? Email: jeff.franzen2@redcross.org
                    </div>
                    <button onclick="closeHelp()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing modal
    const existingModal = document.getElementById('helpModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.add('animate-fadeOut');
        setTimeout(() => modal.remove(), 300);
    }
}

// Add CSS animations
if (!document.getElementById('helpStyles')) {
    const styles = `
        <style id="helpStyles">
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            .animate-slideIn {
                animation: slideIn 0.3s ease-out;
            }
            
            .animate-fadeOut {
                animation: fadeOut 0.3s ease-out;
            }
            
            .help-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                transition: all 0.3s;
                z-index: 9999;
            }
            
            .help-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            .help-button svg {
                width: 28px;
                height: 28px;
            }
            
            .help-pulse {
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Export for use in other files
window.showHelp = showHelp;
window.closeHelp = closeHelp;