import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const periodsDir = Deno.cwd() + "/data/periods/";

    // Check if directory exists
    try {
      await Deno.stat(periodsDir);
    } catch {
      // Directory doesn't exist, return empty array
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read period files
    const files: number[] = [];
    for await (const file of Deno.readDir(periodsDir)) {
      if (file.isFile && file.name.endsWith(".json")) {
        files.push(Number.parseInt(file.name.replace(".json", ""), 10));
      }
    }

    return new Response(JSON.stringify(files), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
