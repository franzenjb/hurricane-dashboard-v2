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
          content: `Answer this hurricane question: ${query}`
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