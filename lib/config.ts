import "$std/dotenv/load.ts";
import { resolve, toFileUrl } from "$std/path/mod.ts";
import type { ComponentType } from "preact";
import type { ClientConfig } from "../shared/client-config.ts";

interface CelebrateConfig {
  type: string;
  url: string;
}

interface AboutConfig {
  softfork?: ComponentType;
  method?: {
    title: string;
    content: ComponentType;
  };
}

interface SponsorConfig {
  title: string;
  url: string;
  imageUri: string;
}

// Public, instance-specific content. Implement this interface in a .tsx file
// when a deployment needs rich JSX content. Secrets still belong in .env.
export interface SiteConfig {
  fork?: {
    info?: string[];
  };
  frontend?: {
    celebrate?: CelebrateConfig;
    about?: AboutConfig;
    sponsors?: SponsorConfig[];
  };
  donation?: {
    description: string;
  };
}

interface Config {
  // Whether to load real data or fake
  mode: "real" | "fake" | "fake-frontend";

  // Configuration related to the API server
  server: {
    // The server host or listening IP
    host: string;
    // The server listening port
    port: number;
  };

  // Configuration for bitcoind's JSON-RPC server
  bitcoinRpc: {
    // Server host IP or domain.
    server: string;
    // Username credentials.
    user: string;
    // Password credentials.
    password: string;
  };

  // Information about the softfork in question should be added here.
  // Things inside here will most likely be used and shown on the webpage.
  fork: {
    // The common name of this softfork.
    name: string;
    // Information about this softfork, each array item is rendered as a paragraph.
    info: string[];
    // The BIP9 version bit as defined in the softfork's BIP.
    versionBit: number;
    // Threshold for the softfork to be locked in
    threshold: number;
    // Status of the softfork
    status: "pre" | "started" | "locked_in" | "active";
    // Block height the softfork gets activated
    activationHeight: number;
    // Show a countdown timer until the softfork is activated.
    // Only available when the `status` is `locked_in`.
    showActivationCountdown: boolean;
    // Show celebration confetti on the site
    showCelebrationConfetti: boolean;
  };

  // Configuration specifically for the frontend site
  frontend: {
    // How often to auto-refresh, in seconds. Set to null to disable
    autoRefreshInterval: number | null;
    // Twitter handle, this is for the Twitter link preview
    twitterHandle: string;
    // Celebratory video to display once lock-in is reached
    celebrate?: CelebrateConfig;
    // Content related to the About page
    about?: AboutConfig;
    // Sponsors of this project
    sponsors?: SponsorConfig[];
  };

  // Donation configuration, right now only supports lnd
  donation?: {
    // Backend type, currently only supports lnd
    type: "lnd";
    // Public description used in LNURL metadata and invoice memos.
    description: string;
    // Data for the backend
    data: {
      // REST server
      server: string;
      // Path to tls.cert
      cert: string;
      // Path to invoice.macaroon
      macaroon: string;
      // Lightning Node URI <pubkey>@<ip:port>
      lightningNodeUri?: string;
    };
    // URL to the LNURL-pay endpoint
    lnurlPayUrl: string;
  };
}

function parseAutoRefreshInterval(value: string | undefined): number | null {
  if (value?.toLowerCase() === "null") {
    return null;
  }

  return Number.parseInt(value ?? "120", 10);
}

async function loadSiteConfig(): Promise<SiteConfig> {
  const configPath = Deno.env.get("SITE_CONFIG") || "config/config.tsx";

  let module;
  try {
    module = await import(toFileUrl(resolve(configPath)).href);
  } catch (error) {
    throw new Error(
      `Unable to load site config at ${configPath}. Copy config/config.example.tsx to config/config.tsx or set SITE_CONFIG to another path.`,
      { cause: error },
    );
  }

  if (!module.default || typeof module.default !== "object") {
    throw new Error(`${configPath} must have a default SiteConfig export`);
  }

  return module.default as SiteConfig;
}

const siteConfig = await loadSiteConfig();
const forkName = Deno.env.get("FORK_NAME") ?? "CTV";

const config: Config = {
  mode: (Deno.env.get("MODE") as Config["mode"]) ?? "fake",

  server: {
    host: Deno.env.get("SERVER_HOST") ?? "127.0.0.1",
    port: parseInt(Deno.env.get("SERVER_PORT") ?? "8000", 10),
  },

  bitcoinRpc: {
    server: Deno.env.get("BITCOIN_RPC_SERVER") ?? "http://127.0.0.1:8332",
    user: Deno.env.get("BITCOIN_RPC_USER") ?? "",
    password: Deno.env.get("BITCOIN_RPC_PASSWORD") ?? "",
  },

  fork: {
    name: forkName,
    info: siteConfig.fork?.info ?? [],
    versionBit: parseInt(Deno.env.get("FORK_VERSION_BIT") ?? "2", 10),
    threshold: parseInt(Deno.env.get("FORK_THRESHOLD") ?? "1815", 10),
    status: (Deno.env.get("FORK_STATUS") as Config["fork"]["status"]) ??
      "started",
    activationHeight: parseInt(
      Deno.env.get("FORK_ACTIVATION_HEIGHT") ?? "709632",
      10,
    ),
    showActivationCountdown:
      Deno.env.get("FORK_SHOW_ACTIVATION_COUNTDOWN") === "true",
    showCelebrationConfetti:
      Deno.env.get("FORK_SHOW_CELEBRATION_CONFETTI") === "true",
  },

  frontend: {
    autoRefreshInterval: parseAutoRefreshInterval(
      Deno.env.get("FRONTEND_AUTO_REFRESH_INTERVAL"),
    ),
    twitterHandle: Deno.env.get("FRONTEND_TWITTER_HANDLE") ?? "",
    celebrate: siteConfig.frontend?.celebrate,
    about: siteConfig.frontend?.about,
    sponsors: siteConfig.frontend?.sponsors ?? [],
  },

  donation: Deno.env.get("DONATION_LND_SERVER")
    ? {
      type: "lnd",
      description: siteConfig.donation?.description ??
        `Donation to ${forkName} activation explorer`,
      data: {
        server: Deno.env.get("DONATION_LND_SERVER") ?? "https://127.0.0.1:8080",
        cert: Deno.env.get("DONATION_LND_CERT") ?? "/path/to/tls.cert",
        macaroon: Deno.env.get("DONATION_LND_MACAROON") ??
          "/path/to/invoice.macaroon",
        lightningNodeUri: Deno.env.get("DONATION_LND_NODE_URI"),
      },
      lnurlPayUrl: Deno.env.get("DONATION_LNURL_PAY_URL") ??
        "https://domain.com/invoice",
    }
    : undefined,
};

// Only this explicitly selected subset may be passed to browser islands. Keep
// RPC credentials, macaroon paths, and TLS certificate paths server-side.
const clientConfig: ClientConfig = {
  fork: {
    name: config.fork.name,
    threshold: config.fork.threshold,
    status: config.fork.status,
    activationHeight: config.fork.activationHeight,
    showActivationCountdown: config.fork.showActivationCountdown,
    showCelebrationConfetti: config.fork.showCelebrationConfetti,
  },
  frontend: {
    autoRefreshInterval: config.frontend.autoRefreshInterval,
    twitterHandle: config.frontend.twitterHandle,
    celebrate: config.frontend.celebrate,
  },
  donation: config.donation
    ? {
      lnurlPayUrl: config.donation.lnurlPayUrl,
      lightningNodeUri: config.donation.data.lightningNodeUri,
    }
    : undefined,
};

export default config;
export { clientConfig };
export type { Config };
