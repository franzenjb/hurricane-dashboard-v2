// DEBUG VERSION - Cloudflare Worker for Hurricane AI Assistant
// This version includes extensive logging to diagnose issues

export default {
  async fetch(request, env) {
    console.log('Worker received request:', request.method, request.url);
    
    // Enable CORS for your dashboard
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // For debugging - accept both GET and POST
    if (request.method === 'GET') {
      console.log('GET request received - returning test response');
      return new Response(JSON.stringify({
        status: 'Worker is running',
        message: 'Send a POST request with {"query": "your question"} to get hurricane data',
        debug: true
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle POST requests
    if (request.method !== 'POST') {
      console.log('Invalid method:', request.method);
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        method: request.method,
        allowed: ['GET', 'POST', 'OPTIONS']
      }), { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    try {
      console.log('Processing POST request');
      
      // Parse request body
      let body;
      try {
        const text = await request.text();
        console.log('Request body text:', text);
        body = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse body:', e);
        return new Response(JSON.stringify({
          error: 'Invalid JSON in request body',
          details: e.message
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const { query, context } = body;
      console.log('Query:', query);
      console.log('Context:', context);

      if (!query) {
        return new Response(JSON.stringify({ 
          error: 'No query provided',
          received: body 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders 
          }
        });
      }

      // Check if API key exists
      const hasApiKey = !!env.ANTHROPIC_API_KEY;
      console.log('API Key configured:', hasApiKey);

      // For now, return a test response to verify the worker is functioning
      const testResponse = {
        answer: `DEBUG MODE: Worker is functioning. Query received: "${query}". API Key configured: ${hasApiKey}`,
        filters: null,
        debug: {
          method: request.method,
          hasQuery: !!query,
          hasApiKey: hasApiKey,
          timestamp: new Date().toISOString()
        }
      };

      // If this is a Category 5 question, provide the fallback answer
      if (query.toLowerCase().includes('category 5') && query.toLowerCase().includes('florida')) {
        testResponse.answer = `In the last 50 years (1974-2024), only one Category 5 hurricane made landfall on Florida's east coast at that intensity:

**Hurricane Andrew (1992)** - The only Category 5 to make direct landfall on Florida's east coast in modern times. It struck Homestead/Florida City area on August 24, 1992, with 165 mph winds, causing $27 billion in damage and 65 deaths.

Two other Category 5 storms affected Florida's east coast but had weakened before reaching the state:
- **Hurricane Matthew (2016)** - Was Category 5 in the Caribbean but paralleled Florida's east coast as a Category 3-4
- **Hurricane Dorian (2019)** - Stalled over the Bahamas as Category 5 but stayed 90+ miles offshore of Florida`;
        
        testResponse.filters = {
          action: 'filter',
          filters: {
            category: 5,
            yearStart: 1974,
            yearEnd: 2024
          }
        };
      }

      return new Response(JSON.stringify(testResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker Error:', error);
      console.error('Error stack:', error.stack);
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
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

1. Copy this ENTIRE code
2. Go to https://dash.cloudflare.com/
3. Navigate to Workers & Pages
4. Click on your "hurricane-ai-simple" worker
5. Click "Quick Edit" or "Edit Code"
6. DELETE all existing code
7. PASTE this debug code
8. Click "Save and Deploy"

TESTING:

1. Test with GET (should work):
   curl https://hurricane-ai-simple.jbf-395.workers.dev/

2. Test with POST:
   curl -X POST https://hurricane-ai-simple.jbf-395.workers.dev/ \
     -H "Content-Type: application/json" \
     -d '{"query": "test"}'

3. Check the Cloudflare dashboard logs:
   - Go to your worker
   - Click "Logs" tab
   - Start "Begin log stream"
   - Make a request
   - See what's happening

This debug version will help identify:
- If requests are reaching the worker
- What method is being used
- If the body is being parsed correctly
- If the API key is configured
*/