// Simple Node.js backend for secure AI calls
// Run this locally: node ai-backend.js

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Get API key from environment variable
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
    console.error('⚠️  Please set ANTHROPIC_API_KEY environment variable');
    console.log('Run: export ANTHROPIC_API_KEY=sk-ant-api-...');
    process.exit(1);
}

app.post('/api/hurricane-ai', async (req, res) => {
    const { query } = req.body;
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 600,
                messages: [{
                    role: 'user',
                    content: `You are a hurricane expert with the HURDAT2 database (1,991 storms, 1851-2024).
                    
Key facts: Andrew (1992) only Cat 5 to hit FL east coast. Matthew (2016) and Dorian (2019) were Cat 5 but weakened. Michael (2018) Cat 5 in Panhandle. 2024: Helene Cat 4 Big Bend, Milton Cat 3 Sarasota.

Answer this hurricane question: ${query}`
                }]
            })
        });
        
        const data = await response.json();
        
        // Extract filters based on query
        let filters = null;
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('category 5') || queryLower.includes('cat 5')) {
            filters = { 
                category: 5,
                yearStart: queryLower.includes('last 50') ? 1974 : 1851,
                yearEnd: 2024
            };
        } else if (queryLower.includes('2024')) {
            filters = { yearStart: 2024, yearEnd: 2024 };
        }
        
        res.json({
            answer: data.content?.[0]?.text || 'Unable to process request',
            filters: filters ? { action: 'filter', filters } : null
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Failed to process request',
            answer: 'I encountered an error. Please try again.' 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ AI Backend running on http://localhost:${PORT}`);
    console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/hurricane-ai`);
    console.log(`🔑 Using API key: ${ANTHROPIC_API_KEY.substring(0, 20)}...`);
});

/*
HOW TO RUN:

1. Install dependencies (one time):
   npm install express cors

2. Set your API key:
   export ANTHROPIC_API_KEY=sk-ant-api-...

3. Run the server:
   node ai-backend.js

4. Update ai-assistant-component.js to use this endpoint:
   Change line ~490 from:
   this.workerUrl = 'https://hurricane-ai-simple.jbf-395.workers.dev/';
   To:
   this.workerUrl = 'http://localhost:3001/api/hurricane-ai';
*/