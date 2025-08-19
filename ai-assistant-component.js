// AI Hurricane Assistant Component
// Provides intelligent hurricane data queries and automatic filter application

class AIAssistant {
    constructor() {
        // Try Vercel first (production), then local backend, then Cloudflare
        this.vercelUrl = 'https://hurricane-dashboard-v2.vercel.app/api/ai';
        this.localBackendUrl = 'http://localhost:3001/api/hurricane-ai';
        this.workerUrl = 'https://hurricane-ai-simple.jbf-395.workers.dev/';
        this.anthropicApiKey = ''; // DO NOT add key here - use backend instead!
        this.isOpen = false;
        this.messages = [];
        this.init();
        this.checkBackendStatus();
    }
    
    async checkBackendStatus() {
        try {
            const response = await fetch(this.localBackendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'test' })
            });
            if (response.ok) {
                console.log('✅ Local AI backend is running');
                this.useLocalBackend = true;
            }
        } catch (e) {
            console.log('📍 Local backend not running. Run: node ai-backend.js');
            this.useLocalBackend = false;
        }
    }

    init() {
        this.createAssistantUI();
        this.attachEventListeners();
        this.addInitialMessage();
    }

    createAssistantUI() {
        // Create the chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'ai-assistant-button';
        chatButton.className = 'ai-assistant-button';
        chatButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="assistant-badge">AI</span>
        `;
        
        // Create the chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-assistant-window';
        chatWindow.className = 'ai-assistant-window';
        chatWindow.innerHTML = `
            <div class="assistant-header">
                <h3>🌀 Hurricane Data Assistant</h3>
                <button class="assistant-close">✕</button>
            </div>
            <div class="assistant-messages" id="assistant-messages">
                <!-- Messages will appear here -->
            </div>
            <div class="assistant-input-container">
                <input type="text" 
                       id="assistant-input" 
                       class="assistant-input" 
                       placeholder="Ask about hurricanes (e.g., 'When do hurricanes hit west Florida?')"
                       autocomplete="off">
                <button id="assistant-send" class="assistant-send">Send</button>
            </div>
            <div class="assistant-suggestions">
                <div class="suggestion-title">Try asking:</div>
                <button class="suggestion-chip" data-query="What Category 5 hurricanes hit Florida's east coast in the last 50 years?">Cat 5 East Coast FL</button>
                <button class="suggestion-chip" data-query="Tell me about Hurricane Milton's 2024 impact">Hurricane Milton 2024</button>
                <button class="suggestion-chip" data-query="When is peak hurricane season for Florida?">FL Hurricane Season</button>
                <button class="suggestion-chip" data-query="Why is Tampa Bay vulnerable to hurricanes?">Tampa Bay Risk</button>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .ai-assistant-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s, box-shadow 0.3s;
            }

            .ai-assistant-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }

            .assistant-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 8px;
            }

            .ai-assistant-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 400px;
                height: 600px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                z-index: 999;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .ai-assistant-window.open {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .assistant-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .assistant-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .assistant-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .assistant-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: #f9fafb;
            }

            .assistant-message {
                margin-bottom: 15px;
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .assistant-message.user {
                text-align: right;
            }

            .assistant-message.user .message-content {
                background: #667eea;
                color: white;
                display: inline-block;
                padding: 10px 15px;
                border-radius: 18px 18px 4px 18px;
                max-width: 80%;
                text-align: left;
            }

            .assistant-message.assistant .message-content {
                background: white;
                color: #1f2937;
                display: inline-block;
                padding: 10px 15px;
                border-radius: 18px 18px 18px 4px;
                max-width: 90%;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                line-height: 1.5;
            }

            .assistant-message.system {
                text-align: center;
                font-style: italic;
                color: #6b7280;
                font-size: 14px;
            }

            .assistant-input-container {
                padding: 15px;
                background: white;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 10px;
            }

            .assistant-input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }

            .assistant-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .assistant-send {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 500;
                transition: background 0.2s;
            }

            .assistant-send:hover {
                background: #5a67d8;
            }

            .assistant-send:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            .assistant-suggestions {
                padding: 10px 15px;
                background: #f3f4f6;
                border-top: 1px solid #e5e7eb;
            }

            .suggestion-title {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 8px;
            }

            .suggestion-chip {
                background: white;
                border: 1px solid #d1d5db;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                margin: 3px;
                transition: all 0.2s;
            }

            .suggestion-chip:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .typing-indicator {
                display: inline-block;
                padding: 10px 15px;
                background: white;
                border-radius: 18px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .typing-indicator span {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }

            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .filter-applied {
                background: #10b981;
                color: white;
                padding: 5px 10px;
                border-radius: 8px;
                font-size: 12px;
                margin-top: 10px;
                display: inline-block;
            }

            @media (max-width: 768px) {
                .ai-assistant-window {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 100px);
                    right: 10px;
                    bottom: 80px;
                }
            }
        `;

        // Append to document
        document.head.appendChild(styles);
        document.body.appendChild(chatButton);
        document.body.appendChild(chatWindow);
    }

    attachEventListeners() {
        const button = document.getElementById('ai-assistant-button');
        const closeBtn = document.querySelector('.assistant-close');
        const input = document.getElementById('assistant-input');
        const sendBtn = document.getElementById('assistant-send');
        const suggestions = document.querySelectorAll('.suggestion-chip');

        button.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        suggestions.forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.query;
                this.sendMessage();
            });
        });
    }

    toggle() {
        const window = document.getElementById('ai-assistant-window');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            window.classList.add('open');
            document.getElementById('assistant-input').focus();
        } else {
            window.classList.remove('open');
        }
    }

    close() {
        const window = document.getElementById('ai-assistant-window');
        window.classList.remove('open');
        this.isOpen = false;
    }

    addInitialMessage() {
        this.addMessage('assistant', `Hello! I'm your Hurricane Data Assistant with access to the complete HURDAT2 database (1,991 storms from 1851-2024).

