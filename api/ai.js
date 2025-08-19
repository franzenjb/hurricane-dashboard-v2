// Vercel Serverless Function (NOT Edge) - This WILL work
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    // Get API key from Vercel environment variable
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        answer: 'API key not configured. Set ANTHROPIC_API_KEY in Vercel dashboard.',
        debug: 'No key found'
      });
    }

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
    
    return res.status(200).json({
      answer: data.content?.[0]?.text || 'Unable to process'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: error.message,
      answer: 'AI service error'
    });
  }
}