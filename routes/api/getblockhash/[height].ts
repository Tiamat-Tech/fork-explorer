import { Handlers } from "$fresh/server.ts";
import { getblockhash } from "../../../lib/jsonrpc/index.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    if (!ctx.params.height) {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          reason: "Missing param height",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const blockhash = await getblockhash(Number.parseInt(ctx.params.height));
    return new Response(JSON.stringify(blockhash), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
