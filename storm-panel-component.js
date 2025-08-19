// Unified Storm Panel Component
// A single source of truth for storm information panels across all tabs
// Usage: <storm-panel storm-data='${JSON.stringify(storm)}'></storm-panel>

class StormPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['storm-data'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'storm-data' && oldValue !== newValue) {
            this.render();
        }
    }

    getCategoryColor(category) {
        const colors = {
            '-1': '#9CA3AF', // Gray for TD
            '0': '#3B82F6',  // Blue for TS
            '1': '#10B981',  // Green
            '2': '#F59E0B',  // Yellow
            '3': '#FB923C',  // Orange
            '4': '#EF4444',  // Red
            '5': '#A855F7'   // Purple
        };
        return colors[category] || '#9CA3AF';
    }

    getCategoryLabel(category) {
        if (category === -1) return 'TD';
        if (category === 0) return 'TS';
        return `C${category}`;
    }

    getMonthName(month) {
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month] || '';
    }

    render() {
        const stormData = this.getAttribute('storm-data');
        
        if (!stormData) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        width: 100%;
                        height: 100%;
                        font-family: system-ui, -apple-system, sans-serif;
                    }
                    .empty-state {
                        padding: 20px;
                        text-align: center;
                        color: #6B7280;
                        font-size: 14px;
                    }
                </style>
                <div class="empty-state">
                    Click on a storm to view details
                </div>
            `;
            return;
        }

        let storm;
        try {
            storm = JSON.parse(stormData);
        } catch (e) {
            console.error('Invalid storm data:', e);
            return;
        }

        const categoryColor = this.getCategoryColor(storm.category);
        const categoryLabel = this.getCategoryLabel(storm.category);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: system-ui, -apple-system, sans-serif;
                    background: white;
                }
                
                .panel-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .header {
                    background: linear-gradient(to right, #f9fafb, #f3f4f6);
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .storm-name {
                    font-size: 20px;
                    font-weight: bold;
                    color: #111827;
                }
                
                .category-badge {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .stats-grid {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                }
                
                .stat-label {
                    color: #6B7280;
                }
                
                .stat-value {
                    font-weight: 600;
                    color: #111827;
                }
                
                .narrative-section {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }
                
                .narrative-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6B7280;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .narrative-content {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #374151;
                }
                
                .no-narrative {
                    font-style: italic;
                    color: #9CA3AF;
                }
                
                .impact-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .impact-catastrophic { background: #7F1D1D; color: white; }
                .impact-severe { background: #DC2626; color: white; }
                .impact-major { background: #EA580C; color: white; }
                .impact-moderate { background: #F59E0B; color: white; }
                .impact-minor { background: #10B981; color: white; }
            </style>
            
            <div class="panel-container">
                <div class="header">
                    <div class="header-content">
                        <div>
                            <div class="storm-name">${storm.name} (${storm.year})</div>
                            ${storm.rc_impact_level ? `
                                <span class="impact-badge impact-${storm.rc_impact_level.toLowerCase()}">
                                    ${storm.rc_impact_level}
                                </span>
                            ` : ''}
                        </div>
                        <div class="category-badge" style="background-color: ${categoryColor};">
                            ${categoryLabel}
                        </div>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Date:</span>
                        <span class="stat-value">${this.getMonthName(storm.month)} ${storm.day}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Wind:</span>
                        <span class="stat-value">${storm.wind_mph || 'N/A'} mph</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Pressure:</span>
                        <span class="stat-value">${storm.pressure || 'N/A'} mb</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Landfall:</span>
                        <span class="stat-value">${storm.landfall_states?.join(', ') || 'None'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Deaths:</span>
                        <span class="stat-value">${storm.deaths || '0'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Damage:</span>
                        <span class="stat-value">${storm.damage_millions ? '$' + storm.damage_millions + 'M' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="narrative-section">
                    <div class="narrative-title">Historical Narrative</div>
                    <div class="narrative-content">
                        ${storm.narrative ? 
                            `<p>${storm.narrative}</p>` : 
                            `<p class="no-narrative">No historical narrative available for this storm.</p>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

// Register the custom element
customElements.define('storm-panel', StormPanel);

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StormPanel;
}