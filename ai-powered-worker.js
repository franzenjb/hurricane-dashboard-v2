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

      // Enhanced Hurricane Database Context with Category 5 storms
      const hurricaneContext = `
HURRICANE DATABASE CONTEXT (HURDAT2 1851-2024):
- Total Atlantic Storms: 1,991 storms from 1851-2024
- Florida Landfall Storms: 298 documented landfalls
- Major Hurricane (Cat 3+) Landfalls in FL: 89 storms
- Category 5 Hurricanes Total: 42 Atlantic storms reached Cat 5 intensity

CATEGORY 5 HURRICANES AFFECTING FLORIDA (Last 50 years, 1974-2024):
EAST COAST OF FLORIDA - Category 5 storms that impacted (not necessarily landfall as Cat 5):
• Hurricane Andrew (1992): Made landfall in South Florida as Category 5
  - Landfall: Homestead/Florida City area, August 24, 1992
  - Peak winds at landfall: 165 mph
  - Only Cat 5 to make direct landfall on Florida's east coast in modern times
  - $27 billion in damage, 65 deaths

• Hurricane Matthew (2016): Cat 5 in Caribbean, weakened to Cat 3-4 along FL east coast
  - Paralleled east coast, October 6-7, 2016, never made direct landfall
  - Closest approach as Category 3 near Cape Canaveral
  - Storm surge and winds caused significant damage despite staying offshore

• Hurricane Dorian (2019): Cat 5 over Bahamas, grazed Florida's east coast
  - Stalled over Bahamas as Cat 5, September 1-2, 2019
  - Stayed 90+ miles offshore of Florida's east coast
  - Tropical storm force winds affected coast but core stayed offshore

WEST COAST OF FLORIDA - Category 5 storms:
• Hurricane Michael (2018): Cat 5 landfall in Florida Panhandle
  - Landfall near Mexico Beach, October 10, 2018
  - 160 mph winds, first Cat 5 landfall in Panhandle on record
  - 16 deaths in Florida, $25 billion damage

NOTE: Most Category 5 hurricanes weaken before Florida landfall due to:
- Cooler shelf waters
- Increased wind shear near coast
- Eye wall replacement cycles
- Land interaction

HISTORICAL PERSPECTIVE:
Only 4 hurricanes have made U.S. landfall at Category 5 intensity:
1. "Labor Day" Hurricane (1935) - Florida Keys
2. Hurricane Camille (1969) - Mississippi
3. Hurricane Andrew (1992) - South Florida
4. Hurricane Michael (2018) - Florida Panhandle

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
              content: `You are an expert hurricane researcher with access to the complete HURDAT2 Atlantic hurricane database and extensive meteorological knowledge. Answer questions with specific, accurate information.

${hurricaneContext}

Question: ${query}

Instructions:
1. ALWAYS provide a complete, direct answer to the question - never just say "check the timeline"
2. Use the database context above for specific storm information
3. For questions about specific storms or years, cite actual data from the context
4. For Category 5 questions, reference the specific storms listed in the context
5. Include relevant details: dates, wind speeds, locations, damage, deaths
6. If the question is about Florida's east coast Cat 5s, explain that only Andrew (1992) made landfall as Cat 5
7. For general hurricane questions beyond the database, use your meteorological knowledge
8. Provide context about why certain patterns occur (e.g., why Cat 5s often weaken before landfall)
9. If asked about non-hurricane topics, politely redirect to hurricane-related information

Format your response to be informative yet concise. Include specific storm names, dates, and impacts when relevant.

