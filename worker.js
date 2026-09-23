export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ai-test") {
      const response = await env.AI.run(
        "@cf/meta/llama-3.2-1b-instruct",
        {
          messages: [
            {
              role: "user",
              content: "Hello. Introduce yourself as my Personal AI."
            }
          ]
        }
      );

      return new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
