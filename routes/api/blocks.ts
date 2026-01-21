import { Handlers } from "$fresh/server.ts";
import { getBlocks } from "../../lib/blocks/index.ts";

export const handler: Handlers = {
  GET(_req, _ctx) {
    const blocks = getBlocks();
    return new Response(JSON.stringify(blocks), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
