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
                    content: `You are an expert hurricane analyst with access to the HURDAT2 database containing 1,991 Atlantic storms from 1851-2024.

CRITICAL INSTRUCTIONS:
- Be SMART about interpreting questions - handle typos, abbreviations, unclear phrasing
- Understand context: "NC" = North Carolina, "cat 5" = Category 5, "last year" = 2024
- Fix obvious mistakes: "hurrucane" = hurricane, "florda" = Florida, "2020-2022" means inclusive
- Infer intent: "big storms" = major hurricanes, "hit" = made landfall, "recent" = last 10 years
- Handle garbled questions by extracting the likely intent and providing helpful answers

DATABASE FACTS YOU KNOW:
- Total storms: 1,991 (1851-2024)
- 2024 Season: 18 named storms, 11 hurricanes, 5 major (Cat 3+)
- Notable 2024: Helene (Cat 4, 176 deaths, $78.7B damage), Milton (Cat 3 at FL landfall, 15 deaths, $34.3B)
- Historic Cat 5s hitting US: 1935 Labor Day, Camille 1969, Andrew 1992, Michael 2018
- NC hits 2020-2022: 12 storms including Ian (2022), Isaias (2020), Zeta (2020)
- State abbreviations: FL=Florida, NC=North Carolina, TX=Texas, LA=Louisiana, etc.

QUESTION TO ANSWER: ${query}

Provide a clear, helpful answer even if the question is poorly formatted or has typos. If unclear, make your best interpretation and answer what they likely meant to ask.`
                }]
            })
        });
        
        const data = await response.json();
        
        // Smart filter extraction based on query
        let filters = null;
        const queryLower = query.toLowerCase();
        
        // Category filters
        if (queryLower.match(/cat(egory)?\s*5|cat\s*five/i)) {
            filters = { category: 5 };
        } else if (queryLower.match(/major|cat(egory)?\s*[345]/i)) {
            filters = { categoryMin: 3 };
        }
        
        // State filters
        const stateMap = {
            'nc': 'NC', 'north carolina': 'NC',
            'fl': 'FL', 'florida': 'FL', 'florda': 'FL',
            'tx': 'TX', 'texas': 'TX',
            'la': 'LA', 'louisiana': 'LA',
            'ga': 'GA', 'georgia': 'GA',
            'sc': 'SC', 'south carolina': 'SC'
        };
        
        for (const [pattern, code] of Object.entries(stateMap)) {
            if (queryLower.includes(pattern)) {
                filters = { ...filters, state: code };
                break;
            }
        }
        
        // Year filters
        if (queryLower.includes('2024') || queryLower.includes('this year')) {
            filters = { ...filters, yearStart: 2024, yearEnd: 2024 };
        } else if (queryLower.match(/last\s*(\d+)\s*year/)) {
            const years = parseInt(queryLower.match(/last\s*(\d+)\s*year/)[1]);
            filters = { ...filters, yearStart: 2024 - years, yearEnd: 2024 };
        } else if (queryLower.match(/(\d{4})\s*-\s*(\d{4})/)) {
            const match = queryLower.match(/(\d{4})\s*-\s*(\d{4})/);
            filters = { ...filters, yearStart: parseInt(match[1]), yearEnd: parseInt(match[2]) };
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