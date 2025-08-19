// American Red Cross Operational Tools
// Shelter Capacity Predictor & Language Need Predictor

class RedCrossTools {
    constructor() {
        this.storms = window.ATLANTIC_STORMS_ENHANCED || [];
        this.init();
        this.setupDemographicData();
    }

    init() {
        this.createUI();
        this.attachEventListeners();
    }

    setupDemographicData() {
        // Language demographics by major coastal cities/regions
        this.languageData = {
            'Miami-Dade, FL': {
                spanish: 69.1,
                haitian_creole: 6.8,
                portuguese: 1.2,
                french: 0.8,
                population: 2716940
            },
            'Houston, TX': {
                spanish: 37.4,
                vietnamese: 2.1,
                chinese: 1.8,
                arabic: 0.9,
                population: 2320268
            },
            'New Orleans, LA': {
                spanish: 5.1,
                vietnamese: 2.9,
                french: 1.2,
                haitian_creole: 0.8,
                population: 391006
            },
            'Tampa Bay, FL': {
                spanish: 25.5,
                haitian_creole: 1.2,
                vietnamese: 0.8,
                arabic: 0.6,
                population: 3175275
            },
            'Charleston, SC': {
                spanish: 5.8,
                french: 0.9,
                german: 0.7,
                tagalog: 0.5,
                population: 150227
            },
            'Wilmington, NC': {
                spanish: 6.2,
                french: 0.8,
                german: 0.6,
                chinese: 0.5,
                population: 123744
            },
            'Jacksonville, FL': {
                spanish: 8.9,
                tagalog: 1.8,
                arabic: 0.9,
                vietnamese: 0.7,
                population: 949611
            },
            'Mobile, AL': {
                spanish: 2.6,
                vietnamese: 1.9,
                french: 0.5,
                chinese: 0.4,
                population: 187041
            },
            'Savannah, GA': {
                spanish: 4.3,
                vietnamese: 0.9,
                french: 0.6,
                korean: 0.4,
                population: 147780
            },
            'Corpus Christi, TX': {
                spanish: 62.3,
                vietnamese: 0.4,
                tagalog: 0.3,
                chinese: 0.2,
                population: 326586
            },
            'Brownsville, TX': {
                spanish: 87.6,
                vietnamese: 0.2,
                chinese: 0.1,
                tagalog: 0.1,
                population: 186738
            },
            'Key West, FL': {
                spanish: 21.3,
                haitian_creole: 2.1,
                french: 0.8,
                portuguese: 0.5,
                population: 24649
            }
        };

        // Shelter capacity formulas based on storm category and population
        this.shelterFormulas = {
            5: { evacuationRate: 0.35, shelterRate: 0.15 }, // Cat 5: 35% evacuate, 15% need shelter
            4: { evacuationRate: 0.25, shelterRate: 0.10 }, // Cat 4: 25% evacuate, 10% need shelter
            3: { evacuationRate: 0.15, shelterRate: 0.06 }, // Cat 3: 15% evacuate, 6% need shelter
            2: { evacuationRate: 0.08, shelterRate: 0.03 }, // Cat 2: 8% evacuate, 3% need shelter
            1: { evacuationRate: 0.05, shelterRate: 0.02 }, // Cat 1: 5% evacuate, 2% need shelter
            0: { evacuationRate: 0.02, shelterRate: 0.01 }  // TS: 2% evacuate, 1% need shelter
        };
    }

