// AI Hurricane Assistant Component
// Provides intelligent hurricane data queries and automatic filter application

class AIAssistant {
    constructor() {
        this.workerUrl = 'https://hurricane-ai-simple.jbf-395.workers.dev/';
        this.isOpen = false;
        this.messages = [];
        this.init();
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

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to worker
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    context: this.getCurrentContext()
                })
            });

            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();

            // Add assistant response
            if (data.answer) {
                this.addMessage('assistant', data.answer);
            } else {
                this.addMessage('assistant', 'I found some relevant hurricane data for you. Please check the timeline view for details.');
            }

            // Apply filters if suggested
            if (data.filters && data.filters.action === 'filter') {
                this.applyFilters(data.filters.filters);
                this.addMessage('system', '✓ Filters applied to the timeline view!');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', 'I apologize, but I\'m having trouble connecting to the AI service. Please try again or use the manual filters to explore the hurricane data.');
        } finally {
            sendBtn.disabled = false;
        }
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