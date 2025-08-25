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
                    "Quick stats and recent storms",
                    "Live updates during hurricane season",
                    "Navigation cards to access all features"
                ],
                tip: "💡 TIP: Click on any card to jump to that section"
            },
            {
                title: "📊 Quick Stats",
                content: "Key metrics displayed on the home page:",
                bullets: [
                    "Total storms in database",
                    "Category 5 hurricane count",
                    "Major hurricanes (Cat 3+)",
                    "Recent significant storms"
                ],
                tip: "💡 TIP: Stats update in real-time during hurricane season"
            },
            {
                title: "🗂️ Dashboard Tabs (Left to Right)",
                content: "Navigate through all six tabs for complete hurricane intelligence:",
                bullets: [
                    "1. Home - Dashboard overview and quick stats (you are here)",
                    "2. Timeline - Interactive historical storm viewer",
                    "3. Regional - Multi-state comparison tools",
                    "4. Database - Complete searchable storm records",
                    "5. Intelligence - Advanced storm analysis and comparisons",
                    "6. Response - Red Cross disaster operations data"
                ],
                tip: "💡 TIP: Each tab has specialized tools - explore them all!"
            },
            {
                title: "💻 Technical Stack",
                content: "Built with modern web technologies:",
                bullets: [
                    "Mapbox GL JS - 3D hurricane visualization",
                    "Leaflet.js - 2D interactive mapping",
                    "Alpine.js - Reactive UI state management",
                    "Plotly.js - Interactive charts and timelines",
                    "Tailwind CSS - Utility-first styling",
                    "GeoJSON - Storm track data format",
                    "HURDAT2 - NOAA hurricane database"
                ],
                tip: "💡 TIP: Open source and hosted on GitHub Pages"
            }
        ]
    },
    timeline: {
        title: "Timeline Tab Help",
        sections: [
            {
                title: "🗂️ All Dashboard Tabs",
                content: "Navigate through all six tabs:",
                bullets: [
                    "1. Home - Dashboard overview",
                    "2. Timeline - Interactive historical viewer (you are here)",
                    "3. Regional - Multi-state comparisons",
                    "4. Database - Searchable storm records",
                    "5. Intelligence - Storm analysis tools",
                    "6. Response - Red Cross operations"
                ],
                tip: "💡 TIP: Each tab has unique analysis tools"
            },
            {
                title: "📅 Timeline Navigation",
                content: "Explore hurricanes through time:",
                bullets: [
                    "Drag the year slider to jump to any period",
                    "Click on any storm bubble to see details",
                    "Hover for quick storm info",
                    "Use mouse wheel to zoom timeline"
                ],
                tip: "💡 TIP: Larger bubbles = stronger storms"
            },
            {
                title: "🗺️ Interactive Map",
                content: "The map shows complete storm tracks:",
                bullets: [
                    "Rainbow colors indicate intensity changes",
                    "Click tracks for storm details",
                    "Zoom with mouse wheel or buttons",
                    "Pan by dragging the map"
                ],
                tip: "💡 TIP: Red/purple tracks = major hurricanes"
            },
            {
                title: "🎯 Filters",
                content: "Use the filter panel to focus on specific storms:",
                bullets: [
                    "Category checkboxes",
                    "Landfall Only toggle",
                    "Name search box"
                ],
                tip: "💡 TIP: Turn on 'Landfall Only' to see storms that hit the US"
            }
        ]
    },
    regional: {
        title: "Regional Tab Help",
        sections: [
            {
                title: "🗂️ All Dashboard Tabs",
                content: "Navigate through all six tabs:",
                bullets: [
                    "1. Home - Dashboard overview",
                    "2. Timeline - Interactive historical viewer",
                    "3. Regional - Multi-state comparisons (you are here)",
                    "4. Database - Searchable storm records",
                    "5. Intelligence - Storm analysis tools",
                    "6. Response - Red Cross operations"
                ],
                tip: "💡 TIP: Each tab has unique analysis tools"
            },
            {
                title: "🌊 State Selection",
                content: "Compare hurricane impacts across states:",
                bullets: [
                    "Select up to 3 states from dropdown",
                    "View timeline scatter plot",
                    "See all historical tracks on map",
                    "Color-coded by state"
                ],
                tip: "💡 TIP: Select Florida, Texas, and Louisiana to compare the most impacted states"
            },
            {
                title: "📈 Timeline Analysis",
                content: "The scatter plot shows:",
                bullets: [
                    "Each dot = one hurricane landfall",
                    "Y-axis = Storm intensity",
                    "X-axis = Year",
                    "Hover for storm details"
                ],
                tip: "💡 TIP: Look for patterns in frequency over decades"
            }
        ]
    },
    database: {
        title: "Database Tab Help",
        sections: [
            {
                title: "🗂️ All Dashboard Tabs",
                content: "Navigate through all six tabs:",
                bullets: [
                    "1. Home - Dashboard overview",
                    "2. Timeline - Interactive historical viewer",
                    "3. Regional - Multi-state comparisons",
                    "4. Database - Searchable storm records (you are here)",
                    "5. Intelligence - Storm analysis tools",
                    "6. Response - Red Cross operations"
                ],
                tip: "💡 TIP: Each tab has unique analysis tools"
            },
            {
                title: "🔍 Using Filters",
                content: "Click the purple Filters button to reveal filtering options. You can filter by:",
                bullets: [
                    "Hurricane Category (TD through Cat 5)",
                    "Year Range (1851-2024)",
                    "Landfall States (US coastal states)",
                    "Storm Name (search box)"
                ],
                tip: "💡 TIP: Use multiple filters together for precise results"
            },
            {
                title: "📊 Viewing Storm Details",
                content: "Click the 'View' button on any storm row to see:",
                bullets: [
                    "Animated storm track on map",
                    "Full storm narrative and impacts",
                    "Play/pause animation controls",
                    "3D view option with Mapbox"
                ],
                tip: "💡 TIP: Click '3D View' for an impressive perspective view"
            },
            {
                title: "📥 Exporting Data",
                content: "Use the Export button in the header to download:",
                bullets: [
                    "CSV file with all filtered storms",
                    "27 data fields per storm",
                    "Ready for Excel or data analysis"
                ],
                tip: "💡 TIP: Apply filters first to export specific subsets"
            },
            {
                title: "🔢 Sorting",
                content: "Click any column header to sort. Click again to reverse order.",
                tip: "💡 TIP: Sort by Wind Speed to find the strongest storms"
            }
        ]
    },
    intelligence: {
        title: "Intelligence Tab Help",
        sections: [
            {
                title: "🗂️ All Dashboard Tabs",
                content: "Navigate through all six tabs:",
                bullets: [
                    "1. Home - Dashboard overview",
                    "2. Timeline - Interactive historical viewer",
                    "3. Regional - Multi-state comparisons",
                    "4. Database - Searchable storm records",
                    "5. Intelligence - Storm analysis tools (you are here)",
                    "6. Response - Red Cross operations"
                ],
                tip: "💡 TIP: Each tab has unique analysis tools"
            },
            {
                title: "🔬 Storm Comparison",
                content: "Compare up to 3 storms side-by-side:",
                bullets: [
                    "Type storm names in search boxes",
                    "Spider chart shows multiple metrics",
                    "Wind-Pressure scatter plot",
                    "Historical intensity timeline"
                ],
                tip: "💡 TIP: Compare Katrina, Andrew, and Michael for major storm analysis"
            },
            {
                title: "📊 Charts Explained",
                content: "Understanding the visualizations:",
                bullets: [
                    "Spider Chart: Multi-metric comparison",
                    "Scatter Plot: Relationship between wind and pressure",
                    "Timeline: Category 5 storms highlighted in purple"
                ],
                tip: "💡 TIP: Lower pressure = stronger storm"
            }
        ]
    },
    response: {
        title: "Response Tab Help",
        sections: [
            {
                title: "🗂️ All Dashboard Tabs",
                content: "Navigate through all six tabs:",
                bullets: [
                    "1. Home - Dashboard overview",
                    "2. Timeline - Interactive historical viewer",
                    "3. Regional - Multi-state comparisons",
                    "4. Database - Searchable storm records",
                    "5. Intelligence - Storm analysis tools",
                    "6. Response - Red Cross operations (you are here)"
                ],
                tip: "💡 TIP: Each tab has unique analysis tools"
            },
            {
                title: "🚨 Red Cross Operations",
                content: "View disaster response data:",
                bullets: [
                    "Only shows Category 3+ storms with US landfall",
                    "Response levels: 1 (local) to 5 (national)",
                    "Resource deployment charts",
                    "Timeline of major operations"
                ],
                tip: "💡 TIP: Click on operations to see storm tracks"
            },
            {
                title: "📊 Resource Charts",
                content: "Understanding response metrics:",
                bullets: [
                    "Shelters opened",
                    "Meals served",
                    "Relief items distributed",
                    "Volunteers deployed"
                ],
                tip: "💡 TIP: Larger storms typically trigger Level 5 responses"
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