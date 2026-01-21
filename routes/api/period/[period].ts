import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const period = Number.parseInt(ctx.params.period || "");
      if (Number.isNaN(period)) {
        return new Response("404 File Not Found", { status: 404 });
      }

      const path = Deno.cwd() + `/data/periods/${ctx.params.period}.json`;

      try {
        await Deno.stat(path);
      } catch {
        return new Response("404 File Not Found", { status: 404 });
      }

      const decoder = new TextDecoder("utf-8");
      const blocks = await Deno.readFile(path);
      return new Response(decoder.decode(blocks), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.log(error);
      return new Response("Unknown error", { status: 500 });
    }
  },
};
