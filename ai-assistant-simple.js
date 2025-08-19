// SIMPLIFIED AI Assistant - ONLY Real AI, No Fallbacks
// Replace ai-assistant-component.js sendMessage function with this

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
        // Try Vercel API (production)
        let response = await fetch('https://hurricane-dashboard-v2.vercel.app/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            // Try local backend as fallback
            response = await fetch('http://localhost:3001/api/hurricane-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
        }

        const data = await response.json();
        this.hideTypingIndicator();
        
        // Show AI response
        this.addMessage('assistant', data.answer || 'Unable to get response from AI service.');
        
        // Apply filters if provided
        if (data.filters) {
            this.applyFilters(data.filters);
            this.addMessage('system', '✓ Filters applied!');
        }

    } catch (error) {
        console.error('AI Error:', error);
        this.hideTypingIndicator();
        this.addMessage('assistant', 'AI service is not available. Please ensure the backend is running.');
    } finally {
        sendBtn.disabled = false;
    }
}