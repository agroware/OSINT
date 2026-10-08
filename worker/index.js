// worker/index.js
export default {
  async fetch(request, env, ctx) {
    // CORS headers to allow your GitHub Pages site to talk to this Worker
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // In production, replace * with your GitHub Pages URL
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    // The path after /api/ is used to determine the target API
    const targetEndpoint = url.pathname.replace("/api/", "");
    
    // --- Choose your real API here ---
    // Example 1: Steam Web API (requires a free API key)
    // const API_BASE_URL = `https://api.steampowered.com/`;
    // const API_KEY = env.STEAM_API_KEY; 
    // const targetUrl = `${API_BASE_URL}${targetEndpoint}?key=${API_KEY}&${url.searchParams.toString()}`;

    // Example 2: Have I Been Pwned (requires a paid API key for email search)
    // const API_BASE_URL = `https://haveibeenpwned.com/api/v3/`;
    // const API_KEY = env.HIBP_API_KEY;
    // const targetUrl = `${API_BASE_URL}${targetEndpoint}`;
    
    // Example 3: A free, no-key API for testing (e.g., SteamGPT or a public mock)
    // For a demo, you can point to a public API or a mock service.
    const targetUrl = `https://api.example.com/${targetEndpoint}`; // Replace with a real API

    try {
      const apiResponse = await fetch(targetUrl, {
        method: request.method,
        headers: {
          // Forward necessary headers
          "Accept": "application/json",
        },
      });

      const data = await apiResponse.json();

      return new Response(JSON.stringify(data), {
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Proxy request failed" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  },
};
