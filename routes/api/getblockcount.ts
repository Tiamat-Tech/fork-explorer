import { Handlers } from "$fresh/server.ts";
import { getblockcount } from "../../lib/jsonrpc/index.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const blockCount = await getblockcount();
    return new Response(JSON.stringify(blockCount), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