    createUI() {
        // Create Red Cross Tools button
        const rcButton = document.createElement('button');
        rcButton.id = 'rc-button';
        rcButton.className = 'rc-button';
        rcButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="10" y="3" width="4" height="18" fill="white"/>
                <rect x="3" y="10" width="18" height="4" fill="white"/>
            </svg>
            <span class="rc-badge">RC</span>
        `;

        // Create Red Cross Tools panel
        const rcPanel = document.createElement('div');
        rcPanel.id = 'rc-panel';
        rcPanel.className = 'rc-panel';
        rcPanel.style.display = 'none';
        rcPanel.innerHTML = `
            <div class="rc-header">
                <h3>🏥 American Red Cross Operations Tools</h3>
                <button class="rc-close">×</button>
            </div>
            
            <div class="rc-tabs">
                <button class="rc-tab active" data-tab="shelter">Shelter Predictor</button>
                <button class="rc-tab" data-tab="language">Language Needs</button>
            </div>
            
            <!-- Shelter Capacity Predictor -->
            <div class="rc-content" id="tab-shelter">
                <h4>🏠 Shelter Capacity Predictor</h4>
                <p style="font-size: 12px; color: #666;">Predicts shelter needs based on storm intensity and affected population</p>
                
                <div class="shelter-controls">
                    <div class="control-group">
                        <label>Select Active Storm:</label>
                        <select id="storm-selector">
                            <option value="">Choose a storm to track...</option>
                            <option value="custom">Custom Storm Scenario</option>
                        </select>
                    </div>
                    
                    <div id="custom-storm" style="display: none;">
                        <div class="control-group">
                            <label>Category:</label>
                            <select id="custom-category">
                                <option value="5">Category 5</option>
                                <option value="4">Category 4</option>
                                <option value="3">Category 3</option>
                                <option value="2">Category 2</option>
                                <option value="1">Category 1</option>
                                <option value="0">Tropical Storm</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Target City:</label>
                            <select id="custom-city">
                                <option value="Miami-Dade, FL">Miami-Dade, FL</option>
                                <option value="Houston, TX">Houston, TX</option>
                                <option value="New Orleans, LA">New Orleans, LA</option>
                                <option value="Tampa Bay, FL">Tampa Bay, FL</option>
                                <option value="Charleston, SC">Charleston, SC</option>
                                <option value="Jacksonville, FL">Jacksonville, FL</option>
                                <option value="Mobile, AL">Mobile, AL</option>
                                <option value="Savannah, GA">Savannah, GA</option>
                                <option value="Corpus Christi, TX">Corpus Christi, TX</option>
                            </select>
                        </div>
                    </div>
                    
                    <button id="predict-shelter" class="action-btn">Calculate Shelter Needs</button>
                </div>
                
                <div id="shelter-results" class="results-panel" style="display: none;">
                    <h5>📊 Shelter Requirements Forecast</h5>
                    <div id="shelter-stats"></div>
                    <div id="shelter-timeline"></div>
                    <div id="resource-needs"></div>
                    <div id="historical-comparison"></div>
                </div>
            </div>
            
            <!-- Language Need Predictor -->
            <div class="rc-content" id="tab-language" style="display: none;">
                <h4>🗣️ Language Need Predictor</h4>
                <p style="font-size: 12px; color: #666;">Estimates translator and material needs based on storm path</p>
                
                <div class="language-controls">
                    <div class="control-group">
                        <label>Storm Path Through:</label>
                        <div id="path-selector">
                            <label class="checkbox-label">
                                <input type="checkbox" value="Miami-Dade, FL"> Miami-Dade
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Houston, TX"> Houston
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="New Orleans, LA"> New Orleans
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Tampa Bay, FL"> Tampa Bay
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Charleston, SC"> Charleston
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Jacksonville, FL"> Jacksonville
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Corpus Christi, TX"> Corpus Christi
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="Brownsville, TX"> Brownsville
                            </label>
                        </div>
                    </div>
                    
                    <button id="predict-language" class="action-btn">Calculate Language Needs</button>
                </div>
                
                <div id="language-results" class="results-panel" style="display: none;">
                    <h5>🌍 Language Support Requirements</h5>
                    <div id="language-breakdown"></div>
                    <div id="translator-needs"></div>
                    <div id="material-needs"></div>
                    <div id="deployment-priority"></div>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .rc-button {
                position: fixed;
                bottom: 20px;
                right: 90px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #ed1b2e;
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(237, 27, 46, 0.3);
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .rc-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(237, 27, 46, 0.4);
            }
            
            .rc-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #003d79;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
            }
            
            .rc-panel {
                position: fixed;
                bottom: 90px;
                right: 90px;
                width: 500px;
                max-height: 600px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 999;
                overflow: hidden;
            }
            
            .rc-header {
                background: #ed1b2e;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .rc-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .rc-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
            }
            
