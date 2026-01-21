import { Handlers } from "$fresh/server.ts";
import { getblockchaininfo } from "../../lib/jsonrpc/index.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const info = await getblockchaininfo();
    console.log(info);
    return new Response(JSON.stringify(info), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
