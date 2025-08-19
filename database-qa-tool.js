// Database Q&A Tool - Actually uses the real hurricane database
class DatabaseQA {
    constructor() {
        this.storms = window.ATLANTIC_STORMS_ENHANCED || [];
        this.init();
    }

    init() {
        this.createUI();
        this.attachEventListeners();
    }

    createUI() {
        // Create the Q&A button
        const qaButton = document.createElement('button');
        qaButton.id = 'qa-button';
        qaButton.className = 'qa-button';
        qaButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span class="qa-badge">Q&A</span>
        `;

        // Create the Q&A window
        const qaWindow = document.createElement('div');
        qaWindow.id = 'qa-window';
        qaWindow.className = 'qa-window';
        qaWindow.style.display = 'none';
        qaWindow.innerHTML = `
            <div class="qa-header">
                <h3>Hurricane Database Q&A</h3>
                <button class="qa-close">×</button>
            </div>
            <div class="qa-content">
                <div class="qa-presets">
                    <h4>Quick Questions:</h4>
                    <button class="qa-preset" data-query="nc-1990-2000">NC storms 1990-2000</button>
                    <button class="qa-preset" data-query="cat5-all">All Category 5 storms</button>
                    <button class="qa-preset" data-query="2024-storms">2024 hurricane season</button>
                    <button class="qa-preset" data-query="fl-major">Major FL hurricanes</button>
                    <button class="qa-preset" data-query="deadliest">Deadliest storms</button>
                </div>
                <div class="qa-custom">
                    <h4>Custom Search:</h4>
                    <select id="qa-state">
                        <option value="">Any State</option>
                        <option value="FL">Florida</option>
                        <option value="NC">North Carolina</option>
                        <option value="TX">Texas</option>
                        <option value="LA">Louisiana</option>
                        <option value="SC">South Carolina</option>
                        <option value="GA">Georgia</option>
                        <option value="AL">Alabama</option>
                        <option value="MS">Mississippi</option>
                        <option value="VA">Virginia</option>
                        <option value="NY">New York</option>
                        <option value="NJ">New Jersey</option>
                        <option value="MA">Massachusetts</option>
                        <option value="ME">Maine</option>
                    </select>
                    <select id="qa-category">
                        <option value="">Any Category</option>
                        <option value="5">Category 5</option>
                        <option value="4">Category 4</option>
                        <option value="3">Category 3</option>
                        <option value="2">Category 2</option>
                        <option value="1">Category 1</option>
                        <option value="0">Tropical Storm</option>
                    </select>
                    <input type="number" id="qa-year-start" placeholder="Start Year" min="1851" max="2024">
                    <input type="number" id="qa-year-end" placeholder="End Year" min="1851" max="2024">
                    <button id="qa-search">Search Database</button>
                </div>
                <div id="qa-results"></div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .qa-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #e74c3c;
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .qa-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
            }
            