            .rc-tabs {
                display: flex;
                background: #f5f5f5;
                border-bottom: 1px solid #ddd;
            }
            
            .rc-tab {
                flex: 1;
                padding: 12px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
                border-bottom: 3px solid transparent;
            }
            
            .rc-tab.active {
                background: white;
                border-bottom: 3px solid #ed1b2e;
                font-weight: bold;
            }
            
            .rc-content {
                padding: 20px;
                max-height: 450px;
                overflow-y: auto;
            }
            
            .rc-content h4 {
                margin: 0 0 10px 0;
                color: #003d79;
                font-size: 16px;
            }
            
            .control-group {
                margin: 15px 0;
            }
            
            .control-group label {
                display: block;
                margin-bottom: 5px;
                color: #333;
                font-size: 13px;
                font-weight: bold;
            }
            
            .control-group select, .control-group input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .checkbox-label {
                display: inline-block;
                margin: 5px 10px 5px 0;
                font-size: 13px;
            }
            
            .checkbox-label input {
                margin-right: 5px;
                width: auto;
            }
            
            .action-btn {
                width: 100%;
                padding: 12px;
                background: #003d79;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s;
            }
            
            .action-btn:hover {
                background: #002855;
                transform: translateY(-2px);
            }
            
            .results-panel {
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }
            
            .results-panel h5 {
                margin: 0 0 15px 0;
                color: #ed1b2e;
                font-size: 14px;
            }
            
            .stat-box {
                display: inline-block;
                padding: 10px 15px;
                margin: 5px;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #ed1b2e;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #003d79;
            }
            
            .stat-label {
                font-size: 12px;
                color: #666;
            }
            
            .priority-high {
                background: #ffebee;
                border-left-color: #f44336;
            }
            
            .priority-medium {
                background: #fff3e0;
                border-left-color: #ff9800;
            }
            
            .priority-low {
                background: #e8f5e9;
                border-left-color: #4caf50;
            }
            
            .language-bar {
                display: flex;
                align-items: center;
                margin: 8px 0;
            }
            
            .language-label {
                width: 120px;
                font-size: 13px;
            }
            
            .language-progress {
                flex: 1;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin: 0 10px;
            }
            