IMPORTANT: Give a complete answer that directly addresses the user's question with real data and information.`
            }
          ]
        })
      });

      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const anthropicData = await anthropicResponse.json();
      const aiAnswer = anthropicData.content[0].text;

      // Enhanced filter extraction based on query and response
      let suggestedFilters = null;
      const queryLower = query.toLowerCase();
      
      // Year-based filters
      if (queryLower.includes('2024')) {
        suggestedFilters = { yearStart: 2024, yearEnd: 2024 };
      } else if (queryLower.includes('last 50 years')) {
        suggestedFilters = { yearStart: 1974, yearEnd: 2024 };
      } else if (queryLower.includes('last 10 years')) {
        suggestedFilters = { yearStart: 2014, yearEnd: 2024 };
      } else if (queryLower.includes('2000s')) {
        suggestedFilters = { yearStart: 2000, yearEnd: 2009 };
      }
      
      // Storm name filters
      if (queryLower.includes('andrew')) {
        suggestedFilters = { search: 'Andrew', yearStart: 1992, yearEnd: 1992 };
      } else if (queryLower.includes('helene')) {
        suggestedFilters = { search: 'Helene', yearStart: 2024, yearEnd: 2024 };
      } else if (queryLower.includes('milton')) {
        suggestedFilters = { search: 'Milton', yearStart: 2024, yearEnd: 2024 };
      } else if (queryLower.includes('michael')) {
        suggestedFilters = { search: 'Michael', yearStart: 2018, yearEnd: 2018 };
      } else if (queryLower.includes('dorian')) {
        suggestedFilters = { search: 'Dorian', yearStart: 2019, yearEnd: 2019 };
      } else if (queryLower.includes('matthew')) {
        suggestedFilters = { search: 'Matthew', yearStart: 2016, yearEnd: 2016 };
      }
      
      // Category filters
      if (queryLower.includes('category 5') || queryLower.includes('cat 5')) {
        suggestedFilters = { category: 5, yearStart: suggestedFilters?.yearStart || 1974, yearEnd: 2024 };
      } else if (queryLower.includes('category 4') || queryLower.includes('cat 4')) {
        suggestedFilters = { category: 4 };
      } else if (queryLower.includes('major hurricane')) {
        suggestedFilters = { categories: ['3', '4', '5'] };
      }
      
      // Location-based filters (would need landfall_states in actual implementation)
      if (queryLower.includes('florida') && queryLower.includes('east coast')) {
        suggestedFilters = { ...suggestedFilters, landfallState: 'FL' };
      } else if (queryLower.includes('tampa') || queryLower.includes('west coast')) {
        suggestedFilters = { ...suggestedFilters, landfallState: 'FL' };
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
      
      // Provide intelligent fallback responses based on the query
      let fallbackAnswer = '';
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('category 5') && queryLower.includes('east coast') && queryLower.includes('florida')) {
        fallbackAnswer = `In the last 50 years (1974-2024), only one Category 5 hurricane made landfall on Florida's east coast at that intensity:

**Hurricane Andrew (1992)** - The only Category 5 to make direct landfall on Florida's east coast in modern times. It struck Homestead/Florida City area on August 24, 1992, with 165 mph winds, causing $27 billion in damage and 65 deaths.

Two other Category 5 storms affected Florida's east coast but had weakened before reaching the state:
- **Hurricane Matthew (2016)** - Was Category 5 in the Caribbean but paralleled Florida's east coast as a Category 3-4
- **Hurricane Dorian (2019)** - Stalled over the Bahamas as Category 5 but stayed 90+ miles offshore of Florida

Most Category 5 hurricanes weaken before Florida landfall due to cooler shelf waters, wind shear, and eye wall replacement cycles.`;
      } else if (queryLower.includes('2024')) {
        fallbackAnswer = `The 2024 Atlantic hurricane season was particularly devastating for Florida's western coast. Hurricane Helene made a Category 4 landfall in the Big Bend area on September 26 with 140 mph winds and catastrophic 15-foot storm surge. Hurricane Milton followed on October 9, making landfall near Sarasota as a Category 3 after reaching Category 5 intensity in the Gulf. Together, these storms caused over 250 deaths and billions in damage.`;
      } else if (queryLower.includes('tampa bay')) {
        fallbackAnswer = `Tampa Bay hasn't experienced a direct major hurricane hit since 1921 (103 years), making it increasingly vulnerable due to extensive coastal development. The 2024 season brought the closest calls in decades with Helene's surge impacts and Milton's near-miss. The area's shallow continental shelf amplifies storm surge, making it one of the most hurricane-vulnerable cities in the United States.`;
      } else {
        fallbackAnswer = `I encountered an issue accessing the full AI service, but I can tell you that the hurricane database contains 1,991 Atlantic storms from 1851-2024. The 2024 season was particularly impactful for Florida with Hurricane Helene (Category 4) and Hurricane Milton (Category 3). Please try your question again for more detailed information.`;
      }
      
      const fallbackResponse = {
        answer: fallbackAnswer,
        filters: null
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