            .qa-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #27ae60;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
            }
            
            .qa-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 400px;
                max-height: 600px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 999;
                overflow: hidden;
            }
            
            .qa-header {
                background: #e74c3c;
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .qa-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .qa-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
            }
            
            .qa-content {
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .qa-presets {
                margin-bottom: 15px;
            }
            
            .qa-presets h4, .qa-custom h4 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 14px;
            }
            
            .qa-preset {
                display: inline-block;
                margin: 3px;
                padding: 6px 12px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .qa-preset:hover {
                background: #2980b9;
                transform: scale(1.05);
            }
            
            .qa-custom {
                margin-bottom: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .qa-custom select, .qa-custom input {
                width: 100%;
                margin: 5px 0;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }
            
            #qa-search {
                width: 100%;
                margin-top: 10px;
                padding: 10px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            #qa-search:hover {
                background: #229954;
            }
            
            #qa-results {
                margin-top: 15px;
                padding: 15px;
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .qa-result-summary {
                padding: 10px;
                background: #f0f0f0;
                border-radius: 4px;
                margin-bottom: 10px;
                font-weight: bold;
                color: #2c3e50;
            }
            
            .qa-storm-item {
                padding: 8px;
                margin: 4px 0;
                background: #f8f9fa;
                border-left: 3px solid #3498db;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .qa-storm-item:hover {
                background: #e3f2fd;
                border-left-color: #e74c3c;
            }
            
            .qa-storm-cat5 {
                border-left-color: #e74c3c;
                background: #ffebee;
            }
            
            .qa-storm-cat4 {
                border-left-color: #ff9800;
                background: #fff3e0;
            }
            
            .qa-storm-cat3 {
                border-left-color: #ffc107;
                background: #fffde7;
            }
            
            @media (max-width: 480px) {
                .qa-window {
                    width: 90%;
                    right: 5%;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(qaButton);
        document.body.appendChild(qaWindow);
    }

    attachEventListeners() {
        const button = document.getElementById('qa-button');
        const closeBtn = document.querySelector('.qa-close');
        const searchBtn = document.getElementById('qa-search');
        const presets = document.querySelectorAll('.qa-preset');

        button.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        searchBtn.addEventListener('click', () => this.customSearch());

        presets.forEach(btn => {
            btn.addEventListener('click', () => this.presetSearch(btn.dataset.query));
        });
    }

    toggle() {
        const window = document.getElementById('qa-window');
        window.style.display = window.style.display === 'none' ? 'block' : 'none';
    }

    close() {
        document.getElementById('qa-window').style.display = 'none';
    }

    presetSearch(query) {
        let results = [];
        let title = '';

        switch(query) {
            case 'nc-1990-2000':
                results = this.storms.filter(s => 
                    s.year >= 1990 && s.year <= 2000 && 
                    s.landfall_states && s.landfall_states.includes('NC')
                );
                title = 'North Carolina Storms (1990-2000)';
                break;
            
            case 'cat5-all':
                results = this.storms.filter(s => s.category === 5);
                title = 'All Category 5 Hurricanes';
                break;
            
            case '2024-storms':
                results = this.storms.filter(s => s.year === 2024);
                title = '2024 Hurricane Season';
                break;
            
            case 'fl-major':
                results = this.storms.filter(s => 
                    s.category >= 3 && 
                    s.landfall_states && s.landfall_states.includes('FL')
                );
                title = 'Major Florida Hurricanes (Cat 3+)';
                break;
            
            case 'deadliest':
                results = this.storms
                    .filter(s => s.deaths && s.deaths > 0)
                    .sort((a, b) => b.deaths - a.deaths)
                    .slice(0, 20);
                title = 'Top 20 Deadliest Storms';
                break;
        }

        this.displayResults(results, title);
    }

    customSearch() {
        const state = document.getElementById('qa-state').value;
        const category = document.getElementById('qa-category').value;
        const yearStart = document.getElementById('qa-year-start').value || 1851;
        const yearEnd = document.getElementById('qa-year-end').value || 2024;

        let results = this.storms.filter(s => {
            if (state && (!s.landfall_states || !s.landfall_states.includes(state))) return false;
            if (category !== '' && s.category != category) return false;
            if (s.year < yearStart || s.year > yearEnd) return false;
            return true;
        });

        let title = `Custom Search: `;
        if (state) title += `${state} `;
        if (category !== '') title += `Cat ${category} `;
        title += `(${yearStart}-${yearEnd})`;

        this.displayResults(results, title);
    }

    displayResults(storms, title) {
        const resultsDiv = document.getElementById('qa-results');
        
        if (storms.length === 0) {
            resultsDiv.innerHTML = `
                <div class="qa-result-summary">
                    ${title}: No storms found
                </div>
            `;
            return;
        }

        // Sort by year
        storms.sort((a, b) => b.year - a.year);

        let html = `
            <div class="qa-result-summary">
                ${title}: ${storms.length} storms found
            </div>
        `;

        storms.forEach(s => {
            const catClass = s.category >= 5 ? 'qa-storm-cat5' : 
                           s.category >= 4 ? 'qa-storm-cat4' : 
                           s.category >= 3 ? 'qa-storm-cat3' : '';
            
            html += `
                <div class="qa-storm-item ${catClass}" onclick="window.viewStormDetails('${s.storm_id}')">
                    <strong>${s.name}</strong> (${s.year})
                    <br>Category ${s.category}, ${s.wind_mph} mph
                    ${s.landfall_states ? `<br>Hit: ${s.landfall_states.join(', ')}` : ''}
                    ${s.deaths ? `<br>Deaths: ${s.deaths}` : ''}
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }
}

// Helper function to view storm details
window.viewStormDetails = function(stormId) {
    const storm = window.ATLANTIC_STORMS_ENHANCED.find(s => s.storm_id === stormId);
    if (storm) {
        // If we're in the database tab, select the storm
        const row = document.querySelector(`tr[data-storm-id="${stormId}"]`);
        if (row) {
            row.click();
        } else {
            // Show in alert if not in database tab
            alert(`${storm.name} (${storm.year})\nCategory ${storm.category}\n${storm.wind_mph} mph winds\n${storm.narrative || 'No narrative available'}`);
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new DatabaseQA();
    }, 1000); // Wait for database to load
});