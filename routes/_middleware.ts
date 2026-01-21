import { FreshContext } from "$fresh/server.ts";
import { bootstrapBlocks, getBlocks } from "../lib/blocks/index.ts";

let bootstrapped = false;
let bootstrapping = false;

export async function handler(req: Request, ctx: FreshContext) {
  // Ensure blocks are bootstrapped (only once)
  if (!bootstrapped && !bootstrapping) {
    bootstrapping = true;
    try {
      const blocks = getBlocks();
      if (blocks.length === 0) {
        await bootstrapBlocks();
      }
      bootstrapped = true;
    } catch (e) {
      console.error("Failed to bootstrap blocks:", e);
    }
    bootstrapping = false;
  }

  // Wait for bootstrap to complete if it's in progress
  while (bootstrapping) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return ctx.next();
}
