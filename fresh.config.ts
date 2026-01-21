import { defineConfig } from "$fresh/server.ts";
import config from "./lib/config.ts";

export default defineConfig({
  server: {
    port: config.server.port,
    hostname: config.server.host,
  },
});
