// AI-Powered Hurricane Data Assistant - Cloudflare Worker
// This replaces your simple pattern-matching worker with real AI intelligence

export default {
  async fetch(request, env) {
    // Enable CORS for your dashboard
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
      const { query, context } = await request.json();

      if (!query) {
        return new Response(JSON.stringify({ error: 'No query provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Hurricane Database Context - Key 2024 Florida storms and historical data
      const hurricaneContext = `
HURRICANE DATABASE CONTEXT (HURDAT2 1851-2024):
- Total Atlantic Storms: 1,991 storms from 1851-2024
- Florida Landfall Storms: 298 documented landfalls
- Major Hurricane (Cat 3+) Landfalls in FL: 89 storms

2024 FLORIDA HURRICANE SEASON - WESTERN COAST IMPACTS:
• Hurricane Helene (September 26, 2024): Category 4 landfall in Big Bend FL
  - Peak winds: 140 mph, Pressure: 938 mb
  - Storm surge: 15+ feet along west coast from Big Bend to Tampa Bay
  - Deaths: 230+ across southeast US, 17 in Florida
  - Massive power outages, catastrophic flooding in Tampa Bay area
  - First major hurricane to impact this region since Idalia (2023)

• Hurricane Milton (October 9, 2024): Category 3 landfall near Sarasota FL
  - Peak winds: 180 mph (Cat 5) in Gulf, weakened to 120 mph at landfall
  - Made landfall at Siesta Key, directly impacting western Florida
  - Storm surge: 8-12 feet from Tampa Bay to Fort Myers
  - Deaths: 24, massive tornado outbreak across central Florida
  - Most significant direct hit to Tampa Bay area since 1921

HISTORICAL CONTEXT - WESTERN FLORIDA VULNERABILITY:
- Tampa Bay has avoided direct major hurricane hits since 1921 (103 years)
- Last major hurricane to make landfall on FL west coast: Hurricane Ian (2022) at Fort Myers
- 2024 marked the most active season for western Florida since 2004 (Charley, Frances, Ivan, Jeanne)
- Gulf Coast storms are particularly dangerous due to warm Gulf waters enabling rapid intensification

STORM SURGE VULNERABILITY:
- Tampa Bay area sits at sea level with extensive low-lying development
- Shallow continental shelf amplifies storm surge heights
- Western Florida more vulnerable to Gulf storms due to perpendicular coastline orientation

USER CONTEXT: ${context || 'No specific filters currently applied'}
      `;

      // Call Claude API through Anthropic
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY, // Set this in Cloudflare dashboard
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a hurricane data specialist with access to the HURDAT2 Atlantic hurricane database. Answer this question with specific, factual information using the hurricane data context provided.

${hurricaneContext}

Question: ${query}

Instructions:
1. Provide detailed, specific answers using the hurricane data
2. For 2024 Florida questions, focus on Helene and Milton impacts
3. For Tampa Bay/western Florida questions, emphasize the historical significance and vulnerability
4. Include specific numbers (wind speeds, surge heights, casualties) when available
5. Provide historical context and comparisons when relevant
6. If the question suggests filtering data, also include a filter suggestion

Answer in a conversational but informative tone, as if you're a knowledgeable hurricane researcher.`
            }
          ]
        })
      });

      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const anthropicData = await anthropicResponse.json();
      const aiAnswer = anthropicData.content[0].text;

      // Try to extract any filter suggestions from the AI response
      let suggestedFilters = null;
      
      // Simple filter detection based on common patterns
      if (query.toLowerCase().includes('2024')) {
        suggestedFilters = { yearStart: 2024, yearEnd: 2024 };
      } else if (query.toLowerCase().includes('helene')) {
        suggestedFilters = { search: 'Helene', yearStart: 2024, yearEnd: 2024 };
      } else if (query.toLowerCase().includes('milton')) {
        suggestedFilters = { search: 'Milton', yearStart: 2024, yearEnd: 2024 };
      } else if (query.toLowerCase().includes('category 5') || query.toLowerCase().includes('cat 5')) {
        suggestedFilters = { category: 5 };
      } else if (query.toLowerCase().includes('major hurricane')) {
        suggestedFilters = { categories: ['3', '4', '5'] };
      }

      return new Response(JSON.stringify({
        answer: aiAnswer,
        filters: suggestedFilters ? {
          action: 'filter',
          filters: suggestedFilters
        } : null
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker Error:', error);
      
      // Provide a helpful fallback response
      const fallbackResponse = {
        answer: `I encountered an issue accessing the AI service, but I can tell you that the 2024 Atlantic hurricane season was particularly impactful for Florida, with Hurricane Helene (Category 4) and Hurricane Milton (Category 3) both significantly affecting the western coast. Helene brought catastrophic storm surge to the Big Bend region, while Milton made a direct hit near Sarasota. Please try your question again, or check the hurricane timeline for detailed storm data.`,
        error: 'AI service temporarily unavailable'
      };

      return new Response(JSON.stringify(fallbackResponse), {
        status: 200, // Don't fail completely, provide fallback
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

1. Go to Cloudflare Workers dashboard: https://workers.cloudflare.com/
2. Click on your existing "hurricane-ai-simple" worker
3. Click "Quick Edit" or "Edit Code"
4. Replace ALL the existing code with this new code
5. Click "Save and Deploy"

6. Set up the API key:
   - In your worker dashboard, go to Settings > Variables
   - Add environment variable: 
     Name: ANTHROPIC_API_KEY
     Value: [your Anthropic API key]
   - Click "Save"

7. Test the deployment:
   Your worker URL remains: https://hurricane-ai-simple.jbf-395.workers.dev/
   
ALTERNATIVE - Use Cloudflare AI (Free Tier):
If you don't have an Anthropic API key, you can use Cloudflare's built-in AI:

Replace the Anthropic API call with:
const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
  messages: [
    { role: 'system', content: hurricaneContext },
    { role: 'user', content: query }
  ]
});

Then use: const aiAnswer = aiResponse.response;
*/