I can answer questions about:
• Specific hurricanes (Andrew, Katrina, Milton, etc.)
• Category 5 storms and major hurricane history
• Regional impacts (Florida east/west coast, Gulf states)
• The 2024 season (Helene, Milton, and others)
• Historical patterns and trends
• Why certain areas are vulnerable

Try asking: "What Category 5 hurricanes hit Florida's east coast in the last 50 years?"`);
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('assistant-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `assistant-message ${type}`;
        
        if (type === 'system') {
            messageDiv.textContent = content;
        } else {
            messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ type, content });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('assistant-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'assistant-message assistant';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async sendMessage() {
        const input = document.getElementById('assistant-input');
        const sendBtn = document.getElementById('assistant-send');
        const query = input.value.trim();
        
        if (!query) return;

        // Add user message
        this.addMessage('user', query);
        input.value = '';
        sendBtn.disabled = true;
        this.showTypingIndicator();

        try {
            // ONLY use Vercel production API - no fallbacks
            console.log('🚀 Sending to Vercel AI:', query);
            const response = await fetch('https://hurricane-dashboard-v2.vercel.app/api/ai', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 AI Response:', data);
            
            this.hideTypingIndicator();

            // Show AI response
            if (data && data.answer && data.answer !== 'Unable to process') {
                this.addMessage('assistant', data.answer);
                
                // Apply filters if AI suggests them
                if (data.filters) {
                    this.applyFilters(data.filters);
                    this.addMessage('system', '✓ Filters applied!');
                }
            } else {
                console.error('Invalid AI response:', data);
                this.addMessage('assistant', 'I apologize, but I encountered an error processing your question. Please try rephrasing it.');
            }

        } catch (error) {
            console.error('❌ AI Error:', error);
            this.hideTypingIndicator();
            // Don't show technical errors to users
            this.addMessage('assistant', 'I apologize, but I encountered an error. Please try again in a moment.');
        } finally {
            sendBtn.disabled = false;
        }
    }

    async sendMessage_OLD() {
        const input = document.getElementById('assistant-input');
        const sendBtn = document.getElementById('assistant-send');
        const query = input.value.trim();
        
        if (!query) return;

        // Add user message
        this.addMessage('user', query);
        input.value = '';
        sendBtn.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            let data = null;
            
            // Try Vercel production API first
            try {
                console.log('Trying Vercel API');
                const response = await fetch(this.vercelUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query })
                });
                if (response.ok) {
                    data = await response.json();
                    console.log('✅ Vercel API responded');
                }
            } catch (e) {
                console.log('Vercel API not available:', e);
            }
            
            // Try local backend if Vercel failed
            if (!data && this.useLocalBackend) {
                try {
                    console.log('Using local AI backend');
                    const response = await fetch(this.localBackendUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: query })
                    });
                    if (response.ok) {
                        data = await response.json();
                    }
                } catch (e) {
                    console.log('Local backend failed:', e);
                }
            }
            
            // Try direct API if key is configured (less secure)
            if (!data && this.anthropicApiKey && this.anthropicApiKey.startsWith('sk-ant-')) {
                try {
                    console.log('Using direct Anthropic API');
                    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': this.anthropicApiKey,
                            'anthropic-version': '2023-06-01',
                            'anthropic-dangerous-direct-browser-access': 'true'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-haiku-20240307',
                            max_tokens: 600,
                            messages: [{
                                role: 'user',
                                content: `You are a hurricane expert with the HURDAT2 database (1,991 storms, 1851-2024).
                                
