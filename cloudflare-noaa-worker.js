// Cloudflare Worker - NOAA Hurricane Data Proxy
// This worker fetches NOAA hurricane data and adds CORS headers
// Deploy this to Cloudflare Workers to bypass CORS restrictions

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get the requested endpoint
      const endpoint = url.searchParams.get('endpoint');
      let noaaUrl;
      let contentType = 'application/json';

      switch(endpoint) {
        case 'storms':
          // Current active storms in JSON format
          noaaUrl = 'https://www.nhc.noaa.gov/CurrentStorms.json';
          break;
          
        case 'outlook':
          // Atlantic tropical weather outlook RSS feed
          noaaUrl = 'https://www.nhc.noaa.gov/rss_update.xml';
          contentType = 'application/xml';
          break;
          
        case 'gtwo':
          // Graphical Tropical Weather Outlook
          noaaUrl = 'https://www.nhc.noaa.gov/xgtwo/two_atl_0d0.xml';
          contentType = 'application/xml';
          break;
          
        case 'discussion':
          // Latest tropical weather discussion
          noaaUrl = 'https://www.nhc.noaa.gov/xml/MIATWOAT.xml';
          contentType = 'application/xml';
          break;
          
        default:
          return new Response(JSON.stringify({ 
            error: 'Invalid endpoint. Valid endpoints: storms, outlook, gtwo, discussion' 
          }), { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      console.log(`Fetching NOAA data from: ${noaaUrl}`);

      // Fetch from NOAA with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(noaaUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Hurricane-Dashboard-V2/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NOAA returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();

      // For JSON endpoints, validate the JSON
      if (endpoint === 'storms') {
        try {
          JSON.parse(data); // Validate JSON
        } catch (e) {
          throw new Error('Invalid JSON from NOAA');
        }
      }

      // Return the data with CORS headers and caching
      return new Response(data, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'X-Data-Source': 'NOAA',
          'X-Fetched-At': new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      // Return error response
      return new Response(JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: error.name === 'AbortError' ? 504 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
  }
};