            .language-fill {
                height: 100%;
                background: linear-gradient(90deg, #ed1b2e, #003d79);
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding-right: 5px;
                color: white;
                font-size: 11px;
                font-weight: bold;
            }
            
            @media (max-width: 600px) {
                .rc-panel {
                    width: 90%;
                    right: 5%;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(rcButton);
        document.body.appendChild(rcPanel);

        // Populate storm selector with recent major storms
        this.populateStormSelector();
    }

    populateStormSelector() {
        const selector = document.getElementById('storm-selector');
        const recentMajorStorms = this.storms
            .filter(s => s.year >= 2020 && s.category >= 3)
            .sort((a, b) => b.year - a.year)
            .slice(0, 10);

        recentMajorStorms.forEach(storm => {
            const option = document.createElement('option');
            option.value = storm.storm_id;
            option.textContent = `${storm.name} (${storm.year}) - Category ${storm.category}`;
            selector.appendChild(option);
        });
    }

    attachEventListeners() {
        const button = document.getElementById('rc-button');
        const closeBtn = document.querySelector('.rc-close');
        const tabs = document.querySelectorAll('.rc-tab');
        const stormSelector = document.getElementById('storm-selector');
        const predictShelter = document.getElementById('predict-shelter');
        const predictLanguage = document.getElementById('predict-language');

        button.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        stormSelector.addEventListener('change', (e) => {
            const customDiv = document.getElementById('custom-storm');
            customDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        predictShelter.addEventListener('click', () => this.calculateShelterNeeds());
        predictLanguage.addEventListener('click', () => this.calculateLanguageNeeds());
    }

    toggle() {
        const panel = document.getElementById('rc-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    close() {
        document.getElementById('rc-panel').style.display = 'none';
    }

    switchTab(tabName) {
        document.querySelectorAll('.rc-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.rc-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`tab-${tabName}`).style.display = 'block';
    }

    calculateShelterNeeds() {
        const selector = document.getElementById('storm-selector').value;
        const resultsDiv = document.getElementById('shelter-results');
        
        let category, city, stormName;
        
        if (selector === 'custom') {
            category = parseInt(document.getElementById('custom-category').value);
            city = document.getElementById('custom-city').value;
            stormName = `Category ${category} Hurricane`;
        } else if (selector) {
            const storm = this.storms.find(s => s.storm_id === selector);
            category = storm.category;
            stormName = `${storm.name} (${storm.year})`;
            // For demo, use closest major city
            city = 'Miami-Dade, FL';
        } else {
            alert('Please select a storm or custom scenario');
            return;
        }

        const cityData = this.languageData[city];
        const formula = this.shelterFormulas[category];
        
        // Calculate needs
        const evacuees = Math.round(cityData.population * formula.evacuationRate);
        const shelterNeeded = Math.round(cityData.population * formula.shelterRate);
        const bedsNeeded = shelterNeeded;
        const mealsPerDay = shelterNeeded * 3;
        const volunteersNeeded = Math.round(shelterNeeded / 50); // 1 volunteer per 50 people
        const cotsNeeded = Math.round(bedsNeeded * 1.1); // 10% extra
        const blanketsNeeded = bedsNeeded * 2; // 2 per person
        const waterGallons = shelterNeeded * 1; // 1 gallon per person per day

        // Find similar historical storm
        const similarStorms = this.storms.filter(s => 
            s.category === category && 
            s.landfall_states && 
            s.landfall_states.length > 0
        ).slice(0, 3);

        // Display results
        document.getElementById('shelter-stats').innerHTML = `
            <div class="stat-box priority-high">
                <div class="stat-number">${shelterNeeded.toLocaleString()}</div>
                <div class="stat-label">People Needing Shelter</div>
            </div>
            <div class="stat-box priority-high">
                <div class="stat-number">${bedsNeeded.toLocaleString()}</div>
                <div class="stat-label">Beds/Cots Required</div>
            </div>
            <div class="stat-box priority-medium">
                <div class="stat-number">${volunteersNeeded.toLocaleString()}</div>
                <div class="stat-label">Volunteers Needed</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${mealsPerDay.toLocaleString()}</div>
                <div class="stat-label">Meals Per Day</div>
            </div>
        `;

        document.getElementById('shelter-timeline').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">⏱️ Deployment Timeline</h6>
            <ul style="font-size: 13px; line-height: 1.8;">
                <li><strong>T-72 hours:</strong> Open ${Math.round(shelterNeeded/1000)} shelters, stage ${volunteersNeeded} volunteers</li>
                <li><strong>T-48 hours:</strong> Position ${cotsNeeded.toLocaleString()} cots, ${blanketsNeeded.toLocaleString()} blankets</li>
                <li><strong>T-24 hours:</strong> Final intake, expect ${Math.round(shelterNeeded * 0.6).toLocaleString()} arrivals</li>
                <li><strong>T-0:</strong> Peak capacity ${shelterNeeded.toLocaleString()} people</li>
                <li><strong>T+24 hours:</strong> Sustain operations, ${mealsPerDay.toLocaleString()} meals/day</li>
            </ul>
        `;

        document.getElementById('resource-needs').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">📦 Supply Requirements</h6>
            <ul style="font-size: 13px;">
                <li>🛏️ Cots: ${cotsNeeded.toLocaleString()}</li>
                <li>🧺 Blankets: ${blanketsNeeded.toLocaleString()}</li>
                <li>💧 Water: ${waterGallons.toLocaleString()} gallons/day</li>
                <li>🍽️ Meals: ${mealsPerDay.toLocaleString()}/day</li>
                <li>🧴 Hygiene Kits: ${shelterNeeded.toLocaleString()}</li>
                <li>🔌 Generators: ${Math.round(shelterNeeded/500)} large units</li>
            </ul>
        `;

        document.getElementById('historical-comparison').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">📚 Similar Historical Storms</h6>
            <div style="font-size: 13px;">
                ${similarStorms.map(s => `
                    <div style="margin: 5px 0; padding: 5px; background: white; border-radius: 4px;">
                        <strong>${s.name} (${s.year})</strong> - Category ${s.category}<br>
                        <small>Actual shelter usage data would go here</small>
                    </div>
                `).join('')}
            </div>
        `;

        resultsDiv.style.display = 'block';
    }

    calculateLanguageNeeds() {
        const checkboxes = document.querySelectorAll('#path-selector input:checked');
        if (checkboxes.length === 0) {
            alert('Please select at least one city in the storm path');
            return;
        }

        const resultsDiv = document.getElementById('language-results');
        const affectedCities = Array.from(checkboxes).map(cb => cb.value);
        
        // Aggregate language needs
        const totalLanguages = {};
        let totalPopulation = 0;
        
        affectedCities.forEach(city => {
            const data = this.languageData[city];
            totalPopulation += data.population;
            
            Object.keys(data).forEach(key => {
                if (key !== 'population') {
                    if (!totalLanguages[key]) totalLanguages[key] = 0;
                    totalLanguages[key] += (data[key] / 100) * data.population;
                }
            });
        });

        // Sort languages by need
        const sortedLanguages = Object.entries(totalLanguages)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, speakers]) => ({
                language: lang.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                speakers: Math.round(speakers),
                percentage: ((speakers / totalPopulation) * 100).toFixed(1)
            }));

        // Calculate translator needs (1 per 100 speakers for major languages)
        const translatorNeeds = sortedLanguages.map(lang => ({
            ...lang,
            translators: Math.max(1, Math.round(lang.speakers / 100))
        }));

        // Display results
        document.getElementById('language-breakdown').innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Total Affected Population:</strong> ${totalPopulation.toLocaleString()}<br>
                <strong>Cities in Path:</strong> ${affectedCities.join(', ')}
            </div>
            ${sortedLanguages.map(lang => `
                <div class="language-bar">
                    <div class="language-label">${lang.language}</div>
                    <div class="language-progress">
                        <div class="language-fill" style="width: ${lang.percentage}%">
                            ${lang.percentage}%
                        </div>
                    </div>
                    <div style="width: 80px; text-align: right; font-size: 12px;">
                        ${lang.speakers.toLocaleString()}
                    </div>
                </div>
            `).join('')}
        `;

        document.getElementById('translator-needs').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">👥 Translator Requirements</h6>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${translatorNeeds.slice(0, 6).map(lang => `
                    <div class="stat-box" style="margin: 0;">
                        <div class="stat-number">${lang.translators}</div>
                        <div class="stat-label">${lang.language} Translators</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('material-needs').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">📄 Material Translation Priorities</h6>
            <ol style="font-size: 13px;">
                <li><strong>Emergency Evacuation Orders</strong> - All languages >5%</li>
                <li><strong>Shelter Information</strong> - Top 3 languages</li>
                <li><strong>Medical Forms</strong> - Top 5 languages</li>
                <li><strong>FEMA Applications</strong> - Spanish + top 2 others</li>
                <li><strong>Recovery Resources</strong> - All languages >2%</li>
            </ol>
        `;

        const priorityLanguages = sortedLanguages.filter(l => l.percentage > 5);
        document.getElementById('deployment-priority').innerHTML = `
            <h6 style="margin-top: 15px; color: #003d79;">🚨 Deployment Priority</h6>
            <div style="font-size: 13px;">
                ${priorityLanguages.length > 0 ? `
                    <div class="priority-high" style="padding: 10px; margin: 5px 0; border-radius: 4px;">
                        <strong>CRITICAL (>5% of population):</strong><br>
                        ${priorityLanguages.map(l => `${l.language}: ${l.translators} translators`).join(', ')}
                    </div>
                ` : ''}
                <div class="priority-medium" style="padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <strong>HIGH (2-5% of population):</strong><br>
                    Deploy within 24 hours of landfall
                </div>
                <div class="priority-low" style="padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <strong>STANDARD (<2% of population):</strong><br>
                    Phone translation service sufficient
                </div>
            </div>
        `;

        resultsDiv.style.display = 'block';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new RedCrossTools();
    }, 1500);
});