Key facts: Andrew (1992) only Cat 5 to hit FL east coast. Matthew (2016) and Dorian (2019) were Cat 5 but weakened. Michael (2018) Cat 5 in Panhandle. 2024: Helene Cat 4 Big Bend, Milton Cat 3 Sarasota.

Answer concisely: ${query}`
                            }]
                        })
                    });
                    
                    if (anthropicResponse.ok) {
                        const result = await anthropicResponse.json();
                        data = {
                            answer: result.content[0].text,
                            filters: this.extractFilters(query)
                        };
                    }
                } catch (aiError) {
                    console.log('Direct AI failed:', aiError);
                }
            }
            
            // Skip Cloudflare worker - it has CORS issues
            // Just use our built-in fallback intelligence
            
            // Hide typing indicator
            this.hideTypingIndicator();

            // Only proceed if we got real AI response
            if (data && data.answer && !data.answer.includes('Looking at Hurricane')) {
                this.addMessage('assistant', data.answer);
                
                // Apply filters if suggested
                if (data.filters && data.filters.action === 'filter') {
                    this.applyFilters(data.filters.filters);
                    this.addMessage('system', '✓ Filters applied!');
                }
            } else {
                // No pre-written fallbacks - only real AI or nothing
                this.addMessage('assistant', 'AI service is not currently available. For local testing with real AI, run: ./setup-ai.sh');
            }
                let answer = '';
                let filters = null;
                
                // Category 5 questions
                if (queryLower.includes('category 5') || queryLower.includes('cat 5')) {
                    if (queryLower.includes('east coast') || queryLower.includes('eastern')) {
                        answer = `In the last 50 years (1974-2024), only one Category 5 hurricane made landfall on Florida's east coast at that intensity:

**Hurricane Andrew (1992)** - The only Category 5 to make direct landfall on Florida's east coast in modern times. It struck Homestead/Florida City area on August 24, 1992, with 165 mph winds, causing $27 billion in damage and 65 deaths.

Two other Category 5 storms affected Florida's east coast but had weakened before reaching the state:
• **Hurricane Matthew (2016)** - Was Category 5 in the Caribbean but paralleled Florida's east coast as a Category 3-4, causing significant coastal damage
• **Hurricane Dorian (2019)** - Stalled over the Bahamas as Category 5 but stayed 90+ miles offshore of Florida

Most Category 5 hurricanes weaken before Florida landfall due to cooler shelf waters, increased wind shear, and eye wall replacement cycles.`;
                        filters = { category: 5, yearStart: 1974, yearEnd: 2024 };
                    } else {
                        answer = `Category 5 Atlantic hurricanes are rare but devastating. In total, 42 Atlantic storms have reached Category 5 intensity since records began in 1851.

Notable Category 5 hurricanes affecting the United States:
• **Labor Day Hurricane (1935)** - Florida Keys
• **Camille (1969)** - Mississippi  
• **Andrew (1992)** - South Florida (only Cat 5 to hit FL east coast)
• **Michael (2018)** - Florida Panhandle

The 2024 season saw Milton reach Category 5 in the Gulf of Mexico with 180 mph winds before weakening to Category 3 at landfall near Sarasota.`;
                        filters = { category: 5 };
                    }
                }
                // 2024 season questions
                else if (queryLower.includes('2024') || queryLower.includes('helene') || queryLower.includes('milton')) {
                    answer = `The 2024 Atlantic hurricane season was particularly devastating for Florida's western coast:

**Hurricane Helene (September 26, 2024)** - Category 4
• Landfall: Big Bend area, Florida
• Peak winds: 140 mph at landfall
• Storm surge: 15+ feet from Big Bend to Tampa Bay
• Deaths: 230+ across Southeast US, 17 in Florida
• First major hurricane in Big Bend since Idalia (2023)

