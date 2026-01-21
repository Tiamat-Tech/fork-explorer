import { Handlers } from "$fresh/server.ts";
import { homeTXT } from "../lib/txt/index.ts";
import { pageviewsTxt } from "../lib/pageviews/index.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    await pageviewsTxt();
    const textContent = homeTXT();
    return new Response(textContent, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
