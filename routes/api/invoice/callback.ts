import { Handlers } from "$fresh/server.ts";
import { encodeBase64 } from "$std/encoding/base64.ts";
import config from "../../../lib/config.ts";
import { bytesToHexString } from "../../../shared/utils.ts";

interface LnurlPayComment {
  paymentRequest: string;
  comment: string;
}

const lnurlPayComments: LnurlPayComment[] = JSON.parse(
  (await Deno.readTextFile("./lnurlpay.json")) || "[]",
);
// Simple SHA256 hash for description_hash
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return encodeBase64(new Uint8Array(hashBuffer));
}

export const handler: Handlers = {
  async GET(req, _ctx) {
    if (!config.donation) {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          reason: "Donation is not configured",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const responseMetadata = JSON.stringify([[
      "text/plain",
      config.donation.description,
    ]]);

    const url = new URL(req.url);
    const amountString = url.searchParams.get("amount");
    if (amountString === null) {
      return new Response(
        JSON.stringify({
          status: "ERROR",
          reason: "Missing amount parameter",
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const amount = Number.parseInt(amountString);

    const descriptionHash = await sha256(responseMetadata);

    const addInvoicePayload = JSON.stringify({
      value_msat: amount,
      memo: config.donation.description,
      description_hash: descriptionHash,
    });

    const macaroonBytes = await Deno.readFile(config.donation.data.macaroon);
    const macaroonHeader = bytesToHexString(macaroonBytes);

    const command = new Deno.Command("curl", {
      args: [
        "-X",
        "POST",
        "--cacert",
        config.donation.data.cert,
        "--header",
        `Grpc-Metadata-macaroon: ${macaroonHeader}`,
        "--data-binary",
        addInvoicePayload,
        `${config.donation.data.server}/v1/invoices`,
      ],
      stdout: "piped",
    });

    const result = await command.output();
    const output = new TextDecoder().decode(result.stdout);
    const paymentRequest = JSON.parse(output).payment_request;

    const comment = url.searchParams.get("comment");
    if (comment) {
      try {
        const lnurlPay: LnurlPayComment = {
          paymentRequest,
          comment,
        };
        lnurlPayComments.push(lnurlPay);
        await Deno.writeTextFile(
          "./lnurlpay.json",
          JSON.stringify(lnurlPayComments, null, 2),
        );
      } catch (e) {
        console.log(e);
      }
    }

    return new Response(
      JSON.stringify({
        pr: paymentRequest,
        successAction: {
          tag: "message",
          message: "Cheers!",
        },
        disposable: true,
        routes: [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};
