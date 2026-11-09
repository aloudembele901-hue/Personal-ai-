const SYSTEM_PROMPT = `You are PERSONAL AI, a thoughtful personal assistant.
Help the user learn, reason, plan, create, and build useful things.
Be clear, honest, practical, and supportive. Do not pretend to have performed actions you have not performed.
When a request is complex, break it into manageable steps. Encourage critical thinking rather than simply giving answers.
Do not claim to access the user's phone, files, accounts, camera, or private data unless the user explicitly provides that information.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Simple health check used by the dashboard.
    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "PERSONAL AI" });
    }

    // AI chat endpoint.
    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!env.AI) {
        return json({ error: "The Cloudflare AI binding is missing. Check wrangler.jsonc." }, 500);
      }

      try {
        const body = await request.json();
        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message) return json({ error: "Please enter a message." }, 400);
        if (message.length > 4000) return json({ error: "Please keep each message under 4,000 characters." }, 400);

        const result = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message }
          ],
          max_tokens: 700,
          chat_template_kwargs: { enable_thinking: false }
        });

        const reply = result?.response || result?.choices?.[0]?.message?.content || result?.output_text || "I could not create a response. Please try again.";
        return json({ reply });
      } catch (error) {
        return json({ error: "AI request failed: " + (error?.message || "unknown error") }, 500);
      }
    }

    // Serve the website for all other paths.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("PERSONAL AI assets are not configured.", { status: 500 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

