// CloudFlare Worker for Hurricane AI Assistant
// Deploy this to CloudFlare Workers to handle AI requests

export default {
  async fetch(request, env) {
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    try {
      const { question, context } = await request.json();

      // Call OpenAI API (or CloudFlare AI)
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}` // Set in CloudFlare dashboard
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a hurricane data assistant. You help users understand hurricane data and can suggest filters to apply.
              
              Current context: ${context || 'No specific context'}
              
              If the user asks to see specific hurricanes, respond with both:
              1. A text answer
              2. A JSON object with filters to apply, like:
              {
                "action": "filter",
                "filters": {
                  "category": 5,
                  "yearStart": 2000,
                  "yearEnd": 2024,
                  "state": "FL"
                }
              }`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await openAIResponse.json();
      
      // Extract the response
      const aiResponse = data.choices[0].message.content;
      
      // Try to parse any JSON filters from the response
      let filters = null;
      const jsonMatch = aiResponse.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          filters = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      return new Response(JSON.stringify({
        answer: aiResponse.replace(/\{[\s\S]*"action"[\s\S]*\}/, '').trim(),
        filters: filters
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/* 
DEPLOYMENT INSTRUCTIONS:

1. Create a CloudFlare account at https://cloudflare.com
2. Go to Workers & Pages
3. Create a new Worker
4. Paste this code
5. Go to Settings > Variables
6. Add environment variable: OPENAI_API_KEY = your-api-key
7. Deploy and copy the worker URL

Alternative: Use CloudFlare AI instead of OpenAI:

const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
  messages: [
    { role: 'system', content: 'You are a hurricane data assistant...' },
    { role: 'user', content: question }
  ]
});

This uses CloudFlare's built-in AI models (free tier available)
*/