**Hurricane Milton (October 9, 2024)** - Category 3
• Landfall: Siesta Key near Sarasota
• Peak intensity: 180 mph (Cat 5) in Gulf of Mexico
• Storm surge: 8-12 feet Tampa Bay to Fort Myers
• Deaths: 24, with massive tornado outbreak
• Most significant Tampa Bay threat since 1921

Together, these storms caused billions in damage and marked the most active season for western Florida since 2004.`;
                    filters = { yearStart: 2024, yearEnd: 2024 };
                }
                // Peak season timing
                else if (queryLower.includes('when') && (queryLower.includes('peak') || queryLower.includes('season'))) {
                    answer = `Atlantic hurricane season officially runs from June 1 to November 30, but the timing varies by location:

**Peak Season by Region:**
• **Florida Overall**: August through October
• **West Florida/Gulf Coast**: September-October (peak: late September)
• **East Florida/Atlantic Coast**: August-September (peak: early September)
• **Florida Keys**: September-October

**Historical Pattern:**
• 50% of all hurricanes occur in September
• 90% occur August through October
• Cape Verde storms (long-track) peak in September
• Gulf storms can form rapidly even in October-November

The 2024 season followed this pattern with Helene (September 26) and Milton (October 9) both striking during the traditional peak period for western Florida.`;
                    filters = { monthStart: 8, monthEnd: 10 };
                }
                // Tampa Bay vulnerability
                else if (queryLower.includes('tampa') && queryLower.includes('vulnerab')) {
                    answer = `Tampa Bay is considered one of the most hurricane-vulnerable metropolitan areas in the United States:

**Geographic Vulnerabilities:**
• **Lucky Century**: No direct major hurricane hit since 1921 (103 years)
• **Shallow Continental Shelf**: Amplifies storm surge heights significantly
• **Bay Configuration**: Funnel shape concentrates surge water
• **Low Elevation**: Much of the area sits at or near sea level
• **Perpendicular Coast**: Orientation to typical storm tracks

**Population Risk:**
• 3+ million people in metro area (massive growth since last major hit)
• Extensive coastal development built during the "lucky" period
• Limited evacuation routes for barrier islands
• Many residents lack hurricane experience

**2024 Near-Misses:**
• Hurricane Helene brought 15-foot surge despite passing 100 miles west
• Hurricane Milton threatened direct hit before wobbling south to Sarasota
• Both storms demonstrated the catastrophic potential for the region`;
                }
                // Georgia hurricane questions
                else if (queryLower.includes('georgia') && (queryLower.includes('category 5') || queryLower.includes('cat 5'))) {
                    answer = `**No Category 5 hurricanes have ever made landfall in Georgia.**

Georgia has been fortunate in avoiding Category 5 landfalls. The state's hurricane history includes:

**Strongest hurricanes to hit Georgia:**
• **Hurricane Michael (2018)** - Entered Georgia as Category 3 after Cat 5 landfall in Florida Panhandle
• **Sea Islands Hurricane (1893)** - Estimated Category 3, killed 1,000-2,000 people
• **Hurricane David (1979)** - Category 2 at Georgia landfall

**Why Georgia avoids Category 5 landfalls:**
• Geographic position - storms often weaken crossing Florida first
• Continental shelf waters cooler than Gulf
• Storms typically curve northward before reaching Georgia
• Most Cat 5s weaken significantly before reaching this latitude

The closest Georgia came to a Category 5 impact was Hurricane Michael (2018), which was still a major hurricane (Category 3) when it crossed into Georgia from Florida.`;
                    filters = { landfallState: 'GA', category: 5 };
                }
                // General hurricane questions
                else {
                    answer = `I can help you explore the HURDAT2 database containing 1,991 Atlantic storms from 1851-2024. 

Some topics I can assist with:
• Specific storms (like Hurricane Andrew or the 2024 season)
• Category analysis (Category 5 hurricanes, major hurricanes)
• Regional impacts (Florida, Gulf Coast, specific cities)
• Historical patterns and trends
• Storm timing and peak seasons

