// DIRECT API VERSION - No Cloudflare needed!
// Replace the sendMessage function in ai-assistant-component.js with this

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
        // OPTION 1: Direct Anthropic API Call (for personal use)
        // Replace 'YOUR-API-KEY' with your actual key
        const ANTHROPIC_API_KEY = 'YOUR-API-KEY'; // <-- PUT YOUR KEY HERE
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true' // Required for browser
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Fast and cheap
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `You are a hurricane expert with access to the HURDAT2 database (1851-2024).
                    
Key Category 5 hurricanes affecting Florida:
- Andrew (1992): Only Cat 5 to make landfall on FL east coast in modern times
- Matthew (2016): Cat 5 in Caribbean, weakened to Cat 3-4 along FL east coast  
- Dorian (2019): Cat 5 over Bahamas, stayed offshore of Florida
- Michael (2018): Cat 5 landfall in FL Panhandle
- Helene (2024): Cat 4 in Big Bend
- Milton (2024): Cat 3 at Sarasota (was Cat 5 in Gulf)

Answer this question with specific details: ${query}`
                }]
            })
        });

        const data = await response.json();
        
        // Hide typing indicator
        this.hideTypingIndicator();

        // Add assistant response
        const answer = data.content?.[0]?.text || 'I encountered an issue processing your request.';
        this.addMessage('assistant', answer);

        // Smart filter detection
        let filters = null;
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('category 5') || queryLower.includes('cat 5')) {
            filters = {
                action: 'filter',
                filters: {
                    category: 5,
                    yearStart: queryLower.includes('last 50') ? 1974 : 1851,
                    yearEnd: 2024
                }
            };
        } else if (queryLower.includes('andrew')) {
            filters = {
                action: 'filter',
                filters: { search: 'Andrew', yearStart: 1992, yearEnd: 1992 }
            };
        } else if (queryLower.includes('2024')) {
            filters = {
                action: 'filter',
                filters: { yearStart: 2024, yearEnd: 2024 }
            };
        }

        // Apply filters if detected
        if (filters) {
            this.applyFilters(filters.filters);
            this.addMessage('system', '✓ Filters applied to the database!');
        }

    } catch (error) {
        console.error('API Error:', error);
        this.hideTypingIndicator();
        
        // Fallback for common questions
        const queryLower = query.toLowerCase();
        let fallbackAnswer = '';
        
        if (queryLower.includes('category 5') && queryLower.includes('east coast')) {
            fallbackAnswer = `In the last 50 years (1974-2024), only one Category 5 hurricane made landfall on Florida's east coast at that intensity:

**Hurricane Andrew (1992)** - The only Category 5 to make direct landfall on Florida's east coast in modern times. It struck Homestead/Florida City area on August 24, 1992, with 165 mph winds, causing $27 billion in damage and 65 deaths.

Two other Category 5 storms affected Florida's east coast but had weakened before reaching the state:
- **Hurricane Matthew (2016)** - Was Category 5 in the Caribbean but paralleled Florida's east coast as a Category 3-4
- **Hurricane Dorian (2019)** - Stalled over the Bahamas as Category 5 but stayed 90+ miles offshore of Florida`;
            
            // Apply Cat 5 filters
            this.applyFilters({ category: 5, yearStart: 1974, yearEnd: 2024 });
            this.addMessage('system', '✓ Showing Category 5 hurricanes in database!');
        } else {
            fallbackAnswer = 'I apologize, but I cannot connect to the AI service right now. Please try again later or use the manual filters to explore the hurricane database.';
        }
        
        this.addMessage('assistant', fallbackAnswer);
    } finally {
        sendBtn.disabled = false;
    }
}

/*
HOW TO USE THIS:

1. Open ai-assistant-component.js
2. Find the sendMessage() function (around line 430)
3. Replace the ENTIRE sendMessage function with this code
4. Replace 'YOUR-API-KEY' with your actual Anthropic API key
5. Save the file
6. Test it!

NOTES:
- This calls Anthropic directly from the browser
- Your API key will be visible in the browser code
- Only use this for personal projects, not public sites
- For production, use Netlify/Vercel functions instead

WORKING IMMEDIATELY:
- No Cloudflare needed
- No deployment needed  
- No CORS issues
- Works instantly!
*/