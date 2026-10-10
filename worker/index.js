export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const q = url.searchParams.get("q")
           || url.searchParams.get("email")
           || url.searchParams.get("id");

    try {
      let data;

      // STEAM (SteamGPT — free, no key)
      if (path === "/steam") {
        const r = await fetch(`https://steamgpt.net/profile/${encodeURIComponent(q)}`);
        data = await r.json();
      }

      // HUDSONROCK (free, no key)
      else if (path === "/hudsonrock") {
        const r = await fetch(
          `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=${encodeURIComponent(q)}`
        );
        data = await r.json();
      }

      // GRAVATAR (free, no key)
      else if (path === "/gravatar") {
        const msgBuffer = new TextEncoder().encode(q.trim().toLowerCase());
        const shaBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const shaHash = [...new Uint8Array(shaBuffer)]
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
        const r = await fetch(`https://gravatar.com/${shaHash}.json`);
        if (r.status === 404) {
          data = { error: "No Gravatar profile" };
        } else {
          const profile = await r.json();
          data = profile.entry?.[0] || { error: "No profile" };
        }
      }

      // DISCORD (needs DISCORD_BOT_TOKEN secret)
      else if (path === "/discord") {
        if (!env.DISCORD_BOT_TOKEN) {
          return new Response(
            JSON.stringify({ error: "Discord bot token not configured" }),
            { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        const r = await fetch(
          `https://discord.com/api/v10/users/${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } }
        );
        data = await r.json();
      }

      else {
        data = { error: "Unknown route: " + path };
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