What specific aspect of hurricane history would you like to explore?`;
                }
                
                this.addMessage('assistant', answer);
                
                // Apply filters if we have them
                if (filters) {
                    this.applyFilters(filters);
                    this.addMessage('system', '✓ Filters applied to the database view!');
                }
            } else {
                // Worker gave a good response
                this.addMessage('assistant', data.answer);
                
                // Apply filters if suggested
                if (data.filters && data.filters.action === 'filter') {
                    this.applyFilters(data.filters.filters);
                    this.addMessage('system', '✓ Filters applied to the database view!');
                }
            }

        } catch (error) {
            console.error('Error in AI assistant:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', 'I can help you explore hurricane data. Try asking about specific storms, categories, or years. For example: "What Category 5 hurricanes hit Florida\'s east coast?"');
        } finally {
            sendBtn.disabled = false;
        }
    }

    extractFilters(query) {
        const queryLower = query.toLowerCase();
        let filters = null;
        
        if (queryLower.includes('category 5') || queryLower.includes('cat 5')) {
            filters = { 
                action: 'filter',
                filters: { 
                    category: 5,
                    yearStart: queryLower.includes('last 50') ? 1974 : 1851,
                    yearEnd: 2024
                }
            };
        } else if (queryLower.includes('2024')) {
            filters = {
                action: 'filter', 
                filters: { yearStart: 2024, yearEnd: 2024 }
            };
        } else if (queryLower.includes('andrew')) {
            filters = {
                action: 'filter',
                filters: { search: 'Andrew', yearStart: 1992, yearEnd: 1992 }
            };
        }
        
        return filters;
    }
    
    getCurrentContext() {
        // Get current filter state from the dashboard
        const context = {
            activeTab: document.querySelector('.tab-content.active')?.id || 'unknown',
            appliedFilters: {}
        };

        // Try to get filter values if they exist
        try {
            const startYear = document.getElementById('start-year')?.value;
            const endYear = document.getElementById('end-year')?.value;
            const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                .map(cb => cb.value);
            
            if (startYear) context.appliedFilters.startYear = startYear;
            if (endYear) context.appliedFilters.endYear = endYear;
            if (selectedCategories.length > 0) context.appliedFilters.categories = selectedCategories;
        } catch (e) {
            console.log('Could not get filter context:', e);
        }

        return JSON.stringify(context);
    }

    applyFilters(filters) {
        // Apply filters to all views
        console.log('Applying AI-suggested filters:', filters);

        // Get current active tab
        const alpineComponent = document.querySelector('[x-data]').__x.$data;
        const activeTab = alpineComponent?.activeTab;

        // Send message to Timeline iframe
        const timelineFrame = document.querySelector('iframe[src*="enhanced-timeline"]');
        if (timelineFrame) {
            timelineFrame.contentWindow.postMessage({
                action: 'applyFilters',
                filters: filters
            }, '*');
        }

        // Send message to Regional/Multi-State iframe
        const regionalFrame = document.querySelector('iframe[src*="enhanced-multi-state"]');
        if (regionalFrame) {
            regionalFrame.contentWindow.postMessage({
                action: 'applyFilters',
                filters: filters
            }, '*');
        }

        // Send message to Database iframe
        const databaseFrame = document.querySelector('iframe[src*="enhanced-database"]');
        if (databaseFrame) {
            databaseFrame.contentWindow.postMessage({
                action: 'applyFilters',
                filters: filters
            }, '*');
            
            // If Database tab is active, switch to it or refresh it
            if (activeTab === 'database') {
                console.log('Database tab is active, filters will be applied');
            }
        }

        // Also try to apply to the active Alpine.js component if in main window
        if (window.Alpine && window.Alpine.store) {
            const store = window.Alpine.store('stormFilters');
            if (store) {
                if (filters.yearStart) store.yearStart = filters.yearStart;
                if (filters.yearEnd) store.yearEnd = filters.yearEnd;
                if (filters.search) store.searchTerm = filters.search;
                if (filters.categories) store.selectedCategories = filters.categories;
                if (filters.category !== undefined) {
                    store.selectedCategories = [filters.category.toString()];
                }
            }
        }

        // Update the main app filters if hurricaneApp is available
        if (alpineComponent && alpineComponent.filters) {
            if (filters.yearStart) alpineComponent.filters.yearStart = filters.yearStart;
            if (filters.yearEnd) alpineComponent.filters.yearEnd = filters.yearEnd;
            if (filters.search) alpineComponent.filters.search = filters.search;
            if (filters.categories) alpineComponent.filters.categories = filters.categories;
            if (filters.category !== undefined) {
                alpineComponent.filters.categories = [filters.category.toString()];
            }
        }
    }
}

// Initialize the AI Assistant when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiAssistant = new AIAssistant();
    });
} else {
    window.aiAssistant = new AIAssistant();
}