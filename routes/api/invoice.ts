import { Handlers } from "$fresh/server.ts";
import config from "../../lib/config.ts";

const responseMetadata = JSON.stringify([["text/plain", "Donation to taproot.watch"]]);

export const handler: Handlers = {
  GET(_req, _ctx) {
    if (!config.donation) {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          reason: "Donation is not configured",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        tag: "payRequest",
        callback: `${config.donation.lnurlPayUrl}/callback`,
        maxSendable: 1_000_000 * 1000,
        minSendable: 1000,
        metadata: responseMetadata,
        commentAllowed: 256,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
